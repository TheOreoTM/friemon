import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    SPEED_BOOST,
    ZOLTRAAK
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const laufenStats = {
    hp: 70,
    attack: 65,
    defense: 60,
    magicAttack: 85,
    magicDefense: 70,
    speed: 120
};

const laufenAbility = {
    abilityName: "Graze",
    abilityEffectString: `Reduce opponent's attack damage by speed difference percentage. High speed allows dodging attacks.`,
    
    abilityOnDamageReceived: (character: any, battle: any, damage: number) => {
        const opponentSpeed = battle.getOpponent(character).getEffectiveStats().speed;
        const speedDiff = character.getEffectiveStats().speed - opponentSpeed;
        const grazeReduction = Math.min(Math.max(speedDiff / 100, 0), 0.8);
        
        const reducedDamage = Math.floor(damage * (1 - grazeReduction));
        if (grazeReduction > 0) {
            battle.logMessage(`${character.name} grazes the attack with superior speed!`);
        }
        return reducedDamage;
    }
};

const Laufen = new CharacterData({
    characterName: CharacterName.Laufen,
    cosmetic: {
        emoji: CharacterEmoji.LAUFEN,
        color: 0xcf7457,
        imageUrl: mediaLinks.laufenCard,
        description: 'An incredibly fast mage who specializes in evasion and hit-and-run tactics.'
    },
    level: 35,
    races: [Race.Human],
    baseStats: laufenStats,
    techniques: [
        SPEED_BOOST,
        ZOLTRAAK
    ],
    ability: laufenAbility,
    additionalMetadata: {
        grazeSpecialist: true
    }
});

export default Laufen;