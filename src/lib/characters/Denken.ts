import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK, 
    JUDRADJIM, 
    DEFENSIVE_MAGIC,
    MANA_SHIELD
} from '../techniques/SharedTechniques';

// Denken-specific interface that extends Character with additional metadata
interface DenkenCharacter extends Character {
    perseveranceStacks: number;
}

const denkenStats = {
    hp: 90,
    attack: 60,
    defense: 70,
    magicAttack: 95,
    magicDefense: 80,
    speed: 55
}; // Total: 450

const denkenAbility: Ability = {
    abilityName: "Perseverance",
    abilityEffectString: `Start with 3 Perseverance stacks. When HP reaches 0 or below, lose 1 stack and continue fighting. Lose when stacks reach 0 or HP drops below -40.`,
    
    abilityEndOfTurnEffect: (character: Character, battle: any) => {
        const denkenChar = character as DenkenCharacter;
        if (character.currentHP <= 0) {
            const stacks = denkenChar.perseveranceStacks || 3;
            if (stacks > 0) {
                denkenChar.perseveranceStacks = stacks - 1;
                if (character.currentHP <= -20) {
                    denkenChar.perseveranceStacks = Math.max(0, denkenChar.perseveranceStacks - 1);
                }
                
                if (denkenChar.perseveranceStacks > 0) {
                    battle.logMessage(`${character.name} steels himself! (${denkenChar.perseveranceStacks} stacks remaining)`);
                } else {
                    battle.logMessage(`${character.name}'s strength finally fades.`);
                }
            }
        }
    }
};

const Denken = new CharacterData({
    characterName: CharacterName.Denken,
    cosmetic: {
        emoji: CharacterEmoji.DENKEN,
        color: 0x82574f,
        description: 'An experienced mage with incredible perseverance. Can continue fighting even when others would fall.'
    },
    level: 45,
    races: [Race.Human],
    baseStats: denkenStats,
    techniques: [
        ZOLTRAAK,
        JUDRADJIM,
        DEFENSIVE_MAGIC,
        MANA_SHIELD
    ],
    ability: denkenAbility,
    additionalMetadata: {
        perseveranceStacks: 3
    }
});

export default Denken;