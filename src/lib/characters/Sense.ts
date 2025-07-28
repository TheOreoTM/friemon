import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    DETECT_MAGIC, 
    DEFENSIVE_MAGIC,
    BINDING_SPELL
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const senseStats = {
    hp: 85,
    attack: 65,
    defense: 90,
    magicAttack: 100,
    magicDefense: 95,
    speed: 70
};

const senseAbility = {
    abilityName: "Proctor",
    abilityEffectString: `Every turn this character doesn't attack, gain 1 observation. Every turn attacking loses 1 observation. Win when reaching 15 observations.`,
    
    abilityEndOfTurnEffect: (character: any, battle: any) => {
        if (character.attackedThisTurn) {
            character.observations = Math.max(0, (character.observations || 0) - 1);
            battle.logMessage(`${character.name} went on the offensive!`);
        } else {
            character.observations = (character.observations || 0) + 1;
            battle.logMessage(`${character.name} continues to observe peacefully. (${character.observations}/15)`);
            
            if (character.observations >= 15) {
                battle.logMessage(`${character.name} has finished proctoring the test. The examinee did not pass in time.`);
                battle.endBattle('proctor_victory');
            }
        }
    }
};

const Sense = new CharacterData({
    characterName: CharacterName.Sense,
    cosmetic: {
        emoji: CharacterEmoji.SENSE,
        color: 0xb6a493,
        imageUrl: mediaLinks.senseCard,
        description: 'A patient proctor who observes and evaluates. Wins through careful observation rather than direct combat.'
    },
    level: 50,
    races: [Race.Human],
    baseStats: senseStats,
    techniques: [
        DETECT_MAGIC,
        DEFENSIVE_MAGIC,
        BINDING_SPELL
    ],
    ability: senseAbility,
    additionalMetadata: {
        observations: 0
    }
});

export default Sense;