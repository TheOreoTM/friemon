import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import { AmbientMagicCondition, TerrainType, TechniqueCategory, CombatCondition, Affinity, TechniqueEffectType } from '../types/enums';
import { BattleState } from '../types/interfaces';
import { TechniqueEffect } from '../character/TechniqueEffect';
import { HazardType, TeamPosition } from '../types/types';
import { getAffinityAdvantage } from '../data/AffinityChart';
import { randomFloat } from '../util/utils';
import { TeamManager } from './TeamManager';

export class Battle {
	public state: BattleState;
	private battleLog: string[] = [];
	private turnActions: Map<string, { action: string; target?: string }> = new Map();
	public userTeam: TeamManager;
	public opponentTeam: TeamManager;
	private player1DisplayName: string;
	private player2DisplayName: string;

	constructor(
		userParty: Character[],
		opponentParty: Character[],
		ambientMagic: AmbientMagicCondition = AmbientMagicCondition.None,
		terrain: TerrainType = TerrainType.Normal,
		player1DisplayName: string,
		player2DisplayName: string
	) {
		// Validate parties
		if (!this.validateParty(userParty)) {
			throw new Error('Invalid user party: must have 1-3 valid characters');
		}
		if (!this.validateParty(opponentParty)) {
			throw new Error('Invalid opponent party: must have 1-3 valid characters');
		}

		this.state = {
			userCharacter: userParty[0],
			opponentCharacter: opponentParty[0],
			userParty,
			opponentParty,
			userActiveIndex: 0,
			opponentActiveIndex: 0,
			ambientMagic,
			terrain,
			turn: 1,
			userHazards: new Map<string, number>(),
			opponentHazards: new Map<string, number>()
		};

		this.userTeam = new TeamManager(userParty, 0);
		this.opponentTeam = new TeamManager(opponentParty, 0);
		this.player1DisplayName = player1DisplayName;
		this.player2DisplayName = player2DisplayName;

		this.initializeBattle();
	}

	private validateParty(party: Character[]): boolean {
		if (!party || party.length === 0 || party.length > 3) {
			return false;
		}

		return party.every(
			(character) =>
				character && typeof character.name === 'string' && character.maxHP > 0 && character.techniques && character.techniques.length > 0
		);
	}

	private initializeBattle(): void {
		// Reset both characters to battle state
		this.state.userCharacter.initialize();
		this.state.opponentCharacter.initialize();

		// Trigger trait effects for entering field
		if (this.state.userCharacter.trait.onEnterField) {
			this.state.userCharacter.trait.onEnterField(this.state.userCharacter, this.state.opponentCharacter, this);
		}

		if (this.state.opponentCharacter.trait.onEnterField) {
			this.state.opponentCharacter.trait.onEnterField(this.state.opponentCharacter, this.state.userCharacter, this);
		}

		this.logMessage(`Battle begins! ${this.state.userCharacter.name} vs ${this.state.opponentCharacter.name}!`);
	}

	public executeTechniqueWithTargeting(user: Character, technique: Technique, selectedTarget?: Character): boolean {
		const isUserTeam = this.userTeam.findCharacter(user) !== -1;
		const userTeam = isUserTeam ? this.userTeam : this.opponentTeam;
		const opponentTeam = isUserTeam ? this.opponentTeam : this.userTeam;

		let targets: Character[] = [];

		if (technique.targetType === 'chooseTarget' && selectedTarget) {
			// Manual target selection - use the selected target
			if (userTeam.validateTarget(technique.targetType, selectedTarget, opponentTeam)) {
				targets = [selectedTarget];
			}
		} else {
			// Automatic targeting based on technique type
			targets = userTeam.getTargets(technique.targetType, opponentTeam, technique.multiTargetCount);
		}

		if (targets.length === 0) {
			this.logMessage(`${technique.name} failed - no valid targets!`);
			return false;
		}

		// Log different messages based on targeting type
		if (technique.targetType === 'multiTarget') {
			this.logMessage(`${technique.name} hits ${targets.length} target${targets.length > 1 ? 's' : ''}!`);
		} else if (technique.targetType === 'allEnemies') {
			this.logMessage(`${technique.name} hits all enemies!`);
		}

		let success = true;
		for (const target of targets) {
			const result = this.executeTechnique(user, target, technique);
			if (!result) success = false;
		}

		return success;
	}

	public executeTechnique(user: Character, target: Character, technique: Technique): boolean {
		// Validate technique execution
		const validationResult = this.validateTechniqueExecution(user, target, technique);
		if (!validationResult.valid) {
			this.logMessage(validationResult.message);
			return false;
		}

		// Consume mana
		if (!user.consumeMana(technique.manaCost)) {
			this.logMessage(`${user.name} doesn't have enough mana to use ${technique.name}!`);
			return false;
		}

		this.logMessage(`${user.name} uses ${technique.name}!`);

		// Apply pre-technique effects
		this.applyPreTechniqueEffects(user, target, technique);

		// Handle technique effects
		if (technique.effects) {
			for (const effect of technique.effects) {
				this.applyTechniqueEffect(user, target, technique, effect);
			}
		}

		// Apply damage if it's a damaging technique
		if (technique.power > 0) {
			const damage = this.calculateDamage(user, target, technique);
			this.dealDamage(user, target, damage, technique);
		}

		// Apply post-technique effects
		this.applyPostTechniqueEffects(user, target, technique);

		return true;
	}

	private validateTechniqueExecution(user: Character, target: Character, technique: Technique): { valid: boolean; message: string } {
		if (user.isDefeated()) {
			return { valid: false, message: `${user.name} is defeated and cannot act!` };
		}

		if (!user.canAct()) {
			return { valid: false, message: `${user.name} cannot act due to their condition!` };
		}

		if (target.isDefeated()) {
			return { valid: false, message: `${target.name} is already defeated!` };
		}

		if (user.currentMana < technique.manaCost) {
			return { valid: false, message: `${user.name} doesn't have enough mana to use ${technique.name}!` };
		}

		return { valid: true, message: '' };
	}

	private applyPreTechniqueEffects(user: Character, target: Character, _technique: Technique): void {
		// Trigger user's trait effects before striking
		if (user.trait.onStrike) {
			user.trait.onStrike(user, target, this);
		}

		// Equipment pre-strike effects would go here when implemented
		// if (user.equipment?.onStrike) {
		//   user.equipment.onStrike(user, target, this);
		// }
	}

	private applyPostTechniqueEffects(user: Character, _target: Character, _technique: Technique): void {
		// Apply recoil damage if technique has it (would need to add recoilPercent to Technique interface)
		// if (technique.recoilPercent && technique.recoilPercent > 0) {
		//   const recoilDamage = Math.floor(user.maxHP * (technique.recoilPercent / 100));
		//   user.takeDamage(recoilDamage);
		//   this.logMessage(`${user.name} takes ${recoilDamage} recoil damage!`);
		// }

		// Placeholder for post-technique effects
		void user; // Prevent unused parameter warning
	}

	private calculateDamage(user: Character, target: Character, technique: Technique): number {
		const userStats = user.getEffectiveStats();
		const targetStats = target.getEffectiveStats();

		let attack: number;
		let defense: number;

		if (technique.category === TechniqueCategory.Physical) {
			attack = userStats.attack;
			defense = targetStats.defense;
		} else if (technique.category === TechniqueCategory.Magical) {
			attack = userStats.magicAttack;
			defense = targetStats.magicDefense;
		} else {
			return 0; // Support techniques don't deal damage
		}

		// Base damage calculation
		let damage = Math.floor(((2 * user.level + 10) * technique.power * attack) / (250 * defense)) + 2;

		// Apply affinity effectiveness
		if (technique.affinity) {
			const effectiveness = this.getAffinityEffectiveness(technique.affinity, target);
			damage = Math.floor(damage * effectiveness);
		}

		// Apply race-based affinity bonus
		if (technique.affinity) {
			const raceBonus = getAffinityAdvantage(technique.affinity, target.races);
			damage = Math.floor(damage * raceBonus);
		}

		// Apply trait modifiers
		if (user.trait.damageOutputMultiplier) {
			const multiplier = user.trait.damageOutputMultiplier(user, target, technique);
			damage = Math.floor(damage * multiplier);
		}

		if (user.equipment && user.equipment.damageOutputMultiplier) {
			const multiplier = user.equipment.damageOutputMultiplier(user, target, technique);
			damage = Math.floor(damage * multiplier);
		}

		// Apply critical hit
		const critChance = user.getCriticalStrikeChance();
		if (Math.random() < critChance) {
			damage = Math.floor(damage * 1.5);
			this.logMessage("It's a critical hit!");
		}

		// Apply random factor (85-100%)
		damage = Math.floor(damage * randomFloat(0.85, 1.0));

		// Ambient magic effects
		if (this.state.ambientMagic === AmbientMagicCondition.DenseMana && technique.category === TechniqueCategory.Magical) {
			damage = Math.floor(damage * 1.2);
		} else if (this.state.ambientMagic === AmbientMagicCondition.NullField && technique.category === TechniqueCategory.Magical) {
			damage = Math.floor(damage * 0.5);
		}

		return Math.max(1, damage);
	}

	private getAffinityEffectiveness(_techniqueAffinity: Affinity, _target: Character): number {
		// Check if target has any affinities that interact with this technique
		// This would need to be expanded based on how character affinities are determined
		// For now, return neutral effectiveness
		return 1.0;
	}

	private dealDamage(user: Character, target: Character, damage: number, _technique: Technique): void {
		// Apply trait damage reduction
		if (target.trait.onReceiveDamage) {
			damage = target.trait.onReceiveDamage(target, user, this, damage);
		}

		target.takeDamage(damage);

		this.logMessage(`${target.name} takes ${damage} damage!`);

		if (target.isDefeated()) {
			this.logMessage(`${target.name} is defeated!`);
			this.handleCharacterDefeat(target);
		}
	}

	private applyTechniqueEffect(user: Character, target: Character, _technique: Technique, effect: TechniqueEffect): void {
		// Check if effect condition is met
		if (effect.condition && !effect.condition(user, target, this)) {
			return;
		}

		// Check if effect activates based on chance
		if (Math.random() > effect.chance) {
			return;
		}

		switch (effect.type) {
			case TechniqueEffectType.Condition:
				this.applyCondition(target, effect.value as CombatCondition);
				break;
			case TechniqueEffectType.Heal:
				const healAmount = Math.floor(target.maxHP * (effect.value as number));
				target.heal(healAmount);
				this.logMessage(`${target.name} recovers ${healAmount} HP!`);
				break;
			case TechniqueEffectType.StatBoost:
				const statData = effect.value as { stat: string; stages: number };
				const { stat, stages } = statData;
				target.modifyStatBoost(stat as any, stages);
				this.logMessage(`${target.name}'s ${stat} ${stages > 0 ? 'rose' : 'fell'}!`);
				break;
		}
	}

	private applyCondition(target: Character, condition: CombatCondition): void {
		if (target.trait.preventCondition && target.trait.preventCondition(target, condition)) {
			this.logMessage(`${target.name}'s trait prevents the condition!`);
			return;
		}

		target.addCondition(condition, 3); // Default duration of 3 turns

		const conditionNames = {
			[CombatCondition.Exhausted]: 'exhausted',
			[CombatCondition.Stunned]: 'stunned',
			[CombatCondition.Confused]: 'confused',
			[CombatCondition.Frenzied]: 'frenzied',
			[CombatCondition.Charmed]: 'charmed',
			[CombatCondition.Dazed]: 'dazed',
			[CombatCondition.Fear]: 'fearful',
			[CombatCondition.MagicSeal]: 'magic sealed',
			[CombatCondition.Normal]: 'normal'
		};

		this.logMessage(`${target.name} becomes ${conditionNames[condition]}!`);
	}

	// private setHazard(side: 'user' | 'opponent', hazardType: HazardType): void {
	//   const hazardMap = side === 'user' ? this.state.userHazards : this.state.opponentHazards;
	//   const currentLayers = hazardMap.get(hazardType) || 0;
	//   hazardMap.set(hazardType, Math.min(currentLayers + 1, 3)); // Max 3 layers
	//
	//   this.logMessage(`${hazardType.replace('_', ' ')} was set on the ${side} side!`);
	// }

	private handleCharacterDefeat(character: Character): void {
		// Trigger trait effects for mana restoration on KO
		const opponent = character === this.state.userCharacter ? this.state.opponentCharacter : this.state.userCharacter;

		if (opponent.trait.manaRestoreOnKO) {
			const restored = opponent.trait.manaRestoreOnKO(opponent, this);
			opponent.restoreMana(restored);
			if (restored > 0) {
				this.logMessage(`${opponent.name} restored ${restored} mana!`);
			}
		}

		// Auto-switch to next available character if defeated character is active
		if (character === this.state.userCharacter) {
			this.autoSwitchCharacter(true);
		} else if (character === this.state.opponentCharacter) {
			this.autoSwitchCharacter(false);
		}
	}

	public switchCharacter(isUser: boolean, newIndex: number): boolean {
		const party = isUser ? this.state.userParty : this.state.opponentParty;
		const team = isUser ? this.userTeam : this.opponentTeam;

		// Validate switch
		if (!this.validateSwitch(party, newIndex)) {
			return false;
		}

		const newCharacter = party[newIndex];
		const currentCharacter = isUser ? this.state.userCharacter : this.state.opponentCharacter;

		// Update team manager
		team.switchToIndex(newIndex);

		if (isUser) {
			this.logMessage(`${currentCharacter.name}, return!`);
			this.state.userCharacter = newCharacter;
			this.state.userActiveIndex = newIndex;
		} else {
			this.logMessage(`${this.state.opponentCharacter.name}, return!`);
			this.state.opponentCharacter = newCharacter;
			this.state.opponentActiveIndex = newIndex;
		}

		this.logMessage(`Go, ${newCharacter.name}!`);

		// Trigger entering field effects
		if (newCharacter.trait.onEnterField) {
			const opponent = isUser ? this.state.opponentCharacter : this.state.userCharacter;
			newCharacter.trait.onEnterField(newCharacter, opponent, this);
		}

		return true;
	}

	private validateSwitch(party: Character[], newIndex: number): boolean {
		if (newIndex < 0 || newIndex >= party.length) {
			return false;
		}

		const character = party[newIndex];
		return character && !character.isDefeated();
	}

	public processTurnEnd(): void {
		// Apply condition damage
		this.applyConditionDamage();

		// Update conditions
		this.updateConditions();

		// Trigger turn end effects
		this.processTurnEndEffects();

		// Apply hazard damage
		this.applyHazardDamage();

		// Restore mana based on ambient magic
		this.processAmbientMagicEffects();

		// Check for forced switches due to defeated characters
		this.handleDefeatedCharacters();

		// Increment turn counter
		this.state.turn++;

		// Clear turn actions for next turn
		this.turnActions.clear();

		// Start next turn if battle is not complete
		if (!this.isComplete()) {
			this.logMessage(`=== Turn ${this.state.turn} begins ===`);
		}
	}

	private applyConditionDamage(): void {
		if (this.state.userCharacter.hasAnyCondition()) {
			this.state.userCharacter.applyConditionDamage();
		}
		if (this.state.opponentCharacter.hasAnyCondition()) {
			this.state.opponentCharacter.applyConditionDamage();
		}
	}

	private updateConditions(): void {
		this.state.userCharacter.updateCondition();
		this.state.opponentCharacter.updateCondition();
	}

	private processTurnEndEffects(): void {
		// User character trait effects
		if (this.state.userCharacter.trait.onTurnEnd) {
			this.state.userCharacter.trait.onTurnEnd(this.state.userCharacter, this);
		}

		// Opponent character trait effects
		if (this.state.opponentCharacter.trait.onTurnEnd) {
			this.state.opponentCharacter.trait.onTurnEnd(this.state.opponentCharacter, this);
		}

		// Equipment effects
		if (this.state.userCharacter.equipment?.onTurnEnd) {
			this.state.userCharacter.equipment.onTurnEnd(this.state.userCharacter, this);
		}

		if (this.state.opponentCharacter.equipment?.onTurnEnd) {
			this.state.opponentCharacter.equipment.onTurnEnd(this.state.opponentCharacter, this);
		}
	}

	private processAmbientMagicEffects(): void {
		if (this.state.ambientMagic === AmbientMagicCondition.DenseMana) {
			this.state.userCharacter.restoreMana(5);
			this.state.opponentCharacter.restoreMana(5);
			this.logMessage('Dense mana in the air restores mana to both fighters!');
		} else if (this.state.ambientMagic === AmbientMagicCondition.NullField) {
			// Reduce mana by 2 each turn in null field
			this.state.userCharacter.consumeMana(2);
			this.state.opponentCharacter.consumeMana(2);
			this.logMessage('The null field drains mana from both fighters!');
		}
	}

	private handleDefeatedCharacters(): void {
		if (this.state.userCharacter.isDefeated() && !this.isUserDefeated()) {
			this.autoSwitchCharacter(true);
		}
		if (this.state.opponentCharacter.isDefeated() && !this.isOpponentDefeated()) {
			this.autoSwitchCharacter(false);
		}
	}

	private applyHazardDamage(): void {
		// Apply hazards to user side
		for (const [hazardType, layers] of this.state.userHazards) {
			const damage = this.calculateHazardDamage(hazardType as HazardType, layers);
			if (damage > 0) {
				this.state.userCharacter.takeDamage(damage);
				this.logMessage(`${this.state.userCharacter.name} is hurt by ${hazardType.replace('_', ' ')}!`);
			}
		}

		// Apply hazards to opponent side
		for (const [hazardType, layers] of this.state.opponentHazards) {
			const damage = this.calculateHazardDamage(hazardType as HazardType, layers);
			if (damage > 0) {
				this.state.opponentCharacter.takeDamage(damage);
				this.logMessage(`${this.state.opponentCharacter.name} is hurt by ${hazardType.replace('_', ' ')}!`);
			}
		}
	}

	private calculateHazardDamage(hazardType: HazardType, layers: number): number {
		switch (hazardType) {
			case 'mana_traps':
				return Math.floor(((layers * 12.5) / 100) * 50); // Base 50 HP for calculation
			case 'spiritual_spikes':
				return Math.floor(((layers * 12.5) / 100) * 50);
			case 'illusory_terrain':
				return Math.floor(((layers * 6.25) / 100) * 50);
			default:
				return 0;
		}
	}

	public isBattleOver(): boolean {
		return this.isUserDefeated() || this.isOpponentDefeated();
	}

	public isUserDefeated(): boolean {
		return this.state.userParty.every((character) => character.isDefeated());
	}

	public isOpponentDefeated(): boolean {
		return this.state.opponentParty.every((character) => character.isDefeated());
	}

	public getWinner(): 'user' | 'opponent' | null {
		if (this.isUserDefeated()) return 'opponent';
		if (this.isOpponentDefeated()) return 'user';
		return null;
	}

	public getWinnerName(): string {
		const winner = this.getWinner();
		if (winner === 'user') return this.player1DisplayName;
		if (winner === 'opponent') return this.player2DisplayName;
		return 'No winner yet';
	}

	public getBattleSummary(): string {
		const winner = this.getWinnerName();
		const turnCount = this.state.turn - 1; // Subtract 1 since turn increments at start
		const userCharactersLeft = this.state.userParty.filter((char) => !char.isDefeated()).length;
		const opponentCharactersLeft = this.state.opponentParty.filter((char) => !char.isDefeated()).length;

		return (
			`**Battle Summary**\n` +
			`• Winner: ${winner}\n` +
			`• Duration: ${turnCount} turns\n` +
			`• ${this.player1DisplayName} Characters Remaining: ${userCharactersLeft}/3\n` +
			`• ${this.player2DisplayName} Characters Remaining: ${opponentCharactersLeft}/3`
		);
	}

	public getBattleLog(): string[] {
		return [...this.battleLog];
	}

	public clearBattleLog(): void {
		this.battleLog = [];
	}

	private logMessage(message: string): void {
		if (message && typeof message === 'string') {
			this.battleLog.push(`[Turn ${this.state.turn}] ${message}`);

			// Limit battle log size to prevent memory issues
			if (this.battleLog.length > 100) {
				this.battleLog = this.battleLog.slice(-50); // Keep last 50 messages
			}
		}
	}

	// Environment effect methods
	public applyTerrainEffects(): void {
		switch (this.state.terrain) {
			case TerrainType.ForestCanopy:
				// Boost nature-based attacks
				break;
			case TerrainType.ObscuringMist:
				// Reduce accuracy
				break;
			case TerrainType.AncientRuins:
				// Boost magical techniques
				break;
			case TerrainType.DemonicGround:
				// Boost demonic aura techniques
				break;
		}
	}

	public getAvailableSwitches(isUser: boolean): Character[] {
		const party = isUser ? this.state.userParty : this.state.opponentParty;
		const activeIndex = isUser ? this.state.userActiveIndex : this.state.opponentActiveIndex;

		return party.filter((character, index) => index !== activeIndex && !character.isDefeated());
	}

	// Methods expected by the interface
	public getCurrentCharacter(): Character | null {
		// Return null if the current character is defeated and no auto-switch happened
		if (this.state.userCharacter.isDefeated()) {
			return null;
		}
		return this.state.userCharacter;
	}

	public getOpponentCharacter(): Character | null {
		// Return null if the opponent character is defeated and no auto-switch happened
		if (this.state.opponentCharacter.isDefeated()) {
			return null;
		}
		return this.state.opponentCharacter;
	}

	public isComplete(): boolean {
		return this.isBattleOver();
	}

	public getUserCharacters(): Character[] {
		return this.state.userParty;
	}

	public getOpponentCharacters(): Character[] {
		return this.state.opponentParty;
	}

	public addToBattleLog(message: string): void {
		this.logMessage(message);
	}

	public getBattleState(): BattleState {
		return this.state;
	}

	public validateBattleState(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Check if battle state is consistent
		if (!this.state.userCharacter || !this.state.opponentCharacter) {
			errors.push('Missing active characters');
		}

		if (this.state.userActiveIndex < 0 || this.state.userActiveIndex >= this.state.userParty.length) {
			errors.push('Invalid user active index');
		}

		if (this.state.opponentActiveIndex < 0 || this.state.opponentActiveIndex >= this.state.opponentParty.length) {
			errors.push('Invalid opponent active index');
		}

		if (this.state.userParty[this.state.userActiveIndex] !== this.state.userCharacter) {
			errors.push('User active character mismatch');
		}

		if (this.state.opponentParty[this.state.opponentActiveIndex] !== this.state.opponentCharacter) {
			errors.push('Opponent active character mismatch');
		}

		if (this.state.turn < 1) {
			errors.push('Invalid turn number');
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}

	public nextTurn(): void {
		this.processTurnEnd();
	}

	public endBattle(winner: 'user' | 'opponent'): void {
		if (!winner || (winner !== 'user' && winner !== 'opponent')) {
			throw new Error('Invalid winner specified');
		}

		this.logMessage(`Battle ended! Winner: ${winner === 'user' ? this.player1DisplayName : this.player2DisplayName}`);

		// Force end the battle by defeating all characters of the losing side
		if (winner === 'opponent') {
			this.state.userParty.forEach((char) => {
				if (!char.isDefeated()) {
					char.takeDamage(char.currentHP);
				}
			});
		} else {
			this.state.opponentParty.forEach((char) => {
				if (!char.isDefeated()) {
					char.takeDamage(char.currentHP);
				}
			});
		}
	}

	public switchCharacterByObject(character: Character): boolean {
		if (!character) {
			return false;
		}

		// Find which party the character belongs to and switch to it
		const userIndex = this.state.userParty.findIndex((char) => char === character);
		if (userIndex !== -1) {
			return this.switchCharacter(true, userIndex);
		}

		const opponentIndex = this.state.opponentParty.findIndex((char) => char === character);
		if (opponentIndex !== -1) {
			return this.switchCharacter(false, opponentIndex);
		}

		return false;
	}

	public switchToPosition(isUser: boolean, position: TeamPosition): boolean {
		const team = isUser ? this.userTeam : this.opponentTeam;
		const success = team.switchToPosition(position);

		if (success) {
			const newCharacter = team.getActiveCharacter()!;
			const currentCharacter = isUser ? this.state.userCharacter : this.state.opponentCharacter;

			if (isUser) {
				this.logMessage(`${currentCharacter.name}, return!`);
				this.state.userCharacter = newCharacter;
				this.state.userActiveIndex = team.getActiveIndex();
			} else {
				this.logMessage(`${currentCharacter.name}, return!`);
				this.state.opponentCharacter = newCharacter;
				this.state.opponentActiveIndex = team.getActiveIndex();
			}

			this.logMessage(`Go, ${newCharacter.name}!`);

			if (newCharacter.trait.onEnterField) {
				const opponent = isUser ? this.state.opponentCharacter : this.state.userCharacter;
				newCharacter.trait.onEnterField(newCharacter, opponent, this);
			}
		}

		return success;
	}

	public getCharacterAtPosition(isUser: boolean, position: TeamPosition): Character | null {
		const team = isUser ? this.userTeam : this.opponentTeam;
		return team.getPosition(position);
	}

	public getAvailableTargets(technique: Technique, isUserTechnique: boolean): Character[] {
		const userTeam = isUserTechnique ? this.userTeam : this.opponentTeam;
		const opponentTeam = isUserTechnique ? this.opponentTeam : this.userTeam;
		return userTeam.getTargets(technique.targetType, opponentTeam);
	}

	public requiresTargetSelection(technique: Technique): boolean {
		return this.userTeam.requiresTargetSelection(technique.targetType);
	}

	private autoSwitchCharacter(isUser: boolean): boolean {
		const team = isUser ? this.userTeam : this.opponentTeam;
		const success = team.autoSwitchToNext();

		if (success) {
			const newCharacter = team.getActiveCharacter()!;

			if (isUser) {
				this.state.userCharacter = newCharacter;
				this.state.userActiveIndex = team.getActiveIndex();
			} else {
				this.state.opponentCharacter = newCharacter;
				this.state.opponentActiveIndex = team.getActiveIndex();
			}

			this.logMessage(`${newCharacter.name} was automatically sent out!`);

			if (newCharacter.trait.onEnterField) {
				const opponent = isUser ? this.state.opponentCharacter : this.state.userCharacter;
				newCharacter.trait.onEnterField(newCharacter, opponent, this);
			}

			return true;
		}

		const playerName = isUser ? this.player1DisplayName : this.player2DisplayName;
		this.logMessage(`${playerName} has no more characters able to battle!`);
		return false;
	}

	public canPlayerAct(isUser: boolean): boolean {
		const character = isUser ? this.state.userCharacter : this.state.opponentCharacter;
		return !character.isDefeated() && character.canAct();
	}

	public getPlayerActionOptions(isUser: boolean): { attacks: string[]; switches: string[]; canFlee: boolean } {
		const character = isUser ? this.state.userCharacter : this.state.opponentCharacter;
		const party = isUser ? this.state.userParty : this.state.opponentParty;
		const activeIndex = isUser ? this.state.userActiveIndex : this.state.opponentActiveIndex;

		const attacks = character.isDefeated()
			? []
			: character.techniques.filter((technique) => character.currentMana >= technique.manaCost).map((technique) => technique.name);

		const switches = party
			.map((char, index) => ({ char, index }))
			.filter(({ char, index }) => index !== activeIndex && !char.isDefeated())
			.map(({ char }) => char.name);

		return {
			attacks,
			switches,
			canFlee: true // Players can always attempt to flee
		};
	}

	public getTeamStatus(isUser: boolean): string {
		const team = isUser ? this.userTeam : this.opponentTeam;
		return team.getTeamStatus();
	}

	public getPositionSwitchOptions(isUser: boolean): { position: TeamPosition; character: Character }[] {
		const team = isUser ? this.userTeam : this.opponentTeam;
		return team.getAvailableSwitches().map((char) => ({
			position: (team.findCharacter(char) + 1) as TeamPosition,
			character: char
		}));
	}
}
