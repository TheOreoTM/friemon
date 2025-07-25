import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import { AmbientMagicCondition, TerrainType, TechniqueCategory, CombatCondition, Affinity } from '../types/enums';
import { BattleState, TechniqueEffect } from '../types/interfaces';
import { HazardType } from '../types/types';
import { getAffinityAdvantage } from '../data/AffinityChart';
import { randomFloat } from '../utils/helpers';

export class Battle {
  public state: BattleState;
  private battleLog: string[] = [];
  
  constructor(
    userParty: Character[],
    opponentParty: Character[],
    ambientMagic: AmbientMagicCondition = AmbientMagicCondition.None,
    terrain: TerrainType = TerrainType.Normal
  ) {
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
    
    this.initializeBattle();
  }

  private initializeBattle(): void {
    // Reset both characters to battle state
    this.state.userCharacter.initialize();
    this.state.opponentCharacter.initialize();
    
    // Trigger trait effects for entering field
    if (this.state.userCharacter.trait.onEnterField) {
      this.state.userCharacter.trait.onEnterField(
        this.state.userCharacter,
        this.state.opponentCharacter,
        this
      );
    }
    
    if (this.state.opponentCharacter.trait.onEnterField) {
      this.state.opponentCharacter.trait.onEnterField(
        this.state.opponentCharacter,
        this.state.userCharacter,
        this
      );
    }
    
    this.logMessage(`Battle begins! ${this.state.userCharacter.name} vs ${this.state.opponentCharacter.name}!`);
  }

  public executeTechnique(user: Character, target: Character, technique: Technique): boolean {
    if (user.isDefeated()) {
      this.logMessage(`${user.name} is defeated and cannot act!`);
      return false;
    }

    if (!user.canAct()) {
      this.logMessage(`${user.name} cannot act due to their condition!`);
      return false;
    }

    if (!user.consumeMana(technique.manaCost)) {
      this.logMessage(`${user.name} doesn't have enough mana to use ${technique.name}!`);
      return false;
    }

    this.logMessage(`${user.name} uses ${technique.name}!`);

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

    // Trigger trait effects
    if (user.trait.onStrike) {
      user.trait.onStrike(user, target, this);
    }

    return true;
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
      case 'condition':
        this.applyCondition(target, effect.value as CombatCondition);
        break;
      case 'heal':
        const healAmount = typeof effect.value === 'number' ? effect.value : Math.floor(target.maxHP * effect.value);
        target.heal(healAmount);
        this.logMessage(`${target.name} recovers ${healAmount} HP!`);
        break;
      case 'stat_boost':
        const { stat, stages } = effect.value;
        target.modifyStatBoost(stat, stages);
        this.logMessage(`${target.name}'s ${stat} ${stages > 0 ? 'rose' : 'fell'}!`);
        break;
      case 'hazard':
        this.setHazard(effect.target === 'opponent' ? 'opponent' : 'user', effect.value as HazardType);
        break;
    }
  }

  private applyCondition(target: Character, condition: CombatCondition): void {
    if (target.trait.preventCondition && target.trait.preventCondition(target, condition)) {
      this.logMessage(`${target.name}'s trait prevents the condition!`);
      return;
    }

    target.condition = condition;
    target.conditionTurns = 3; // Default duration
    
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

  private setHazard(side: 'user' | 'opponent', hazardType: HazardType): void {
    const hazardMap = side === 'user' ? this.state.userHazards : this.state.opponentHazards;
    const currentLayers = hazardMap.get(hazardType) || 0;
    hazardMap.set(hazardType, Math.min(currentLayers + 1, 3)); // Max 3 layers
    
    this.logMessage(`${hazardType.replace('_', ' ')} was set on the ${side} side!`);
  }

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
  }

  public switchCharacter(isUser: boolean, newIndex: number): boolean {
    const party = isUser ? this.state.userParty : this.state.opponentParty;
    
    if (newIndex < 0 || newIndex >= party.length || party[newIndex].isDefeated()) {
      return false;
    }

    const newCharacter = party[newIndex];
    
    if (isUser) {
      this.logMessage(`${this.state.userCharacter.name}, return!`);
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

  public processTurnEnd(): void {
    // Apply condition damage
    this.state.userCharacter.applyConditionDamage();
    this.state.opponentCharacter.applyConditionDamage();
    
    // Update conditions
    this.state.userCharacter.updateCondition();
    this.state.opponentCharacter.updateCondition();
    
    // Trigger turn end effects
    if (this.state.userCharacter.trait.onTurnEnd) {
      this.state.userCharacter.trait.onTurnEnd(this.state.userCharacter, this);
    }
    
    if (this.state.opponentCharacter.trait.onTurnEnd) {
      this.state.opponentCharacter.trait.onTurnEnd(this.state.opponentCharacter, this);
    }
    
    // Equipment turn end effects
    if (this.state.userCharacter.equipment && this.state.userCharacter.equipment.onTurnEnd) {
      this.state.userCharacter.equipment.onTurnEnd(this.state.userCharacter, this);
    }
    
    if (this.state.opponentCharacter.equipment && this.state.opponentCharacter.equipment.onTurnEnd) {
      this.state.opponentCharacter.equipment.onTurnEnd(this.state.opponentCharacter, this);
    }
    
    // Apply hazard damage
    this.applyHazardDamage();
    
    // Restore mana based on ambient magic
    if (this.state.ambientMagic === AmbientMagicCondition.DenseMana) {
      this.state.userCharacter.restoreMana(5);
      this.state.opponentCharacter.restoreMana(5);
    }
    
    this.state.turn++;
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
        return Math.floor((layers * 12.5 / 100) * 50); // Base 50 HP for calculation
      case 'spiritual_spikes':
        return Math.floor((layers * 12.5 / 100) * 50);
      case 'illusory_terrain':
        return Math.floor((layers * 6.25 / 100) * 50);
      default:
        return 0;
    }
  }

  public isBattleOver(): boolean {
    return this.isUserDefeated() || this.isOpponentDefeated();
  }

  public isUserDefeated(): boolean {
    return this.state.userParty.every(character => character.isDefeated());
  }

  public isOpponentDefeated(): boolean {
    return this.state.opponentParty.every(character => character.isDefeated());
  }

  public getWinner(): 'user' | 'opponent' | null {
    if (this.isUserDefeated()) return 'opponent';
    if (this.isOpponentDefeated()) return 'user';
    return null;
  }

  public getBattleLog(): string[] {
    return [...this.battleLog];
  }

  public clearBattleLog(): void {
    this.battleLog = [];
  }

  private logMessage(message: string): void {
    this.battleLog.push(message);
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
    
    return party.filter((character, index) => 
      index !== activeIndex && !character.isDefeated()
    );
  }

  // Methods expected by the interface
  public getCurrentCharacter(): Character | null {
    return this.state.userCharacter;
  }

  public getOpponentCharacter(): Character | null {
    return this.state.opponentCharacter;
  }

  public isComplete(): boolean {
    return this.isBattleOver();
  }

  public getUserCharacters(): Character[] {
    return this.state.userParty;
  }

  public getAICharacters(): Character[] {
    return this.state.opponentParty;
  }

  public addToBattleLog(message: string): void {
    this.logMessage(message);
  }

  public nextTurn(): void {
    this.processTurnEnd();
  }

  public endBattle(winner: 'user' | 'opponent'): void {
    // Force end the battle by defeating all characters of the losing side
    if (winner === 'opponent') {
      this.state.userParty.forEach(char => char.takeDamage(char.currentHP));
    } else {
      this.state.opponentParty.forEach(char => char.takeDamage(char.currentHP));
    }
  }

  public switchCharacterByObject(character: Character): boolean {
    // Find which party the character belongs to and switch to it
    const userIndex = this.state.userParty.findIndex(char => char === character);
    if (userIndex !== -1) {
      return this.switchCharacter(true, userIndex);
    }

    const opponentIndex = this.state.opponentParty.findIndex(char => char === character);
    if (opponentIndex !== -1) {
      return this.switchCharacter(false, opponentIndex);
    }

    return false;
  }
}