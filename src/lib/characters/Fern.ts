import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { 
    SORGANEIL, 
    SPEED_BOOST, 
    MANA_SHIELD,
    DEFENSIVE_MAGIC
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';

// Fern's unique techniques
const QUICK_ZOLTRAAK = new Technique({
    name: 'Quick Zoltraak',
    description: 'A rapid-fire version of the basic offensive spell',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 65,
    precision: 0.98,
    manaCost: 12,
    initiative: 1,
    effects: [],
    properties: { magicBased: true, rapid: true }
});

const MANA_CONTROL = new Technique({
    name: 'Mana Control',
    description: 'Precise mana manipulation for efficient spellcasting',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 8,
    initiative: 0,
    effects: [
        createStatBoostEffect('magicAttack', 1, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true }
});

const fernStats = {
    hp: 70,
    attack: 50,
    defense: 55,
    magicAttack: 90,
    magicDefense: 70,
    speed: 80
}; // Total: 415

const fernAbility: Ability = {
    abilityName: "Prodigious Talent",
    abilityEffectString: `Natural magical talent allows for rapid improvement and efficient spellcasting. Restore mana equal to 8% of max mana each turn. Fast magical techniques deal 20% more damage.`,
    
    subAbilities: [
        {
            name: "Mana Suppression",
            description: "Hide the amount of HP this character has."
        },
        {
            name: "Keen Eye",
            description: "See past the opponent's Mana Suppression."
        }
    ],

    abilityEndOfTurnEffect: (character: Character, battle: any) => {
        // Restore mana each turn
        const manaRestore = Math.floor(character.maxMana * 0.08);
        character.restoreMana(manaRestore);
        if (manaRestore > 0) {
            battle.logMessage(`${character.name}'s talent restores ${manaRestore} mana!`);
        }
    },

    damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
        // Bonus for fast magical techniques
        if (technique.properties?.magicBased && technique.initiative >= 0) {
            return 1.2; // 20% bonus for fast magical techniques
        }
        return 1.0;
    },

    preventCondition: (_character: Character, condition: CombatCondition) => {
        // Training provides resistance to magic seal
        if (condition === CombatCondition.MagicSeal) {
            return Math.random() < 0.4; // 40% chance to resist magic seal
        }
        return false;
    }
};

const Fern = new CharacterData({
    characterName: CharacterName.Fern,
    cosmetic: {
        emoji: CharacterEmoji.FERN,
        color: 0x9b59b6,
        description: "Frieren's human apprentice. A prodigious young mage with exceptional talent and rapid spellcasting abilities."
    },
    level: 35,
    races: [Race.Human],
    baseStats: fernStats,
    techniques: [
        QUICK_ZOLTRAAK,
        SPEED_BOOST,
        MANA_CONTROL,
        MANA_SHIELD,
        SORGANEIL,
        DEFENSIVE_MAGIC
    ],
    ability: fernAbility,
    additionalMetadata: {
        manaSuppressed: true,
        ignoreManaSuppressed: true,
        fernBarrage: 0
    }
});

export default Fern;