import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    VOLLZANBEL, 
    JUDRADJIM, 
    GRAUSAMKEIT,
    MANA_SHIELD,
    DETECT_MAGIC
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const serieStats = {
    hp: 95,
    attack: 60,
    defense: 80,
    magicAttack: 150,
    magicDefense: 110,
    speed: 75
};

const serieAbility = {
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

    abilityStartOfTurnEffect: (character: any, battle: any) => {
        if (character.toyingNextTurn) {
            battle.logMessage(`${character.name} acts aloof.`);
            character.toyingTurn = true;
            character.toyingNextTurn = false;
        } else {
            character.toyingTurn = false;
        }
    },

    damageOutputMultiplier: (user: any, _target: any, _technique: any) => {
        if (user.toyingTurn) {
            return 0.7; // 30% reduction when toying
        } else {
            return 1.3; // 30% bonus normally
        }
    },

    abilityAfterOwnTechniqueUse: (character: any, _battle: any, technique: any) => {
        if (technique.power > 0 && !character.toyingTurn) {
            character.toyingNextTurn = true;
        }
    }
};

const Serie = new CharacterData({
    characterName: CharacterName.Serie,
    cosmetic: {
        emoji: CharacterEmoji.SERIE,
        color: 0xe8b961,
        imageUrl: mediaLinks.serieCard,
        description: 'The Great Mage Serie, founder of the Continental Magic Association. An ancient elf with immense magical power who often toys with opponents.'
    },
    level: 90,
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