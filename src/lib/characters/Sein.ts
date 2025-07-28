import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    GODDESS_BLESSING, 
    HEALING_MAGIC, 
    HOLY_STRIKE,
    DEFENSIVE_MAGIC
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const seinStats = {
    hp: 90,
    attack: 75,
    defense: 80,
    magicAttack: 95,
    magicDefense: 100,
    speed: 70
};

const seinAbility = {
    abilityName: "Goddess' Blessing",
    abilityEffectString: `Heal for 2HP + 2 * (Turn Count * 10%) at the end of every turn. This character can be healed past their max HP.`,
    
    abilityEndOfTurnEffect: (character: any, battle: any) => {
        const baseHealing = 2;
        const turnBonus = 2 * (battle.state.turn * 0.1);
        const totalHealing = Math.floor(baseHealing + turnBonus);
        
        character.currentHp += totalHealing;
        battle.logMessage(`${character.name} receives the Goddess' Blessing and heals ${totalHealing} HP!`);
    }
};

const Sein = new CharacterData({
    characterName: CharacterName.Sein,
    cosmetic: {
        emoji: CharacterEmoji.SEIN,
        color: 0xa3caca,
        imageUrl: mediaLinks.seinCard,
        description: 'A priest blessed by the goddess with powerful healing magic. Can recover from any injury with divine grace.'
    },
    level: 40,
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