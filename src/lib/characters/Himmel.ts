import { CharacterData } from '../character/CharacterData';
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
import mediaLinks from '../formatting/mediaLinks';

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
    hp: 100,
    attack: 110,
    defense: 90,
    magicAttack: 70,
    magicDefense: 80,
    speed: 85
};

const himmelAbility = {
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

    abilityStartOfTurnEffect: (character: any, battle: any) => {
        // Hero's presence - gain stats at start of first turn
        if (battle.state.turn === 1) {
            character.currentStats.attack += 2;
            character.currentStats.defense += 2;
            character.currentStats.magicAttack += 2;
            character.currentStats.magicDefense += 2;
            character.currentStats.speed += 2;
            battle.logMessage(`${character.name}'s heroic presence strengthens him!`);
        }
    },

    damageOutputMultiplier: (user: any, _target: any, _technique: any) => {
        // Count positive status effects
        const buffCount = user.statusEffects?.filter((effect: any) => effect.beneficial).length || 0;
        return 1 + (buffCount * 0.05); // 5% per buff
    },

    damageInputMultiplier: (_user: any, target: any, technique: any) => {
        // Resistance to dark/demon magic
        if (technique.properties?.darkMagic || target.races?.includes(Race.Demon)) {
            return 0.8; // 20% damage reduction
        }
        return 1.0;
    },

    preventCondition: (_character: any, condition: CombatCondition) => {
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
        imageUrl: mediaLinks.himmelCard,
        description: 'The legendary hero of the party. A brave and inspiring leader with divine protection and unwavering courage.'
    },
    level: 60,
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