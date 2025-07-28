import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { 
    DRAGON_SLASH, 
    BERSERKER_RAGE, 
    GUARD_BREAKER
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';
import mediaLinks from '../formatting/mediaLinks';

// Stark's unique techniques
const RESOLVE_STRIKE = new Technique({
    name: 'Resolve Strike',
    description: 'A powerful attack that grows stronger with determination',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 80,
    precision: 0.9,
    manaCost: 15,
    initiative: 0,
    effects: [
        createStatBoostEffect('attack', 1, 1.0, EffectTarget.Self)
    ],
    properties: { weaponBased: true, physical: true }
});

const COWARD_FLEE = new Technique({
    name: 'Tactical Retreat',
    description: 'Sometimes discretion is the better part of valor',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 5,
    initiative: 3,
    effects: [
        createStatBoostEffect('speed', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('attack', -1, 1.0, EffectTarget.Self)
    ],
    properties: { movement: true }
});

const starkStats = {
    hp: 125,
    attack: 115,
    defense: 85,
    magicAttack: 45,
    magicDefense: 60,
    speed: 75
};

const starkAbility = {
    abilityName: "Bravest Coward",
    abilityEffectString: `Using attacks while resolve is negative reduces damage by 20%. Using attacks while resolve is positive increases damage by 20%. Attacks do normal damage when resolve is 0.`,
    
    subAbilities: [
        {
            name: "Dragon Slayer Training",
            description: "Extra damage against large and dragon-type enemies."
        },
        {
            name: "Eisen's Teachings",
            description: "Increased resistance to physical debuffs."
        }
    ],

    abilityAfterOwnTechniqueUse: (character: any, _battle: any, technique: any) => {
        // Some techniques modify resolve
        if (technique.name === 'Resolve Strike') {
            character.resolve = (character.resolve || 0) + 1;
        } else if (technique.name === 'Tactical Retreat') {
            character.resolve = (character.resolve || 0) - 1;
        }
    },

    damageOutputMultiplier: (user: any, _target: any, _technique: any) => {
        const resolve = user.resolve || 0;
        if (resolve > 0) {
            return 1.2; // 20% bonus when brave
        } else if (resolve < 0) {
            return 0.8; // 20% penalty when cowardly
        }
        return 1.0; // Normal damage when neutral
    },

    preventCondition: (_character: any, condition: CombatCondition) => {
        // Training provides some resistance to physical debuffs
        if (condition === CombatCondition.Exhausted || condition === CombatCondition.Stunned) {
            return Math.random() < 0.3; // 30% chance to resist
        }
        return false;
    }
};

const Stark = new CharacterData({
    characterName: CharacterName.Stark,
    cosmetic: {
        emoji: CharacterEmoji.STARK,
        color: 0xb30c0c,
        imageUrl: mediaLinks.starkCard,
        description: 'A warrior trained by the legendary dwarf Eisen. Despite his cowardly nature, he possesses incredible strength and potential.'
    },
    level: 35,
    races: [Race.Human],
    baseStats: starkStats,
    techniques: [
        DRAGON_SLASH,
        RESOLVE_STRIKE,
        BERSERKER_RAGE,
        GUARD_BREAKER,
        COWARD_FLEE
    ],
    ability: starkAbility,
    additionalMetadata: {
        resolve: 0,
        dragonSlayerTraining: true
    }
});

export default Stark;