import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK, 
    ANALYSIS,
    MANA_SHIELD
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const edelStats = {
    hp: 75,
    attack: 60,
    defense: 70,
    magicAttack: 95,
    magicDefense: 85,
    speed: 80
};

const edelAbility = {
    abilityName: "A Superior Opponent",
    abilityEffectString: `While making eye contact with the opponent, all moves have +1 initiative. Memory specialist - opponent's techniques become visible.`,
    
    subAbilities: [
        {
            name: "Memory Transference Specialist",
            description: "Opponent's used techniques are revealed."
        }
    ],

    abilityStartOfTurnEffect: (character: any, battle: any) => {
        const eyeContact = character.eyeContactStacks || 0;
        if (eyeContact > 0) {
            character.eyeContactStacks = eyeContact - 1;
            battle.logMessage(`${character.name} maintains eye contact - moves gain priority!`);
        }
    }
};

const Edel = new CharacterData({
    characterName: CharacterName.Edel,
    cosmetic: {
        emoji: CharacterEmoji.EDEL,
        color: 0xae9292,
        imageUrl: mediaLinks.edelCard,
        description: 'A skilled mage who specializes in memory magic and psychological warfare through intense eye contact.'
    },
    level: 40,
    races: [Race.Human],
    baseStats: edelStats,
    techniques: [
        ZOLTRAAK,
        ANALYSIS,
        MANA_SHIELD
    ],
    ability: edelAbility,
    additionalMetadata: {
        eyeContactStacks: 0,
        memorySpecialist: true
    }
});

export default Edel;