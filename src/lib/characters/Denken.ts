import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    ZOLTRAAK, 
    JUDRADJIM, 
    DEFENSIVE_MAGIC,
    MANA_SHIELD
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const denkenStats = {
    hp: 110,
    attack: 70,
    defense: 85,
    magicAttack: 115,
    magicDefense: 95,
    speed: 65
};

const denkenAbility = {
    abilityName: "Perseverance",
    abilityEffectString: `Start with 3 Perseverance stacks. When HP reaches 0 or below, lose 1 stack and continue fighting. Lose when stacks reach 0 or HP drops below -40.`,
    
    abilityEndOfTurnEffect: (character: any, battle: any) => {
        if (character.currentHp <= 0) {
            const stacks = character.perseveranceStacks || 3;
            if (stacks > 0) {
                character.perseveranceStacks = stacks - 1;
                if (character.currentHp <= -20) {
                    character.perseveranceStacks = Math.max(0, character.perseveranceStacks - 1);
                }
                
                if (character.perseveranceStacks > 0) {
                    battle.logMessage(`${character.name} steels himself! (${character.perseveranceStacks} stacks remaining)`);
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
        imageUrl: mediaLinks.denkenCard,
        description: 'An experienced mage with incredible perseverance. Can continue fighting even when others would fall.'
    },
    level: 55,
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