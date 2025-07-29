import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    GODDESS_BLESSING, 
    HEALING_MAGIC, 
    HOLY_STRIKE,
    DEFENSIVE_MAGIC
} from '../techniques/SharedTechniques';

const seinStats = {
    hp: 80,
    attack: 60,
    defense: 65,
    magicAttack: 75,
    magicDefense: 85,
    speed: 60
}; // Total: 425

const seinAbility: Ability = {
    abilityName: "Goddess' Blessing",
    abilityEffectString: `Heal for 2HP + 2 * (Turn Count * 10%) at the end of every turn. This character can be healed past their max HP.`,
    
    abilityEndOfTurnEffect: (character: Character, battle: any) => {
        const baseHealing = 2;
        const turnBonus = 2 * (battle.state.turn * 0.1);
        const totalHealing = Math.floor(baseHealing + turnBonus);
        
        // Using currentHP property from Character class
        character.currentHP = character.currentHP + totalHealing;
        battle.logMessage(`${character.name} receives the Goddess' Blessing and heals ${totalHealing} HP!`);
    }
};

const Sein = new CharacterData({
    characterName: CharacterName.Sein,
    cosmetic: {
        emoji: CharacterEmoji.SEIN,
        color: 0xa3caca,
        description: 'A priest blessed by the goddess with powerful healing magic. Can recover from any injury with divine grace.'
    },
    level: 25,
    races: [Race.Human],
    baseStats: seinStats,
    techniques: [
        GODDESS_BLESSING,
        HEALING_MAGIC,
        HOLY_STRIKE,
        DEFENSIVE_MAGIC
    ],
    ability: seinAbility,
    additionalMetadata: {
        overheal: true,
        divineBlessing: true
    }
});

export default Sein;