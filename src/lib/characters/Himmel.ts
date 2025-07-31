import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { 
    HOLY_STRIKE, 
    COURAGE_BOOST, 
    HEALING_MAGIC, 
    SHIELD_WALL,
    SPEED_BOOST
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';
import type { Battle } from '../battle/Battle';

// Himmel's unique technique
const HEROIC_INSPIRATION = new Technique({
    name: 'Heroic Inspiration',
    description: 'Inspire allies and boost party morale with heroic presence',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 2,
    effects: [
        createStatBoostEffect('attack', 3, 1.0, EffectTarget.Self),
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('speed', 2, 1.0, EffectTarget.Self)
    ],
    properties: { inspirational: true }
});

const himmelStats = {
    hp: 85,
    attack: 90,
    defense: 75,
    magicAttack: 55,
    magicDefense: 65,
    speed: 70
}; // Total: 440

const himmelAbility: Ability = {
    abilityName: "The Hero",
    abilityEffectString: `As the legendary hero, Himmel inspires courage in himself and demoralizes enemies. At the start of battle, gain +2 to all stats. For each buff effect active, attacks deal 5% more damage.`,
    
    subAbilities: [
        {
            name: "Hero's Presence",
            description: "Enemies are more likely to be affected by fear and intimidation."
        },
        {
            name: "Divine Protection",
            description: "Reduced damage from demon and dark magic attacks."
        }
    ],

    abilityStartOfTurnEffect: (character: Character, battle: Battle) => {
        // Hero's presence - gain stats at start of first turn
        if (battle.state.turn === 1) {
            character.modifyStatBoost('attack', 2);
            character.modifyStatBoost('defense', 2);
            character.modifyStatBoost('magicAttack', 2);
            character.modifyStatBoost('magicDefense', 2);
            character.modifyStatBoost('speed', 2);
            battle.addToBattleLog(`${character.name}'s heroic presence strengthens him!`);
        }
    },

    damageOutputMultiplier: (_user: Character, _target: Character, _technique: Technique) => {
        // Count positive status effects - simplified as we don't have a statusEffects property
        // This would need to be implemented based on your actual status effect system
        const buffCount = 0; // Placeholder - implement based on your status effect system
        return 1 + (buffCount * 0.05); // 5% per buff
    },

    damageInputMultiplier: (_user: Character, target: Character, technique: Technique) => {
        // Resistance to dark/demon magic
        if (technique.properties?.darkMagic || target.races?.includes(Race.Demon)) {
            return 0.8; // 20% damage reduction
        }
        return 1.0;
    },

    preventCondition: (_character: Character, condition: CombatCondition) => {
        // Hero's resolve resists fear and charm
        if (condition === CombatCondition.Fear || condition === CombatCondition.Charmed) {
            return Math.random() < 0.6; // 60% chance to resist
        }
        return false;
    }
};

const Himmel = new CharacterData({
    characterName: CharacterName.Himmel,
    cosmetic: {
        emoji: CharacterEmoji.HIMMEL,
        color: 0xb4c9e7,
        description: 'The legendary hero of the party. A brave and inspiring leader with divine protection and unwavering courage.'
    },
    level: 35,
    races: [Race.Human],
    baseStats: himmelStats,
    techniques: [
        HOLY_STRIKE,
        HEROIC_INSPIRATION,
        COURAGE_BOOST,
        HEALING_MAGIC,
        SHIELD_WALL,
        SPEED_BOOST
    ],
    ability: himmelAbility,
    additionalMetadata: {
        heroicPresence: true,
        divineProtection: true
    }
});

export default Himmel;