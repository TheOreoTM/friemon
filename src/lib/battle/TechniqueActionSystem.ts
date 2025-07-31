import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import { BattleMessageCache } from './BattleMessageCache';
import { BattleSession } from './BattleManager';

export interface TechniqueActionContext {
	attacker: Character;
	target: Character;
	technique: Technique;
	session: BattleSession;
	messageCache: BattleMessageCache;
	isPlayer1Attacker: boolean;
}

export type TechniqueActionFunction = (context: TechniqueActionContext) => void;

export interface CustomTechniqueAction {
	name: string;
	description: string;
	actionFunction: TechniqueActionFunction;
}

export class TechniqueActionSystem {
	private static customActions: Map<string, CustomTechniqueAction> = new Map();

	/**
	 * Register a custom technique action
	 */
	static registerCustomAction(techniqueName: string, action: CustomTechniqueAction): void {
		this.customActions.set(techniqueName, action);
	}

	/**
	 * Execute a technique with custom actions and detailed messages
	 */
	static executeTechnique(context: TechniqueActionContext): void {
		const { attacker, target, technique, session } = context;
		
		// Get character names with player display names
		const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
		const targetName = session.interface.formatCharacterWithPlayer(target, session);

		// Check for custom action
		const customAction = this.customActions.get(technique.name);
		if (customAction) {
			// Execute custom technique action
			customAction.actionFunction(context);
			return;
		}

		// Default technique execution with enhanced messages
		this.executeDefaultTechnique(context, attackerName, targetName);
	}

	/**
	 * Default technique execution with detailed messages
	 */
	private static executeDefaultTechnique(context: TechniqueActionContext, attackerName: string, targetName: string): void {
		const { attacker, target, technique, messageCache } = context;

		// Technique use message
		messageCache.pushTechniqueUse(attackerName, technique.name, targetName);

		// Consume mana with message
		if (technique.manaCost > 0) {
			attacker.consumeMana(technique.manaCost);
			messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);
		}

		// Calculate and apply damage
		if (technique.power > 0) {
			const damage = this.calculateDamage(attacker, target, technique);
			if (damage > 0) {
				const oldHP = target.currentHP;
				target.takeDamage(damage);
				messageCache.pushDamage(attackerName, targetName, damage, target.currentHP);

				// Check for defeat
				if (target.currentHP <= 0 && oldHP > 0) {
					messageCache.push(`💀 **${targetName} is defeated!**`);
				}
			} else {
				messageCache.push(`${targetName} takes no damage!`);
			}
		}

		// Apply effects
		if (technique.effects && technique.effects.length > 0) {
			this.applyTechniqueEffects(context, attackerName, targetName);
		}

		// Check for passive ability triggers
		this.checkPassiveAbilities(context, attackerName, targetName);
	}

	/**
	 * Calculate damage with detailed formula
	 */
	private static calculateDamage(attacker: Character, target: Character, technique: Technique): number {
		const attackerStats = attacker.getEffectiveStats();
		const targetStats = target.getEffectiveStats();

		let baseDamage: number;
		
		// Determine attack type and base damage
		if (technique.affinity.includes('Physical')) {
			baseDamage = attackerStats.attack - targetStats.defense;
		} else {
			baseDamage = attackerStats.magicAttack - targetStats.magicDefense;
		}

		// Apply technique power multiplier
		baseDamage = baseDamage * (technique.power / 100);

		// Apply random variance (85-115%)
		const variance = 0.85 + Math.random() * 0.3;
		baseDamage *= variance;

		// Apply type effectiveness (could be expanded)
		const effectiveness = this.getTypeEffectiveness(technique.affinity, target.races);
		baseDamage *= effectiveness;

		// Ensure minimum damage
		return Math.max(1, Math.floor(baseDamage));
	}

	/**
	 * Get type effectiveness multiplier
	 */
	private static getTypeEffectiveness(attackType: string, defenderRaces: string[]): number {
		// Basic type effectiveness - can be expanded
		const effectiveness: { [key: string]: { [key: string]: number } } = {
			'Elemental_Fire': { 'Elf': 1.2, 'Undead': 1.3, 'Dragon': 0.8 },
			'Elemental_Water': { 'Fire': 1.2, 'Earth': 1.1, 'Dragon': 0.9 },
			'Elemental_Wind': { 'Earth': 1.2, 'Flying': 1.1 },
			'Elemental_Earth': { 'Wind': 1.2, 'Electric': 1.1 },
			'Physical': { 'Spirit': 0.5, 'Demon': 1.1 },
			'Light': { 'Demon': 1.3, 'Undead': 1.4, 'Dark': 1.2 },
			'Dark': { 'Light': 1.2, 'Human': 1.1, 'Elf': 1.1 }
		};

		let multiplier = 1.0;
		const typeEffects = effectiveness[attackType];
		
		if (typeEffects) {
			for (const race of defenderRaces) {
				if (typeEffects[race]) {
					multiplier *= typeEffects[race];
				}
			}
		}

		return multiplier;
	}

	/**
	 * Apply technique effects with messages
	 */
	private static applyTechniqueEffects(context: TechniqueActionContext, _attackerName: string, _targetName: string): void {
		const { technique, messageCache } = context;
		
		// This would be expanded based on the actual effect system
		messageCache.push(`✨ **${technique.name}** applies additional effects!`);
	}

	/**
	 * Check and trigger passive abilities
	 */
	private static checkPassiveAbilities(context: TechniqueActionContext, _attackerName: string, _targetName: string): void {
		const { attacker, target } = context;

		// Check attacker's passive abilities
		this.checkCharacterPassives(attacker, context, true);
		
		// Check target's passive abilities
		this.checkCharacterPassives(target, context, false);
	}

	/**
	 * Check a character's passive abilities
	 */
	private static checkCharacterPassives(character: Character, context: TechniqueActionContext, isAttacker: boolean): void {
		const characterName = context.session.interface.formatCharacterWithPlayer(character, context.session);
		
		// Example passive checks - these would be based on actual character data
		if (character.name === 'Fern') {
			this.checkFernPassives(character, characterName, context, isAttacker);
		} else if (character.name === 'Frieren') {
			this.checkFrierenPassives(character, characterName, context, isAttacker);
		} else if (character.name === 'Stark') {
			this.checkStarkPassives(character, characterName, context, isAttacker);
		}
		// Add more character-specific passives as needed
	}

	/**
	 * Fern's passive abilities
	 */
	private static checkFernPassives(character: Character, characterName: string, context: TechniqueActionContext, isAttacker: boolean): void {
		const { messageCache } = context;

		// Prodigial Talent - chance to recover mana after using techniques
		if (isAttacker && Math.random() < 0.3) {
			const manaRecovered = Math.floor(character.maxMana * 0.1);
			character.restoreMana(manaRecovered);
			messageCache.pushPassiveTrigger(
				characterName,
				'Prodigial Talent',
				`Fern's exceptional magical control allows her to recover ${manaRecovered} MP!`
			);
		}

		// Quick Learner - chance to reduce technique costs
		if (isAttacker && Math.random() < 0.2) {
			messageCache.pushPassiveTrigger(
				characterName,
				'Quick Learner',
				'Fern adapts quickly, making her next technique more efficient!'
			);
		}
	}

	/**
	 * Frieren's passive abilities
	 */
	private static checkFrierenPassives(character: Character, characterName: string, context: TechniqueActionContext, isAttacker: boolean): void {
		const { messageCache } = context;

		// Ancient Magic Mastery - bonus damage on magic techniques
		if (isAttacker && context.technique.affinity.includes('Elemental')) {
			messageCache.pushPassiveTrigger(
				characterName,
				'Ancient Magic Mastery',
				'Frieren\'s millennia of experience enhances her magical techniques!'
			);
		}

		// Immortal Patience - defense boost when low on HP
		if (character.currentHP < character.maxHP * 0.3) {
			messageCache.pushPassiveTrigger(
				characterName,
				'Immortal Patience',
				'Frieren\'s calm demeanor provides defensive bonuses when endangered!'
			);
		}
	}

	/**
	 * Stark's passive abilities
	 */
	private static checkStarkPassives(character: Character, characterName: string, context: TechniqueActionContext, isAttacker: boolean): void {
		const { messageCache } = context;

		// Warrior's Resolve - attack bonus when low on HP
		if (isAttacker && character.currentHP < character.maxHP * 0.4) {
			messageCache.pushPassiveTrigger(
				characterName,
				'Warrior\'s Resolve',
				'Stark fights harder when backed into a corner!'
			);
		}

		// Counter Strike - chance to counter physical attacks
		if (!isAttacker && context.technique.affinity.includes('Physical') && Math.random() < 0.25) {
			const counterDamage = Math.floor(character.getEffectiveStats().attack * 0.5);
			context.attacker.takeDamage(counterDamage);
			messageCache.push(`⚔️ **${characterName} counters for ${counterDamage} damage!**`);
		}
	}

	/**
	 * Create a stat adjustment function similar to your TCG system
	 */
	static adjustStat(character: Character, stat: string, adjustment: number, messageCache: BattleMessageCache, session: BattleSession): boolean {
		const characterName = session.interface.formatCharacterWithPlayer(character, session);
		const oldValue = this.getStatValue(character, stat);
		const newValue = Math.max(1, oldValue + adjustment); // Minimum stat value of 1
		
		if (this.setStatValue(character, stat, newValue)) {
			messageCache.pushStatChange(characterName, stat, adjustment, newValue);
			return true;
		} else {
			messageCache.push(`${characterName}'s ${stat} failed to change! The effect failed!`);
			return false;
		}
	}

	/**
	 * Get stat value by name
	 */
	private static getStatValue(character: Character, stat: string): number {
		const stats = character.getEffectiveStats();
		switch (stat.toLowerCase()) {
			case 'attack': return stats.attack;
			case 'defense': return stats.defense;
			case 'magic attack': return stats.magicAttack;
			case 'magic defense': return stats.magicDefense;
			case 'speed': return stats.speed;
			case 'hp': return character.currentHP;
			case 'mp':
			case 'mana': return character.currentMana;
			default: return 0;
		}
	}

	/**
	 * Set stat value by name
	 */
	private static setStatValue(character: Character, stat: string, value: number): boolean {
		// This would need to be implemented in the Character class
		// For now, returning true as placeholder
		switch (stat.toLowerCase()) {
			case 'hp':
				character.currentHP = Math.min(value, character.maxHP);
				return true;
			case 'mp':
			case 'mana':
				character.currentMana = Math.min(value, character.maxMana);
				return true;
			default:
				// For other stats, we'd need to implement a temporary stat boost system
				return true;
		}
	}
}