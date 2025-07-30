# Enhanced 3v3 Battle System

The battle system has been enhanced with comprehensive team management and precision targeting capabilities.

## New Features

### 1. Team Position Management

```typescript
// Access characters by position (1, 2, 3)
const character1 = battle.getCharacterAtPosition(true, 1); // Player 1's first character
const character2 = battle.getCharacterAtPosition(true, 2); // Player 1's second character
const character3 = battle.getCharacterAtPosition(true, 3); // Player 1's third character

// Switch to specific position
battle.switchToPosition(true, 2); // Switch Player 1 to position 2 character

// Get team status with positions
const teamStatus = battle.getTeamStatus(true);
console.log(teamStatus);
// Output: 
// 1.👑💀 Alakazam (0/100 HP)
// 2. Zoltraak (85/100 HP)  
// 3. Ember (100/100 HP)
```

### 2. Advanced Targeting System

#### Target Types Available:
- `single` - Targets active opponent character (default)
- `precision` - Player manually selects specific target
- `twoTarget` - Hits active opponent + one other
- `allEnemies` - Targets all enemy characters
- `allAllies` - Targets all ally characters  
- `self` - Self-targeting only
- `randomEnemy` - Random enemy selection
- `lowestHPEnemy` - Targets enemy with lowest HP
- `highestHPEnemy` - Targets enemy with highest HP

#### Example Technique Definitions:

```typescript
// Precision targeting technique - player chooses target
const sniperShot = new Technique({
    name: "Sniper Shot",
    affinity: Affinity.Physical,
    category: TechniqueCategory.Physical,
    power: 120,
    precision: 0.95,
    manaCost: 25,
    targetType: 'precision',
    description: "A precise shot that can target any enemy character"
});

// Multi-target technique
const chainLightning = new Technique({
    name: "Chain Lightning", 
    affinity: Affinity.Elemental_Wind,
    category: TechniqueCategory.Magical,
    power: 80,
    precision: 1.0,
    manaCost: 35,
    targetType: 'twoTarget',
    description: "Lightning that jumps between two enemy targets"
});

// Area effect technique
const earthquake = new Technique({
    name: "Earthquake",
    affinity: Affinity.Elemental_Earth, 
    category: TechniqueCategory.Magical,
    power: 90,
    precision: 1.0,
    manaCost: 40,
    targetType: 'allEnemies',
    description: "Massive earthquake that hits all enemies"
});
```

### 3. Team Manager Usage

```typescript
// Create team managers (done automatically in Battle constructor)
const userTeam = new TeamManager(userParty, 0);
const opponentTeam = new TeamManager(opponentParty, 0);

// Access team functions
userTeam.getPosition(1);           // Get character at position 1
userTeam.getActiveCharacter();     // Get currently active character
userTeam.getAvailableCharacters(); // Get all non-defeated characters
userTeam.switchToPosition(2);      // Switch to position 2

// Get targeting information
const targets = userTeam.getTargets('allEnemies', opponentTeam); // All enemy targets
const requiresSelection = userTeam.requiresTargetSelection('precision'); // true
```

### 4. Enhanced Battle Interface

The Discord interface now shows:
- Position numbers for all team members (1., 2., 3.)
- Targeting information in technique descriptions
- Target selection menus for precision techniques

Example move selection:
```
⚔️ Sniper Shot
Elemental_Fire | 120 power | 25 MP | 🎯 Choose target | 95% accuracy
```

### 5. Execution with Targeting

```typescript
// Execute technique with automatic targeting
battle.executeTechniqueWithTargeting(user, technique);

// Execute precision technique with manual target selection
const selectedTargets = [opponentTeam.getPosition(2)]; // Target position 2
battle.executeTechniqueWithTargeting(user, precisionTechnique, selectedTargets);

// Get available targets for a technique
const availableTargets = battle.getAvailableTargets(technique, true);

// Check if technique requires target selection
const needsSelection = battle.requiresTargetSelection(technique);
```

## Integration with Existing System

The enhancements are fully backward compatible:
- Existing `executeTechnique()` method still works
- Old team switching methods work alongside new position-based methods
- BattleState interface unchanged
- All existing technique definitions continue to work (defaulting to 'single' targeting)

## Usage in Battle Flow

1. **Battle Creation**: TeamManagers are automatically created
2. **Move Selection**: Interface shows targeting info for each technique
3. **Precision Targeting**: If technique requires target selection, show target menu
4. **Execution**: Use `executeTechniqueWithTargeting()` for full targeting support
5. **Team Management**: Use position-based switching for clearer team organization

## New Properties Added

### TechniqueProperty additions:
- `precisionTarget` - Technique allows manual target selection
- `multiTarget` - Technique hits multiple targets
- `allEnemyTarget` - Technique hits all enemies

### New Types:
- `TargetType` - Defines how technique selects targets
- `TeamPosition` - 1, 2, or 3 for team positions

The system now provides full control over 3v3 team battles with flexible targeting options!