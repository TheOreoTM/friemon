import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
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
import type { Battle } from '../battle/Battle';

// Stark-specific interface that extends Character with additional metadata
interface StarkCharacter extends Character {
    resolve: number;
    dragonSlayerTraining: boolean;
}

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
    hp: 100,
    attack: 95,
    defense: 70,
    magicAttack: 35,
    magicDefense: 50,
    speed: 65
}; // Total: 415

const starkAbility: Ability = {
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

    abilityAfterOwnTechniqueUse: (character: Character, _battle: Battle, technique: Technique) => {
        const starkChar = character as StarkCharacter;
        // Some techniques modify resolve
        if (technique.name === 'Resolve Strike') {
            starkChar.resolve = (starkChar.resolve || 0) + 1;
        } else if (technique.name === 'Tactical Retreat') {
            starkChar.resolve = (starkChar.resolve || 0) - 1;
        }
    },

    damageOutputMultiplier: (user: Character, _target: Character, _technique: Technique) => {
        const starkChar = user as StarkCharacter;
        const resolve = starkChar.resolve || 0;
        if (resolve > 0) {
            return 1.2; // 20% bonus when brave
        } else if (resolve < 0) {
            return 0.8; // 20% penalty when cowardly
        }
        return 1.0; // Normal damage when neutral
    },

    preventCondition: (_character: Character, condition: CombatCondition) => {
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