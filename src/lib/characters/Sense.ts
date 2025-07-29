import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    DETECT_MAGIC, 
    DEFENSIVE_MAGIC,
    BINDING_SPELL
} from '../techniques/SharedTechniques';

// Sense-specific interface that extends Character with additional metadata
interface SenseCharacter extends Character {
    observations: number;
}

const senseStats = {
    hp: 70,
    attack: 55,
    defense: 75,
    magicAttack: 85,
    magicDefense: 80,
    speed: 60
}; // Total: 425

const senseAbility: Ability = {
    abilityName: "Proctor",
    abilityEffectString: `Every turn this character doesn't attack, gain 1 observation. Every turn attacking loses 1 observation. Win when reaching 15 observations.`,
    
    abilityEndOfTurnEffect: (character: Character, battle: any) => {
        const senseChar = character as SenseCharacter;
        if ((character as any).attackedThisTurn) {
            senseChar.observations = Math.max(0, (senseChar.observations || 0) - 1);
            battle.logMessage(`${character.name} went on the offensive!`);
        } else {
            senseChar.observations = (senseChar.observations || 0) + 1;
            battle.logMessage(`${character.name} continues to observe peacefully. (${senseChar.observations}/15)`);
            
            if (senseChar.observations >= 15) {
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