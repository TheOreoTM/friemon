# Character Kit Creation Guide

Welcome to the Friemon character kit creation guide! This document explains all the options available when designing a character kit for the game. You don't need any programming knowledge - just creativity and an understanding of the game mechanics.

## Table of Contents
- [Character Overview](#character-overview)
- [Character Stats](#character-stats)
- [Races](#races)
- [Dispositions](#dispositions)
- [Techniques (Moves)](#techniques-moves)
- [Technique Effects](#technique-effects)
- [Traits (Passive Abilities)](#traits-passive-abilities)
- [Equipment](#equipment)
- [Character Kit Template](#character-kit-template)
- [Balance Guidelines](#balance-guidelines)

## Character Overview

A character kit consists of:
- **Base Stats** - The character's core attributes
- **Race(s)** - Determines affinity bonuses and resistances  
- **Disposition** - Personality trait that boosts one stat and lowers another
- **Techniques** - The moves/spells the character can learn
- **Trait** - A unique passive ability
- **Equipment** - Optional gear that provides bonuses

## Character Stats

Every character has 6 core stats that determine their combat effectiveness:

### Primary Stats
- **HP (Health Points)** - How much damage the character can take (typical range: 40-80)
- **Attack** - Physical damage output (typical range: 40-70)
- **Defense** - Physical damage resistance (typical range: 40-70)  
- **Magic Attack** - Magical damage output (typical range: 40-70)
- **Magic Defense** - Magical damage resistance (typical range: 40-70)
- **Speed** - Turn order and some technique effects (typical range: 40-70)

### Stat Guidelines
- **Total stat points should be around 300-350** for balanced characters
- **Specialist characters** can have one very high stat (80+) but must have weaknesses
- **Defensive characters** might have high HP/Defense but lower Attack
- **Glass cannons** have high Attack/Magic Attack but low HP/Defense

## Races

Characters can have 1-3 races that affect their affinity bonuses and resistances:

### Available Races
- **Human** - Balanced, no major strengths or weaknesses
- **Elf** - Strong with Illusion magic, weak to Destruction
- **Dwarf** - Strong with Earth magic and physical techniques, slow but durable
- **Demon** - Strong with Demonic Aura, weak to Healing magic
- **Monster** - Varies widely, can have elemental affinities
- **Golem** - High defense, weak to certain elements
- **Spirit** - Strong with Illusion, ethereal properties

### Race Effects
- Each race provides **damage bonuses** when using certain technique types
- Races also provide **resistance or weakness** to certain incoming techniques
- Multiple races can create interesting hybrid bonuses

## Dispositions

Dispositions represent the character's personality and affect their stat growth:

### Available Dispositions
- **Brave** - +Attack, -Defense (aggressive fighters)
- **Bold** - +Attack, -Magic Defense (reckless attackers)  
- **Hardy** - +Defense, -Magic Attack (tough defenders)
- **Calm** - +Magic Defense, -Attack (composed spellcasters)
- **Modest** - +Magic Defense, -Magic Attack (humble supporters)
- **Timid** - +Speed, -Attack (fast but weak)
- **Hasty** - +Speed, -Defense (quick but fragile)
- **Serious** - No stat changes (balanced)

## Techniques (Moves)

Techniques are the actions characters can perform in battle. Each technique has multiple properties:

### Technique Properties

#### Basic Properties
- **Name** - The technique's display name
- **Description** - Flavor text explaining what the technique does
- **Affinity** - The magical school or element (see Affinities section)
- **Category** - Physical, Magical, or Support
- **Power** - Base damage (0 for non-damaging techniques, 40-160 for attacks)
- **Precision** - Accuracy rate (0.0 = never hits, 1.0 = always hits)
- **Mana Cost** - How much mana the technique consumes (0-40 typical)
- **Initiative** - Priority bonus for turn order (0 = normal, higher = goes first)

#### Technique Categories
- **Physical** - Uses Attack vs Defense, can make contact
- **Magical** - Uses Magic Attack vs Magic Defense  
- **Support** - Utility techniques that buff, heal, or inflict conditions

### Affinities

Affinities determine damage bonuses and resistances:

#### Elemental Affinities
- **Elemental Fire** - Fire-based attacks, strong vs nature
- **Elemental Water** - Water/ice attacks, strong vs fire
- **Elemental Wind** - Air/lightning attacks, fast and evasive
- **Elemental Earth** - Earth/rock attacks, defensive focus

#### Magical Schools  
- **Destruction** - Pure offensive magic, high damage
- **Support** - Buffs, utility, and enhancement magic
- **Defense** - Protective magic and damage reduction
- **Healing** - Restoration magic and status cure
- **Illusion** - Trickery, confusion, and misdirection

#### Specialized Affinities
- **Demonic Aura** - Dark magic with fear/drain effects

### Technique Properties (Advanced)

#### Special Properties
Techniques can have special properties that modify their behavior:

- **magicBased** - Affected by magic-enhancing effects
- **physicalBased** - Affected by physical-enhancing effects  
- **contact** - Makes physical contact (can trigger contact abilities)
- **areaEffect** - Hits multiple targets or has area damage
- **barrierBypassing** - Ignores defensive barriers
- **concentration** - Requires charging/channeling

## Technique Effects

Techniques can have additional effects beyond damage:

### Effect Types

#### Condition Effects
Apply status conditions to targets:

**Available Conditions:**
- **Exhausted** - Takes damage each turn (like poison/burn)
- **Stunned** - Cannot act (like paralysis/freeze)  
- **Confused** - May attack self or allies
- **Frenzied** - Attacks randomly, may hit allies
- **Charmed** - Controlled by opponent
- **Dazed** - Loses next turn only
- **Fear** - 25% chance to not act each turn
- **MagicSeal** - Cannot use magical techniques

**Effect Properties:**
- **Chance** - Probability of effect triggering (0.0-1.0)
- **Target** - Self, Opponent, or Party
- **Duration** - How many turns the condition lasts (default: 3)

#### Stat Boost Effects
Modify combat stats temporarily:

**Boostable Stats:**
- Attack, Defense, Magic Attack, Magic Defense, Speed

**Boost Levels:**
- Each boost level = +50% to that stat
- Range: -6 to +6 (so +6 = +300% of base stat)
- Typical boosts: 1-3 levels per technique

#### Heal Effects
Restore HP to targets:

- **Value** - Percentage of max HP to restore (0.1 = 10%, 1.0 = 100%)
- **Target** - Self, Opponent, or Party
- **Chance** - Probability of healing occurring

#### Volatile Effects
Temporary special states:

**Available Volatile Effects:**
- **ManaShield** - Damage reduces mana instead of HP
- **Immaterial** - Next attack phase through (like being intangible)
- **MistyAura** - Increased evasion
- **Channeling** - Preparing a powerful technique
- **FocusedAura** - Increased critical hit chance

### Example Technique Effects

```
Technique: "Dark Pulse"
- Main Effect: 75 damage, Destruction affinity
- Additional Effect: 20% chance to inflict Fear on opponent

Technique: "Speed Boost"  
- Main Effect: No damage, Support technique
- Additional Effect: 100% chance to boost own Speed by 2 levels

Technique: "Healing Magic"
- Main Effect: No damage, Support technique  
- Additional Effect: 100% chance to heal self for 50% max HP
```

## Traits (Passive Abilities)

Traits are unique passive abilities that make each character special. They can trigger at different times:

### Trait Trigger Types

#### Field Entry Effects
- **onEnterField** - Triggers when the character enters battle or switches in
- Examples: Weather effects, stat boosts, field hazards

#### Damage Modification
- **onReceiveDamage** - Modifies incoming damage
- **damageOutputMultiplier** - Modifies outgoing damage
- Examples: Type resistances, conditional damage boosts

#### Turn-Based Effects  
- **onTurnEnd** - Triggers at the end of each turn
- Examples: Gradual healing, stat changes, field effects

#### Combat Triggers
- **onStrike** - Triggers when the character attacks
- **preventCondition** - Can block certain status conditions
- **manaRestoreOnKO** - Restores mana when an opponent is defeated

### Example Traits

```
"Magic Perception"
- Effect: +15% accuracy against Illusion techniques
- Trigger: Passive bonus

"Regeneration"  
- Effect: Restores 12.5% max HP at end of each turn
- Trigger: onTurnEnd

"Fire Resistance"
- Effect: Takes 50% damage from Elemental Fire techniques  
- Trigger: onReceiveDamage

"Battle Fury"
- Effect: +25% damage when below 25% HP
- Trigger: damageOutputMultiplier
```

## Equipment

Equipment provides passive bonuses and can modify character performance:

### Equipment Types

#### Stat Modifiers
- **statMultiplier** - Modifies base stats (e.g., +20% to all stats)
- **critChanceBoost** - Increases critical hit chance
- **manaCostReduction** - Reduces mana costs of techniques

#### Combat Effects
- **damageOutputMultiplier** - Conditional damage bonuses
- **onTurnEnd** - End-of-turn effects
- **onReceiveStrike** - Triggers when hit by contact moves

### Example Equipment

```
"Magic Amplifier"
- Effect: +30% Magic Attack, +20% mana cost reduction
- Type: Stat modifier + mana efficiency

"Spiked Armor"  
- Effect: +15% Defense, damages attackers who use contact moves
- Type: Stat modifier + contact punishment

"Speed Boots"
- Effect: +25% Speed, +10% critical hit chance
- Type: Stat modifier + combat bonus
```

## Character Kit Template

Here's a template for submitting character kits:

```markdown
# Character Name: [Name]

## Basic Info
- **Description**: [2-3 sentences about the character]
- **Role**: [Tank/DPS/Support/Hybrid]
- **Difficulty**: [Beginner/Intermediate/Advanced]

## Stats (Total: ~325)
- **HP**: 65
- **Attack**: 45  
- **Defense**: 60
- **Magic Attack**: 70
- **Magic Defense**: 50
- **Speed**: 35

## Character Properties
- **Races**: [Human, Elf, etc.]
- **Disposition**: [Brave/Calm/etc.]

## Techniques
1. **[Technique Name]**
   - Affinity: [Destruction/Support/etc.]
   - Category: [Physical/Magical/Support]
   - Power: [0-160]
   - Precision: [0.7-1.0]  
   - Mana Cost: [0-40]
   - Description: [What the technique does]
   - Effects: [Any additional effects]

2. [Repeat for 4-8 techniques]

## Trait: [Trait Name]
- **Description**: [What the trait does]
- **Trigger**: [When it activates]
- **Effect**: [Mechanical effect]

## Equipment: [Equipment Name] (Optional)
- **Description**: [What the equipment does]
- **Effect**: [Mechanical effect]

## Strategy Notes
- [How to play this character effectively]
- [Strengths and weaknesses]
- [Good matchups and bad matchups]
```

## Balance Guidelines

### Power Level Guidelines
- **Beginner characters** should be straightforward with reliable techniques
- **Advanced characters** can have complex interactions and conditional power
- **Total power level** should be comparable across all characters

### Design Principles
1. **Every strength should have a weakness** - No character should excel at everything
2. **Interesting choices** - Players should have meaningful decisions in technique selection
3. **Counterplay exists** - Every strategy should have potential counters
4. **Unique identity** - Each character should feel different to play

### Red Flags (Avoid These)
- ❌ Techniques that deal 120+ damage with 100% accuracy and low mana cost
- ❌ Traits that provide immunity to entire categories of techniques  
- ❌ Effects with 100% chance to inflict multiple severe conditions
- ❌ Stat totals above 400 or below 250
- ❌ Characters with no clear weaknesses

### Green Flags (Good Design)
- ✅ High-risk, high-reward techniques (powerful but inaccurate or costly)
- ✅ Situational abilities that reward good timing
- ✅ Clear role identity (tank, damage dealer, support, etc.)
- ✅ Interesting technique combinations and synergies
- ✅ Balanced stat distribution with clear strengths/weaknesses

## Submission Process

1. **Create your character kit** using the template above
2. **Playtest internally** - think about how it would perform against existing characters  
3. **Submit for review** - post in the designated community channel
4. **Iterate based on feedback** - balance adjustments may be needed
5. **Implementation** - approved kits will be added to the game

Remember: The goal is to create fun, balanced characters that add strategic depth to the game while maintaining competitive integrity!