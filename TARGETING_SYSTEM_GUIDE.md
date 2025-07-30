# Battle System Targeting Guide

This guide explains how the targeting system works for techniques in 3v3 battles.

## Target Types

### 1. **`single`** (Default)
- Automatically targets the opponent's active character
- Most basic techniques use this
- No player choice required

```typescript
const basicAttack = new Technique({
    name: "Slash",
    power: 60,
    targetType: 'single', // Or omit - this is default
    description: "A basic sword attack"
});
```

### 2. **`chooseTarget`** (Manual Selection)
- Player manually chooses which opponent character to target
- Shows target selection menu with all available enemies
- Perfect for sniper attacks, strategic targeting

```typescript
const sniperShot = new Technique({
    name: "Sniper Shot", 
    power: 100,
    targetType: 'chooseTarget',
    description: "Precisely target any enemy character"
});
```

**Battle Interface Flow:**
1. Player selects "Sniper Shot" from move menu
2. System shows target selection menu: "1. Alakazam", "2. Frieren", "3. Ember"
3. Player chooses specific target
4. Attack executes on chosen target

### 3. **`multiTarget`** (Auto Multi-Hit)
- Automatically hits multiple opponents
- Uses `multiTargetCount` property (default: 2)
- Prioritizes active character + others available
- Player has NO choice in targeting

```typescript
const chainLightning = new Technique({
    name: "Chain Lightning",
    power: 75,
    targetType: 'multiTarget',
    multiTargetCount: 2, // Hits 2 enemies
    description: "Lightning chains between two enemies"
});

const tripleStrike = new Technique({
    name: "Triple Strike",
    power: 50,
    targetType: 'multiTarget', 
    multiTargetCount: 3, // Hits all 3 if available
    description: "Strike all enemy characters"
});
```

### 4. **`allEnemies`** (Full Team Attack)
- Hits every available enemy character
- Usually lower power to balance
- Classic "area effect" attacks

```typescript
const earthquake = new Technique({
    name: "Earthquake",
    power: 65,
    targetType: 'allEnemies',
    description: "Massive earthquake hits all enemies"
});
```

### 5. **`self`** (Self-Targeting)
- Targets only the user
- Used for buffs, healing, transformation

```typescript
const meditate = new Technique({
    name: "Meditate",
    power: 0,
    targetType: 'self',
    effects: [healEffect],
    description: "Restore your own HP and MP"
});
```

## Usage Examples

### Example Technique Definitions

```typescript
// Regular single-target attack
const fireball = new Technique({
    name: "Fireball",
    affinity: Affinity.Elemental_Fire,
    category: TechniqueCategory.Magical,
    power: 80,
    precision: 0.95,
    manaCost: 20,
    targetType: 'single', // Hits active opponent
    description: "Launch a fireball at the enemy"
});

// Player-choice precision attack  
const assassinate = new Technique({
    name: "Assassinate",
    affinity: Affinity.Physical,
    category: TechniqueCategory.Physical,
    power: 150,
    precision: 0.85,
    manaCost: 35,
    targetType: 'chooseTarget', // Player picks target
    description: "Precisely target and eliminate an enemy"
});

// Auto multi-target technique
const windSlash = new Technique({
    name: "Wind Slash",
    affinity: Affinity.Elemental_Wind,
    category: TechniqueCategory.Magical,
    power: 60,
    precision: 1.0,
    manaCost: 30,
    targetType: 'multiTarget',
    multiTargetCount: 2, // Auto-hits 2 enemies
    description: "Wind blades slice through multiple enemies"
});

// Full area attack
const meteorStorm = new Technique({
    name: "Meteor Storm",
    affinity: Affinity.Elemental_Fire,
    category: TechniqueCategory.Magical,
    power: 55,
    precision: 1.0,
    manaCost: 45,
    targetType: 'allEnemies', // Hits everyone
    description: "Meteors rain down on all enemies"
});
```

## Battle Interface Display

The Discord interface shows targeting information:

```
⚔️ Fireball
Elemental_Fire | 80 power | 20 MP | Single target

⚔️ Assassinate  
Physical | 150 power | 35 MP | 🎯 Choose target | 85% accuracy

⚔️ Wind Slash
Elemental_Wind | 60 power | 30 MP | Hits 2 enemies

⚔️ Meteor Storm
Elemental_Fire | 55 power | 45 MP | All enemies
```

## Execution in Code

```typescript
// Execute single/multi/all targeting (automatic)
battle.executeTechniqueWithTargeting(user, technique);

// Execute with manual target selection
const selectedTarget = opponentTeam.getPosition(2); // Player chose position 2
battle.executeTechniqueWithTargeting(user, chooseTargetTechnique, selectedTarget);

// Check if technique needs target selection
if (battle.requiresTargetSelection(technique)) {
    // Show target selection menu
    const availableTargets = battle.getAvailableTargets(technique, isUserTechnique);
    const targetMenu = battleInterface.createTargetSelectionMenu(technique, availableTargets);
}
```

## Key Differences

| Target Type | Player Choice | Auto-Execution | Example Use |
|-------------|---------------|-----------------|-------------|
| `single` | ❌ No | ✅ Hits active enemy | Basic attacks |
| `chooseTarget` | ✅ Yes | ❌ Player selects | Sniper attacks, strategic |
| `multiTarget` | ❌ No | ✅ Auto-hits X enemies | Chain attacks |
| `allEnemies` | ❌ No | ✅ Hits all enemies | Area effects |
| `self` | ❌ No | ✅ Hits user only | Buffs, healing |

This system gives you both strategic manual targeting (chooseTarget) and powerful multi-hit techniques (multiTarget) with clear distinctions!