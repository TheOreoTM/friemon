import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';

// Serie-specific character interface with additional metadata
interface SerieCharacter extends Character {
    manaSuppressed: boolean;
    ignoreManaSuppressed: boolean;
    toyingNextTurn: boolean;
    toyingTurn: boolean;
}
import { 
    VOLLZANBEL, 
    JUDRADJIM, 
    GRAUSAMKEIT,
    MANA_SHIELD,
    DETECT_MAGIC
} from '../techniques/SharedTechniques';

const serieStats = {
    hp: 80,
    attack: 55,
    defense: 70,
    magicAttack: 125,
    magicDefense: 85,
    speed: 70
}; // Total: 435

const serieAbility: Ability = {
    abilityName: "Toying Around",
    abilityEffectString: `Any attack used by this character has its damage increased by 30%. The turn after attacking, damage is reduced by 30% as Serie becomes aloof.`,
    
    subAbilities: [
        {
            name: "Mana Suppression",
            description: "Hide the amount of HP this character has."
        },
        {
            name: "Serie's Intuition",
            description: "See past opponent's Mana Suppression and predict their moves."
        }
    ],

    abilityStartOfTurnEffect: (character: Character, battle: any) => {
        const serieChar = character as SerieCharacter;
        if (serieChar.toyingNextTurn) {
            battle.logMessage(`${character.name} acts aloof.`);
            serieChar.toyingTurn = true;
            serieChar.toyingNextTurn = false;
        } else {
            serieChar.toyingTurn = false;
        }
    },

    damageOutputMultiplier: (user: Character, _target: Character, _technique: Technique) => {
        const serieChar = user as SerieCharacter;
        if (serieChar.toyingTurn) {
            return 0.7; // 30% reduction when toying
        } else {
            return 1.3; // 30% bonus normally
        }
    },

    abilityAfterOwnTechniqueUse: (character: Character, _battle: any, technique: Technique) => {
        const serieChar = character as SerieCharacter;
        if (technique.power > 0 && !serieChar.toyingTurn) {
            serieChar.toyingNextTurn = true;
        }
    }
};

const Serie = new CharacterData({
    characterName: CharacterName.Serie,
    cosmetic: {
        emoji: CharacterEmoji.SERIE,
        color: 0xe8b961,
        description: 'The Great Mage Serie, founder of the Continental Magic Association. An ancient elf with immense magical power who often toys with opponents.'
    },
    level: 70,
    races: [Race.Elf],
    baseStats: serieStats,
    techniques: [
        VOLLZANBEL,
        JUDRADJIM,
        GRAUSAMKEIT,
        MANA_SHIELD,
        DETECT_MAGIC
    ],
    ability: serieAbility,
    additionalMetadata: {
        manaSuppressed: true,
        ignoreManaSuppressed: true,
        toyingNextTurn: false,
        toyingTurn: false
    }
});

export default Serie;