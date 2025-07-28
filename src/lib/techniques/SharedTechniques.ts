import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, CombatCondition, EffectTarget } from '../types/enums';
import { createConditionEffect, createStatBoostEffect, createHealEffect } from '../character/TechniqueEffect';

// ============== BASIC TECHNIQUES ==============

export const ZOLTRAAK = new Technique({
    name: 'Zoltraak',
    description: 'Basic offensive spell - fires piercing magic projectiles',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 70,
    precision: 0.95,
    manaCost: 15,
    initiative: 0,
    effects: [],
    properties: { magicBased: true }
});

export const HEALING_MAGIC = new Technique({
    name: 'Healing Magic',
    description: 'Restore HP using healing magic',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 1,
    effects: [
        createHealEffect(40, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true }
});

export const MANA_SHIELD = new Technique({
    name: 'Mana Shield',
    description: 'Creates a magical barrier that absorbs damage',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 18,
    initiative: 2,
    effects: [
        createStatBoostEffect('magicDefense', 3, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true }
});

export const DEFENSIVE_MAGIC = new Technique({
    name: 'Defensive Magic',
    description: 'General defensive enchantment',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 16,
    initiative: 1,
    effects: [
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true }
});

// ============== BINDING TECHNIQUES ==============

export const SORGANEIL = new Technique({
    name: 'Sorganeil',
    description: 'Binding magic that restricts the opponent\'s movement',
    affinity: Affinity.Support,
    category: TechniqueCategory.Magical,
    power: 25,
    precision: 0.85,
    manaCost: 25,
    initiative: 0,
    effects: [
        createConditionEffect(CombatCondition.Stunned, 0.6, EffectTarget.Opponent)
    ],
    properties: { magicBased: true }
});

export const BINDING_SPELL = new Technique({
    name: 'Binding Spell',
    description: 'Magical restraints that slow the enemy',
    affinity: Affinity.Support,
    category: TechniqueCategory.Magical,
    power: 15,
    precision: 0.9,
    manaCost: 20,
    initiative: 1,
    effects: [
        createStatBoostEffect('speed', -2, 0.8, EffectTarget.Opponent)
    ],
    properties: { magicBased: true }
});

// ============== ADVANCED DESTRUCTION MAGIC ==============

export const JUDRADJIM = new Technique({
    name: 'Judradjim',
    description: 'Lightning magic that strikes with electric fury',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 95,
    precision: 0.88,
    manaCost: 35,
    initiative: -1,
    effects: [
        createConditionEffect(CombatCondition.Stunned, 0.3, EffectTarget.Opponent)
    ],
    properties: { magicBased: true }
});

export const VOLLZANBEL = new Technique({
    name: 'Vollzanbel',
    description: 'Explosive fire magic that deals massive damage',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 110,
    precision: 0.82,
    manaCost: 45,
    initiative: -2,
    effects: [],
    properties: { magicBased: true, areaEffect: true }
});

export const GRAUSAMKEIT = new Technique({
    name: 'Grausamkeit',
    description: 'Cruel magic that tears through defenses',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 85,
    precision: 0.9,
    manaCost: 30,
    initiative: 0,
    effects: [],
    properties: { magicBased: true, armorPiercing: true }
});

// ============== ANALYSIS AND DETECTION ==============

export const ANALYSIS = new Technique({
    name: 'Analysis',
    description: 'Study the opponent to gain tactical advantage',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 12,
    initiative: 2,
    effects: [
        createStatBoostEffect('magicAttack', 1, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true }
});

export const DETECT_MAGIC = new Technique({
    name: 'Detect Magic',
    description: 'Sense magical auras and hidden spells',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 10,
    initiative: 3,
    effects: [],
    properties: { magicBased: true }
});

// ============== PHYSICAL TECHNIQUES ==============

export const DRAGON_SLASH = new Technique({
    name: 'Dragon Slash',
    description: 'Powerful sword technique capable of slaying dragons',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 120,
    precision: 0.85,
    manaCost: 25,
    initiative: -1,
    effects: [],
    properties: { weaponBased: true, dragonSlayer: true }
});

export const BERSERKER_RAGE = new Technique({
    name: 'Berserker Rage',
    description: 'Enter a rage state to increase attack power',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 0,
    effects: [
        createStatBoostEffect('attack', 4, 1.0, EffectTarget.Self),
        createStatBoostEffect('defense', -2, 1.0, EffectTarget.Self)
    ],
    properties: { weaponBased: true }
});

export const GUARD_BREAKER = new Technique({
    name: 'Guard Breaker',
    description: 'Strike that penetrates enemy defenses',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 80,
    precision: 0.9,
    manaCost: 18,
    initiative: 0,
    effects: [],
    properties: { weaponBased: true, armorPiercing: true }
});

export const HOLY_STRIKE = new Technique({
    name: 'Holy Strike',
    description: 'Divine-blessed attack effective against demons',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 85,
    precision: 0.92,
    manaCost: 22,
    initiative: 0,
    effects: [],
    properties: { weaponBased: true, holyDamage: true }
});

// ============== SUPPORT TECHNIQUES ==============

export const COURAGE_BOOST = new Technique({
    name: 'Courage Boost',
    description: 'Inspire courage to boost all combat stats',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 25,
    initiative: 2,
    effects: [
        createStatBoostEffect('attack', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('speed', 1, 1.0, EffectTarget.Self)
    ],
    properties: { inspirational: true }
});

export const SHIELD_WALL = new Technique({
    name: 'Shield Wall',
    description: 'Create an impenetrable defensive barrier',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 30,
    initiative: 3,
    effects: [
        createStatBoostEffect('defense', 5, 1.0, EffectTarget.Self)
    ],
    properties: { defensive: true }
});

export const SPEED_BOOST = new Technique({
    name: 'Speed Boost',
    description: 'Enhance movement and reaction speed',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 15,
    initiative: 2,
    effects: [
        createStatBoostEffect('speed', 3, 1.0, EffectTarget.Self)
    ],
    properties: { enhancement: true }
});

// ============== DEMON/DARK TECHNIQUES ==============

export const SHADOW_BLAST = new Technique({
    name: 'Shadow Blast',
    description: 'Dark energy attack that drains the soul',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 85,
    precision: 0.9,
    manaCost: 28,
    initiative: 0,
    effects: [
        createConditionEffect(CombatCondition.Fear, 0.4, EffectTarget.Opponent)
    ],
    properties: { magicBased: true, darkMagic: true }
});

export const LIFE_DRAIN = new Technique({
    name: 'Life Drain',
    description: 'Steal life force from the enemy',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 60,
    precision: 0.92,
    manaCost: 25,
    initiative: 0,
    effects: [
        createHealEffect(30, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true, darkMagic: true, lifeDrain: true }
});

export const DEMONIC_AURA = new Technique({
    name: 'Demonic Aura',
    description: 'Intimidating presence that weakens enemies',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 1,
    effects: [
        createStatBoostEffect('attack', -2, 0.8, EffectTarget.Opponent),
        createConditionEffect(CombatCondition.Fear, 0.6, EffectTarget.Opponent)
    ],
    properties: { aura: true, darkMagic: true }
});

// ============== SPECIAL CHARACTER TECHNIQUES ==============

export const GODDESS_BLESSING = new Technique({
    name: 'Goddess Blessing',
    description: 'Divine magic that heals and purifies',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 35,
    initiative: 2,
    effects: [
        createHealEffect(60, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true, divine: true, removesCurses: true }
});

export const MAGE_KILLER = new Technique({
    name: 'Mage Killer',
    description: 'Anti-magic technique that disrupts spellcasters',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 70,
    precision: 0.95,
    manaCost: 20,
    initiative: 1,
    effects: [
        createConditionEffect(CombatCondition.MagicSeal, 0.7, EffectTarget.Opponent)
    ],
    properties: { antiMagic: true, weaponBased: true }
});

export const CUTTING_MAGIC = new Technique({
    name: 'Cutting Magic',
    description: 'Slicing spell that cuts through anything',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 95,
    precision: 0.88,
    manaCost: 32,
    initiative: 0,
    effects: [],
    properties: { magicBased: true, armorPiercing: true, slashing: true }
});

export const FOLK_MAGIC = new Technique({
    name: 'Folk Magic',
    description: 'Simple but effective everyday magic',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 35,
    precision: 0.98,
    manaCost: 8,
    initiative: 1,
    effects: [],
    properties: { magicBased: true, reliable: true }
});

// ============== TECHNIQUE COLLECTIONS BY CHARACTER TYPE ==============

export const BASIC_MAGE_TECHNIQUES = [
    ZOLTRAAK,
    HEALING_MAGIC,
    MANA_SHIELD,
    ANALYSIS
];

export const ADVANCED_MAGE_TECHNIQUES = [
    JUDRADJIM,
    VOLLZANBEL,
    GRAUSAMKEIT,
    SORGANEIL
];

export const WARRIOR_TECHNIQUES = [
    DRAGON_SLASH,
    BERSERKER_RAGE,
    GUARD_BREAKER,
    HOLY_STRIKE
];

export const SUPPORT_TECHNIQUES = [
    COURAGE_BOOST,
    SHIELD_WALL,
    SPEED_BOOST,
    DEFENSIVE_MAGIC
];

export const DEMON_TECHNIQUES = [
    SHADOW_BLAST,
    LIFE_DRAIN,
    DEMONIC_AURA
];

export const PRIEST_TECHNIQUES = [
    GODDESS_BLESSING,
    HEALING_MAGIC,
    HOLY_STRIKE
];

// ============== EXPORT ALL TECHNIQUES ==============

export const ALL_TECHNIQUES = [
    // Basic
    ZOLTRAAK,
    HEALING_MAGIC,
    MANA_SHIELD,
    DEFENSIVE_MAGIC,
    
    // Binding
    SORGANEIL,
    BINDING_SPELL,
    
    // Advanced Destruction
    JUDRADJIM,
    VOLLZANBEL,
    GRAUSAMKEIT,
    
    // Analysis
    ANALYSIS,
    DETECT_MAGIC,
    
    // Physical
    DRAGON_SLASH,
    BERSERKER_RAGE,
    GUARD_BREAKER,
    HOLY_STRIKE,
    
    // Support
    COURAGE_BOOST,
    SHIELD_WALL,
    SPEED_BOOST,
    
    // Dark/Demon
    SHADOW_BLAST,
    LIFE_DRAIN,
    DEMONIC_AURA,
    
    // Special
    GODDESS_BLESSING,
    MAGE_KILLER,
    CUTTING_MAGIC,
    FOLK_MAGIC
];

export function getTechniqueByName(name: string): Technique | undefined {
    return ALL_TECHNIQUES.find(tech => tech.name.toLowerCase() === name.toLowerCase());
}

export function getTechniquesByType(type: 'mage' | 'warrior' | 'support' | 'demon' | 'priest'): Technique[] {
    switch (type) {
        case 'mage':
            return [...BASIC_MAGE_TECHNIQUES, ...ADVANCED_MAGE_TECHNIQUES];
        case 'warrior':
            return WARRIOR_TECHNIQUES;
        case 'support':
            return SUPPORT_TECHNIQUES;
        case 'demon':
            return DEMON_TECHNIQUES;
        case 'priest':
            return PRIEST_TECHNIQUES;
        default:
            return [];
    }
}