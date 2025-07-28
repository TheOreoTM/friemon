import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK, 
    DEFENSIVE_MAGIC,
    MANA_SHIELD
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const wirbelStats = {
    hp: 95,
    attack: 80,
    defense: 75,
    magicAttack: 105,
    magicDefense: 85,
    speed: 80
};

const wirbelAbility = {
    abilityName: "Resolve to Kill",
    abilityEffectString: `When opponent attacks while you have barriers active, increase attack by 20% of damage received, up to 20% of barrier strength.`,
    
    abilityOnDamageReceived: (character: any, battle: any, damage: number) => {
        const barrierStrength = character.barrierStrength || 0;
        if (barrierStrength > 0) {
            const attackGain = Math.min(damage * 0.2, barrierStrength * 0.2);
            character.currentStats.attack += attackGain;
            battle.logMessage(`${character.name} steels his resolve and gains ${Math.floor(attackGain)} attack!`);
        }
    }
};

const Wirbel = new CharacterData({
    characterName: CharacterName.Wirbel,
    cosmetic: {
        emoji: CharacterEmoji.WIRBEL,
        color: 0xa4a8b9,
        imageUrl: mediaLinks.wirbelCard,
        description: 'A methodical mage who grows stronger under pressure. His resolve hardens when facing adversity.'
    },
    level: 45,
    races: [Race.Human],
    baseStats: wirbelStats,
    techniques: [
        ZOLTRAAK,
        DEFENSIVE_MAGIC,
        MANA_SHIELD
    ],
    ability: wirbelAbility,
    additionalMetadata: {
        barrierStrength: 0,
        resolveToKill: true
    }
});

export default Wirbel;