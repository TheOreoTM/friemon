import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK,
    SHADOW_BLAST,
    LIFE_DRAIN
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';

// Linie-specific interface that extends Character with additional metadata
interface LinieCharacter extends Character {
    chainStacks: number;
}

const linieStats = {
    hp: 75,
    attack: 65,
    defense: 60,
    magicAttack: 85,
    magicDefense: 65,
    speed: 75
}; // Total: 425

const linieAbility: Ability = {
    abilityName: "Chain Attack",
    abilityEffectString: `After using an attack, gain 1 Chain stack. All attacks deal 10% more damage per Chain stack. When not attacking in a turn, reset Chain to 0.`,
    
    abilityEndOfTurnEffect: (character: Character, battle: any) => {
        const linieChar = character as LinieCharacter;
        if ((character as any).attackedThisTurn) {
            linieChar.chainStacks = (linieChar.chainStacks || 0) + 1;
            battle.logMessage(`${character.name} continues her chain attack! (${linieChar.chainStacks} stacks)`);
        } else {
            if (linieChar.chainStacks > 0) {
                battle.logMessage(`${character.name} ended her chain.`);
            }
            linieChar.chainStacks = 0;
        }
    },

    damageOutputMultiplier: (user: Character, _target: Character, _technique: Technique) => {
        const linieChar = user as LinieCharacter;
        const chains = linieChar.chainStacks || 0;
        return 1 + (chains * 0.1);
    }
};

const Linie = new CharacterData({
    characterName: CharacterName.Linie,
    cosmetic: {
        emoji: CharacterEmoji.LINIE,
        color: 0xf7c1b1,
        description: 'A demon who specializes in continuous chain attacks that grow stronger with each successive strike.'
    },
    level: 40,
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