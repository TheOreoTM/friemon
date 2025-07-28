import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK,
    SHADOW_BLAST,
    LIFE_DRAIN
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const linieStats = {
    hp: 90,
    attack: 75,
    defense: 70,
    magicAttack: 105,
    magicDefense: 80,
    speed: 85
};

const linieAbility = {
    abilityName: "Chain Attack",
    abilityEffectString: `After using an attack, gain 1 Chain stack. All attacks deal 10% more damage per Chain stack. When not attacking in a turn, reset Chain to 0.`,
    
    abilityEndOfTurnEffect: (character: any, battle: any) => {
        if (character.attackedThisTurn) {
            character.chainStacks = (character.chainStacks || 0) + 1;
            battle.logMessage(`${character.name} continues her chain attack! (${character.chainStacks} stacks)`);
        } else {
            if (character.chainStacks > 0) {
                battle.logMessage(`${character.name} ended her chain.`);
            }
            character.chainStacks = 0;
        }
    },

    damageOutputMultiplier: (user: any, _target: any, _technique: any) => {
        const chains = user.chainStacks || 0;
        return 1 + (chains * 0.1);
    }
};

const Linie = new CharacterData({
    characterName: CharacterName.Linie,
    cosmetic: {
        emoji: CharacterEmoji.LINIE,
        color: 0xf7c1b1,
        imageUrl: mediaLinks.linieCard,
        description: 'A demon who specializes in continuous chain attacks that grow stronger with each successive strike.'
    },
    level: 50,
    races: [Race.Demon],
    baseStats: linieStats,
    techniques: [
        ZOLTRAAK,
        SHADOW_BLAST,
        LIFE_DRAIN
    ],
    ability: linieAbility,
    additionalMetadata: {
        chainStacks: 0
    }
});

export default Linie;