# Technical Character Kit Creation Guide

This is the advanced technical guide for creating character kits in Friemon. This guide assumes programming knowledge and dives deep into the underlying mechanics, formulas, and code implementation details.

## Table of Contents
- [System Architecture](#system-architecture)
- [Damage Calculation Formula](#damage-calculation-formula)
- [Character Stats Deep Dive](#character-stats-deep-dive)
- [Race System Implementation](#race-system-implementation)
- [Technique System Architecture](#technique-system-architecture)
- [Condition System](#condition-system)
- [Trait System Implementation](#trait-system-implementation)
- [Equipment System](#equipment-system)
- [Battle Flow and Turn Order](#battle-flow-and-turn-order)
- [Type Effectiveness System](#type-effectiveness-system)
- [Advanced Mechanics](#advanced-mechanics)
- [Performance Considerations](#performance-considerations)
- [Code Examples](#code-examples)

## System Architecture

### Character Class Structure
```typescript
class Character {
  // Core Properties
  id: string;
  name: string;
  level: number;
  races: Race[];
  baseStats: Stats;
  
  // Combat State
  currentHP: number;
  currentMana: number;
  conditions: Set<CombatCondition>;
  conditionDurations: Map<CombatCondition, number>;
  statBoosts: StatBoosts; // Range: -6 to +6
  volatileEffects: VolatileEffect;
  
  // Character Kit Components
  disposition: Disposition;
  trait: Trait;
  equipment?: Equipment;
  techniques: Technique[];
}
```

### Technique Effect System
The technique effect system uses discriminated unions for type safety:

```typescript
type TechniqueEffectData = 
  | ConditionEffect
  | StatBoostEffect  
  | HealEffect
  | VolatileEffect;

interface ConditionEffect {
  type: TechniqueEffectType.Condition;
  value: CombatCondition;
  chance: number;
  target: EffectTarget.Self | EffectTarget.Opponent;
  condition?: (user: Character, target: Character, battle: Battle) => boolean;
}
```

## Damage Calculation Formula

### Core Damage Formula
```typescript
// Base damage calculation (similar to Pokemon Gen 4+)
let damage = Math.floor(
  ((2 * user.level + 10) * technique.power * attack) / 
  (250 * defense)
) + 2;
```

### Complete Damage Pipeline
```typescript
function calculateDamage(user: Character, target: Character, technique: Technique): number {
  const userStats = user.getEffectiveStats();
  const targetStats = target.getEffectiveStats();
  
  // 1. Determine attack/defense stats based on technique category
  let attack: number, defense: number;
  if (technique.category === TechniqueCategory.Physical) {
    attack = userStats.attack;
    defense = targetStats.defense;
  } else if (technique.category === TechniqueCategory.Magical) {
    attack = userStats.magicAttack;  
    defense = targetStats.magicDefense;
  } else {
    return 0; // Support techniques don't deal damage
  }
  
  // 2. Base damage formula
  let damage = Math.floor(((2 * user.level + 10) * technique.power * attack) / (250 * defense)) + 2;
  
  // 3. Affinity effectiveness (vs target's races)
  const affinityMultiplier = getAffinityAdvantage(technique.affinity, target.races);
  damage = Math.floor(damage * affinityMultiplier);
  
  // 4. Trait modifiers (user)
  if (user.trait.damageOutputMultiplier) {
    const multiplier = user.trait.damageOutputMultiplier(user, target, technique);
    damage = Math.floor(damage * multiplier);
  }
  
  // 5. Equipment modifiers (user)
  if (user.equipment?.damageOutputMultiplier) {
    const multiplier = user.equipment.damageOutputMultiplier(user, target, technique);
    damage = Math.floor(damage * multiplier);
  }
  
  // 6. Critical hits
  const critChance = user.getCriticalStrikeChance();
  if (Math.random() < critChance) {
    damage = Math.floor(damage * 1.5);
  }
  
  // 7. Random factor (85-100%)
  damage = Math.floor(damage * randomFloat(0.85, 1.0));
  
  // 8. Ambient magic effects
  if (battle.ambientMagic === AmbientMagicCondition.DenseMana && 
      technique.category === TechniqueCategory.Magical) {
    damage = Math.floor(damage * 1.2);
  } else if (battle.ambientMagic === AmbientMagicCondition.NullField && 
             technique.category === TechniqueCategory.Magical) {
    damage = Math.floor(damage * 0.5);
  }
  
  // 9. Target trait damage reduction
  if (target.trait.onReceiveDamage) {
    damage = target.trait.onReceiveDamage(target, user, battle, damage);
  }
  
  return Math.max(1, damage); // Minimum 1 damage
}
```

### Damage Multiplier Breakdown
- **Level Factor**: `(2 * level + 10)` - Characters get stronger as they level
- **Power Factor**: Technique's base power (0-160 typical range)
- **Attack/Defense Ratio**: Primary stat interaction
- **Affinity Bonus**: 0.5x to 2.0x based on type matchups
- **Critical Hits**: 1.5x damage multiplier
- **Random Factor**: 85-100% variance for damage rolls
- **Environmental**: Ambient magic can modify damage by ±20-50%

## Character Stats Deep Dive

### Stat Calculation System
```typescript
interface Stats {
  hp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number; 
  speed: number;
}

// Effective stats include boosts
function getEffectiveStats(): Stats {
  const base = this.baseStats;
  const disposition = this.disposition;
  const equipment = this.equipment?.statMultiplier?.(this, base) || base;
  
  return {
    hp: Math.floor(equipment.hp * this.getDispositionMultiplier('hp')),
    attack: Math.floor(equipment.attack * this.getDispositionMultiplier('attack') * this.getBoostMultiplier('attack')),
    defense: Math.floor(equipment.defense * this.getDispositionMultiplier('defense') * this.getBoostMultiplier('defense')),
    magicAttack: Math.floor(equipment.magicAttack * this.getDispositionMultiplier('magicAttack') * this.getBoostMultiplier('magicAttack')),
    magicDefense: Math.floor(equipment.magicDefense * this.getDispositionMultiplier('magicDefense') * this.getBoostMultiplier('magicDefense')),
    speed: Math.floor(equipment.speed * this.getDispositionMultiplier('speed') * this.getBoostMultiplier('speed'))
  };
}
```

### Stat Boost Mechanics
```typescript
interface StatBoosts {
  attack: number;     // -6 to +6
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
}

// Boost multipliers follow Pokemon formula
function getBoostMultiplier(stat: keyof StatBoosts): number {
  const boost = this.statBoosts[stat];
  if (boost >= 0) {
    return (2 + boost) / 2;  // +1 = 1.5x, +2 = 2.0x, +6 = 4.0x
  } else {
    return 2 / (2 + Math.abs(boost)); // -1 = 0.67x, -2 = 0.5x, -6 = 0.25x
  }
}
```

### Disposition System
```typescript
interface Disposition {
  name: string;
  increasedStat: keyof Stats;
  decreasedStat: keyof Stats;
}

// Dispositions provide 10% bonus/penalty
function getDispositionMultiplier(stat: keyof Stats): number {
  if (this.disposition.increasedStat === stat) return 1.1;
  if (this.disposition.decreasedStat === stat) return 0.9;
  return 1.0;
}
```

## Race System Implementation

### Race Effectiveness Chart
```typescript
// Damage multipliers based on technique affinity vs target races
const AFFINITY_CHART: Record<Affinity, Partial<Record<Race, number>>> = {
  [Affinity.Destruction]: {
    [Race.Demon]: 2.0,     // Super effective vs Demons
    [Race.Spirit]: 1.5,    // Effective vs Spirits
    [Race.Golem]: 0.5      // Not very effective vs Golems
  },
  [Affinity.Healing]: {
    [Race.Demon]: 2.0,     // Super effective vs Demons
    [Race.Human]: 1.2,     // Slightly effective vs Humans
    [Race.Monster]: 0.8    // Slightly resisted by Monsters
  },
  [Affinity.Elemental_Fire]: {
    [Race.Monster]: 1.5,   // Effective vs nature-based Monsters
    [Race.Golem]: 0.5,     // Resisted by stone Golems
    [Race.Spirit]: 0.8     // Slightly resisted by Spirits
  }
  // ... more affinity matchups
};

function getAffinityAdvantage(affinity: Affinity, targetRaces: Race[]): number {
  let totalMultiplier = 1.0;
  
  for (const race of targetRaces) {
    const multiplier = AFFINITY_CHART[affinity]?.[race] || 1.0;
    totalMultiplier *= multiplier;
  }
  
  // Cap at 0.25x to 4.0x to prevent extreme values
  return Math.max(0.25, Math.min(4.0, totalMultiplier));
}
```

### Multi-Race Interactions
Characters can have multiple races, and the effects stack multiplicatively:
- Human/Elf vs Destruction: 1.0 × 1.0 = 1.0x (neutral)
- Demon/Spirit vs Destruction: 2.0 × 1.5 = 3.0x (very weak)
- Golem/Monster vs Fire: 0.5 × 1.5 = 0.75x (slight resistance)

## Technique System Architecture

### Technique Properties
```typescript
interface Technique {
  name: string;
  affinity: Affinity;
  category: TechniqueCategory;
  power: number;           // 0-160, 0 for non-damaging
  precision: number;       // 0.0-1.0, accuracy rate
  manaCost: number;        // 0-40 typical
  initiative: number;      // Priority modifier for turn order
  effects: TechniqueEffect[]; // Additional effects
  properties: { [key in TechniqueProperty]?: boolean };
  execute?: (user: Character, target: Character, battle: Battle, technique: Technique) => boolean;
}
```

### Technique Properties System
```typescript
type TechniqueProperty = 
  | 'magicBased'       // Affected by magic amplifiers
  | 'physicalBased'    // Affected by physical amplifiers  
  | 'contact'          // Makes physical contact
  | 'areaEffect'       // Hits multiple targets
  | 'barrierBypassing' // Ignores defensive barriers
  | 'concentration';   // Requires charging/preparation

// Usage in trait calculations
if (technique.properties.contact && target.equipment?.onReceiveStrike) {
  target.equipment.onReceiveStrike(target, user, battle);
}
```

### Precision and Accuracy
```typescript
function getEffectivePrecision(user: Character, target: Character, battle: Battle): number {
  let precision = this.precision;
  
  // Environmental effects
  if (battle.terrain === TerrainType.ObscuringMist && 
      this.category === TechniqueCategory.Physical) {
    precision *= 0.8; // -20% accuracy in mist for physical attacks
  } else if (battle.terrain === TerrainType.ObscuringMist && 
             this.affinity === Affinity.Illusion) {
    precision *= 1.2; // +20% accuracy for illusion in mist
  }
  
  // Trait bonuses
  if (user.trait.name === 'Magic Perception' && 
      this.affinity === Affinity.Illusion) {
    precision *= 1.15; // +15% vs illusions
  }
  
  // Volatile effect modifiers
  if (target.volatileEffects.mistyAura) {
    precision *= 0.85; // -15% to hit misty targets
  }
  
  return Math.min(1.0, precision); // Cap at 100%
}
```

### Initiative and Turn Order
```typescript
// Turn order calculation
function calculateInitiative(character: Character, technique: Technique): number {
  const baseSpeed = character.getEffectiveStats().speed;
  const techniqueBonus = technique.initiative || 0;
  const randomFactor = Math.random() * 10; // Small random element
  
  return baseSpeed + (techniqueBonus * 25) + randomFactor;
}

// Priority brackets:
// +3: Swift Strike (always goes first)
// +2: Shadow Step (high priority)  
// +1: Gust (slightly faster)
// 0: Normal techniques
// -1: Slower charging moves
```

## Condition System

### Condition Implementation
```typescript
enum CombatCondition {
  Normal = 'Normal',
  Exhausted = 'Exhausted',    // DoT damage (1/8 max HP per turn)
  Stunned = 'Stunned',        // Cannot act
  Confused = 'Confused',      // May target wrong character
  Frenzied = 'Frenzied',      // Attacks randomly
  Charmed = 'Charmed',        // Controlled by opponent
  Dazed = 'Dazed',           // Loses next turn only
  Fear = 'Fear',             // 25% chance to not act
  MagicSeal = 'MagicSeal'    // Cannot use magical techniques
}

class Character {
  conditions: Set<CombatCondition>;
  conditionDurations: Map<CombatCondition, number>;
  
  // Multiple conditions can coexist
  addCondition(condition: CombatCondition, duration: number = 3): void {
    if (condition === CombatCondition.Normal) return;
    this.conditions.add(condition);
    this.conditionDurations.set(condition, duration);
  }
}
```

### Condition Interactions
```typescript
function canAct(): boolean {
  // Stunned completely prevents action
  if (this.conditions.has(CombatCondition.Stunned)) return false;
  
  // Dazed prevents action once then clears
  if (this.conditions.has(CombatCondition.Dazed)) {
    this.removeCondition(CombatCondition.Dazed);
    return false;
  }
  
  // Fear has a chance to prevent action
  if (this.conditions.has(CombatCondition.Fear)) {
    return Math.random() > 0.25;
  }
  
  return true;
}

function canUseTechnique(technique: Technique): boolean {
  // Magic Seal prevents magical techniques
  if (this.conditions.has(CombatCondition.MagicSeal) && 
      technique.category === TechniqueCategory.Magical) {
    return false;
  }
  
  return this.mana >= technique.manaCost;
}
```

### Condition Duration System
```typescript
function updateCondition(): void {
  const conditionsToRemove: CombatCondition[] = [];
  
  // Decrement all condition durations
  for (const [condition, turns] of this.conditionDurations) {
    const newTurns = turns - 1;
    if (newTurns <= 0) {
      conditionsToRemove.push(condition);
    } else {
      this.conditionDurations.set(condition, newTurns);
    }
  }
  
  // Remove expired conditions
  for (const condition of conditionsToRemove) {
    this.removeCondition(condition);
  }
}
```

## Trait System Implementation

### Trait Interface
```typescript
interface Trait {
  name: string;
  description: string;
  
  // Event handlers (all optional)
  onEnterField?: (user: Character, opponent: Character, battle: Battle) => void;
  onReceiveDamage?: (target: Character, source: Character, battle: Battle, damage: number) => number;
  damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
  onStrike?: (user: Character, target: Character, battle: Battle) => void;
  preventCondition?: (character: Character, condition: CombatCondition) => boolean;
  onEnvironment?: (character: Character, battle: Battle) => void;
  manaRestoreOnKO?: (user: Character, battle: Battle) => number;
  onTurnEnd?: (character: Character, battle: Battle) => void;
}
```

### Trait Examples with Implementation
```typescript
// Damage reduction trait
const FIRE_RESISTANCE: Trait = {
  name: 'Fire Resistance',
  description: 'Takes 50% damage from Fire techniques',
  onReceiveDamage: (target, source, battle, damage) => {
    // Check if the technique was fire-based (would need technique reference)
    // This is simplified - actual implementation tracks the technique used
    return Math.floor(damage * 0.5);
  }
};

// Conditional damage boost
const BATTLE_FURY: Trait = {
  name: 'Battle Fury', 
  description: 'Deal +50% damage when below 25% HP',
  damageOutputMultiplier: (user, target, technique) => {
    const hpPercent = user.currentHP / user.maxHP;
    return hpPercent <= 0.25 ? 1.5 : 1.0;
  }
};

// Turn-based healing
const REGENERATION: Trait = {
  name: 'Regeneration',
  description: 'Restores 12.5% max HP at end of each turn',
  onTurnEnd: (character, battle) => {
    const healAmount = Math.floor(character.maxHP * 0.125);
    character.heal(healAmount);
    battle.logMessage(`${character.name} recovers ${healAmount} HP from Regeneration!`);
  }
};
```

### Trait Execution Order
1. **onEnterField** - When character switches in or battle starts
2. **damageOutputMultiplier** - During damage calculation
3. **onStrike** - After dealing damage
4. **onReceiveDamage** - When taking damage  
5. **preventCondition** - When condition would be applied
6. **onTurnEnd** - At end of each turn
7. **manaRestoreOnKO** - When opponent is defeated

## Equipment System

### Equipment Interface
```typescript
interface Equipment {
  name: string;
  description: string;
  
  // Stat modifications
  statMultiplier?: (holder: Character, stats: Stats) => Stats;
  critChanceBoost?: number;        // Flat critical hit bonus
  manaCostReduction?: number;      // Percentage mana cost reduction
  
  // Event handlers
  damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
  onTurnEnd?: (holder: Character, battle: Battle) => void;
  onReceiveStrike?: (holder: Character, source: Character, battle: Battle) => void;
}
```

### Equipment Examples
```typescript
const MAGIC_AMPLIFIER: Equipment = {
  name: 'Magic Amplifier',
  description: 'Enhances magical abilities',
  statMultiplier: (holder, stats) => ({
    ...stats,
    magicAttack: Math.floor(stats.magicAttack * 1.3), // +30% Magic Attack
    magicDefense: Math.floor(stats.magicDefense * 1.1) // +10% Magic Defense
  }),
  manaCostReduction: 0.2 // 20% less mana cost
};

const SPIKED_ARMOR: Equipment = {
  name: 'Spiked Armor',
  description: 'Damages attackers who make contact',
  statMultiplier: (holder, stats) => ({
    ...stats,
    defense: Math.floor(stats.defense * 1.25) // +25% Defense
  }),
  onReceiveStrike: (holder, source, battle) => {
    // Only trigger on contact moves
    const recoilDamage = Math.floor(source.maxHP * 0.0625); // 1/16 max HP
    source.takeDamage(recoilDamage);
    battle.logMessage(`${source.name} is hurt by ${holder.name}'s Spiked Armor!`);
  }
};
```

## Battle Flow and Turn Order

### Turn Resolution
```typescript
class Battle {
  public executeTurn(userAction: BattleAction, opponentAction: BattleAction): void {
    // 1. Determine turn order based on speed + technique priority
    const actions = this.sortActionsBySpeed([
      { character: this.state.userCharacter, action: userAction },
      { character: this.state.opponentCharacter, action: opponentAction }
    ]);
    
    // 2. Execute actions in order
    for (const { character, action } of actions) {
      if (character.canAct()) {
        this.executeAction(character, action);
      }
    }
    
    // 3. Process end-of-turn effects
    this.processTurnEnd();
  }
  
  private processTurnEnd(): void {
    // Apply condition damage (poison, burn, etc.)
    this.applyConditionDamage();
    
    // Update condition durations
    this.updateConditions();
    
    // Trigger turn end traits and equipment
    this.processTurnEndEffects();
    
    // Apply hazard damage
    this.applyHazardDamage();
    
    // Process ambient magic effects
    this.processAmbientMagicEffects();
    
    // Check for auto-switches due to defeated characters
    this.handleDefeatedCharacters();
  }
}
```

### Speed Calculation
```typescript
function sortActionsBySpeed(actions: ActionWithCharacter[]): ActionWithCharacter[] {
  return actions.sort((a, b) => {
    const speedA = this.calculateActionSpeed(a.character, a.action);
    const speedB = this.calculateActionSpeed(b.character, b.action);
    return speedB - speedA; // Higher speed goes first
  });
}

function calculateActionSpeed(character: Character, action: BattleAction): number {
  const baseSpeed = character.getEffectiveStats().speed;
  
  if (action.type === 'technique') {
    const technique = character.techniques[action.data];
    const priorityBonus = (technique.initiative || 0) * 25;
    return baseSpeed + priorityBonus;
  } else if (action.type === 'switch') {
    return baseSpeed + 50; // Switching has inherent priority
  }
  
  return baseSpeed;
}
```

## Type Effectiveness System

### Affinity Interactions
```typescript
// Complex type chart with decimal multipliers
const AFFINITY_EFFECTIVENESS: Record<Affinity, Record<Affinity, number>> = {
  [Affinity.Destruction]: {
    [Affinity.Defense]: 1.5,      // Destruction beats Defense
    [Affinity.Healing]: 1.2,      // Destruction vs Healing
    [Affinity.Illusion]: 0.8      // Illusion resists Destruction
  },
  [Affinity.Elemental_Fire]: {
    [Affinity.Elemental_Water]: 0.5,  // Fire weak to Water
    [Affinity.Elemental_Wind]: 1.2,   // Fire strong vs Wind  
    [Affinity.Elemental_Earth]: 1.5   // Fire strong vs Earth
  },
  [Affinity.Healing]: {
    [Affinity.Demonic_Aura]: 2.0,     // Healing very effective vs Demonic
    [Affinity.Destruction]: 0.8       // Healing resists Destruction
  }
  // ... complete type chart
};

function getAffinityEffectiveness(techniqueAffinity: Affinity, target: Character): number {
  // This would check target's defensive affinities
  // Currently simplified, but could be expanded
  return 1.0;
}
```

## Advanced Mechanics

### Critical Hit System
```typescript
function getCriticalStrikeChance(): number {
  let baseCritChance = 0.05; // 5% base critical hit rate
  
  // Equipment bonuses
  if (this.equipment?.critChanceBoost) {
    baseCritChance += this.equipment.critChanceBoost;
  }
  
  // Volatile effect bonuses
  if (this.volatileEffects.focusedAura) {
    baseCritChance += 0.15; // +15% crit chance
  }
  
  // Trait bonuses (example)
  if (this.trait.name === 'Sharp Claws') {
    baseCritChance += 0.10; // +10% crit chance
  }
  
  return Math.min(0.95, baseCritChance); // Cap at 95%
}
```

### Mana System
```typescript
function calculateMaxMana(): number {
  // Mana scales with Magic Attack and level
  const baseMana = Math.floor(this.baseStats.magicAttack * 0.8 + this.level * 2);
  
  // Equipment modifiers
  let finalMana = baseMana;
  if (this.equipment?.statMultiplier) {
    const modifiedStats = this.equipment.statMultiplier(this, this.baseStats);
    finalMana = Math.floor(modifiedStats.magicAttack * 0.8 + this.level * 2);
  }
  
  return finalMana;
}

function getEffectiveManaCost(technique: Technique): number {
  let cost = technique.manaCost;
  
  // Equipment mana cost reduction
  if (this.equipment?.manaCostReduction) {
    cost = Math.floor(cost * (1 - this.equipment.manaCostReduction));
  }
  
  // Ambient magic effects
  if (battle.ambientMagic === AmbientMagicCondition.DenseMana) {
    cost = Math.floor(cost * 0.8); // 20% less mana cost
  }
  
  return Math.max(0, cost); // Minimum 0 cost
}
```

### Volatile Effects System
```typescript
interface VolatileEffect {
  manaShield: boolean;      // Damage reduces mana instead of HP
  leechCurse: boolean;      // Heals opponent when taking damage
  tormented: boolean;       // Takes extra damage from fear effects
  challenged: boolean;      // Cannot switch out
  channeling: boolean;      // Preparing a charged attack
  immaterial: boolean;      // Next attack phases through
  focusedAura: boolean;     // Increased critical hit rate
  mistyAura: boolean;       // Increased evasion
  mimicry: boolean;         // Copies opponent's last used technique
  magicSeal: boolean;       // Cannot use magical techniques
}

// Volatile effects are cleared at different times:
// - Some clear after one turn (immaterial)
// - Some clear when specific conditions are met (channeling)
// - Some persist until battle ends (manaShield)
```

### Hazard System
```typescript
type HazardType = 'mana_traps' | 'spiritual_spikes' | 'illusory_terrain';

function calculateHazardDamage(hazardType: HazardType, layers: number): number {
  switch (hazardType) {
    case 'mana_traps':
      return Math.floor(((layers * 12.5) / 100) * 50); // 12.5% per layer
    case 'spiritual_spikes':  
      return Math.floor(((layers * 12.5) / 100) * 50); // Same as mana traps
    case 'illusory_terrain':
      return Math.floor(((layers * 6.25) / 100) * 50);  // Half damage per layer
    default:
      return 0;
  }
}
```

## Performance Considerations

### Memory Management
```typescript
// Efficient condition tracking
class Character {
  private conditionCache: Map<CombatCondition, boolean> = new Map();
  
  hasCondition(condition: CombatCondition): boolean {
    // Cache lookups for frequently checked conditions
    if (this.conditionCache.has(condition)) {
      return this.conditionCache.get(condition)!;
    }
    
    const result = this.conditions.has(condition);
    this.conditionCache.set(condition, result);
    return result;
  }
  
  private invalidateConditionCache(): void {
    this.conditionCache.clear();
  }
}
```

### Technique Effect Optimization
```typescript
// Batch effect application to reduce function calls
function applyTechniqueEffects(effects: TechniqueEffect[]): void {
  const conditionEffects = effects.filter(e => e.type === TechniqueEffectType.Condition);
  const statEffects = effects.filter(e => e.type === TechniqueEffectType.StatBoost);
  const healEffects = effects.filter(e => e.type === TechniqueEffectType.Heal);
  
  // Apply each type in batches to minimize state changes
  this.applyConditionEffects(conditionEffects);
  this.applyStatEffects(statEffects);
  this.applyHealEffects(healEffects);
}
```

## Code Examples

### Creating a Balanced Character Kit
```typescript
const EXAMPLE_CHARACTER: Character = new Character({
  name: 'Frost Mage',
  level: 50,
  races: [Race.Elf, Race.Spirit],
  baseStats: {
    hp: 55,           // Below average HP
    attack: 35,       // Low physical attack
    defense: 45,      // Below average defense
    magicAttack: 80,  // High magic attack (main strength)
    magicDefense: 70, // Good magic defense
    speed: 50         // Average speed
  },
  disposition: DISPOSITIONS.calm, // +Magic Defense, -Attack
  trait: {
    name: 'Frost Affinity',
    description: 'Water techniques have +25% damage and 15% chance to inflict Stunned',
    damageOutputMultiplier: (user, target, technique) => {
      return technique.affinity === Affinity.Elemental_Water ? 1.25 : 1.0;
    }
  },
  techniques: [
    // Early game technique
    createTechnique({
      name: 'Ice Shard',
      affinity: Affinity.Elemental_Water,
      category: TechniqueCategory.Magical,
      power: 60,
      precision: 0.95,
      manaCost: 12,
      effects: [
        createConditionEffect(CombatCondition.Stunned, 0.15, EffectTarget.Opponent)
      ]
    }),
    
    // Mid game technique  
    createTechnique({
      name: 'Frost Armor',
      affinity: Affinity.Defense,
      category: TechniqueCategory.Support,
      power: 0,
      precision: 1.0,
      manaCost: 18,
      effects: [
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('magicDefense', 1, 1.0, EffectTarget.Self)
      ]
    }),
    
    // Late game technique
    createTechnique({
      name: 'Absolute Zero',
      affinity: Affinity.Elemental_Water,
      category: TechniqueCategory.Magical,
      power: 130,
      precision: 0.8,
      manaCost: 35,
      effects: [
        createConditionEffect(CombatCondition.Stunned, 0.4, EffectTarget.Opponent)
      ],
      properties: { concentration: true }
    })
  ]
});
```

### Advanced Trait Implementation
```typescript
const ADAPTIVE_COMBAT: Trait = {
  name: 'Adaptive Combat',
  description: 'Gains resistance to damage types after being hit by them',
  
  onReceiveDamage: (target, source, battle, damage) => {
    // Track damage types received (would need additional state tracking)
    const damageReduction = target.getAdaptiveResistance(source.lastUsedTechnique?.affinity);
    return Math.floor(damage * (1 - damageReduction));
  },
  
  onTurnEnd: (character, battle) => {
    // Decay adaptive resistances over time
    character.decayAdaptiveResistances();
  }
};

const BERSERKER_RAGE: Trait = {
  name: 'Berserker Rage',
  description: 'Attack increases as HP decreases, but defense decreases',
  
  damageOutputMultiplier: (user, target, technique) => {
    const hpPercent = user.currentHP / user.maxHP;
    const rageBonus = 1 + (1 - hpPercent) * 0.5; // Up to +50% at 0% HP
    return technique.category === TechniqueCategory.Physical ? rageBonus : 1.0;
  },
  
  onReceiveDamage: (target, source, battle, damage) => {
    const hpPercent = target.currentHP / target.maxHP;
    const defensePenalty = 1 + (1 - hpPercent) * 0.3; // Up to +30% damage taken
    return Math.floor(damage * defensePenalty);
  }
};
```

### Custom Technique with Complex Logic
```typescript
const MIRROR_FORCE: Technique = new Technique({
  name: 'Mirror Force',
  affinity: Affinity.Illusion,
  category: TechniqueCategory.Support,
  power: 0,
  precision: 1.0,
  manaCost: 25,
  description: 'Reflects the next technique back at the attacker',
  
  execute: (user, target, battle, technique) => {
    // Set up reflection state
    user.volatileEffects.mirrorForce = true;
    user.mirrorForceStacks = 1; // Custom state tracking
    
    battle.logMessage(`${user.name} sets up a magical mirror!`);
    return true;
  },
  
  effects: [] // No standard effects, all in execute function
});

// This would require additional state tracking and battle logic to handle reflections
```

This technical guide provides the deep implementation details needed for advanced character kit creation, including exact formulas, code patterns, and optimization strategies.