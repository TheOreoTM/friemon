import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { ZOLTRAAK, ANALYSIS, MANA_SHIELD } from '../techniques/SharedTechniques';

// Edel-specific character interface with additional metadata
interface EdelCharacter extends Character {
	eyeContactStacks: number;
	memorySpecialist: boolean;
}

const edelStats = {
	hp: 70,
	attack: 55,
	defense: 65,
	magicAttack: 80,
	magicDefense: 70,
	speed: 70
}; // Total: 410

const edelAbility: Ability = {
	abilityName: 'A Superior Opponent',
	abilityEffectString: `While making eye contact with the opponent, all moves have +1 initiative. Memory specialist - opponent's techniques become visible.`,

	subAbilities: [
		{
			name: 'Memory Transference Specialist',
			description: "Opponent's used techniques are revealed."
		}
	],

	abilityStartOfTurnEffect: (character: Character, battle: any) => {
		const edelChar = character as EdelCharacter;
		const eyeContact = edelChar.eyeContactStacks || 0;
		if (eyeContact > 0) {
			edelChar.eyeContactStacks = eyeContact - 1;
			battle.logMessage(`${character.name} maintains eye contact - moves gain priority!`);
		}
	}
};

const Edel = new CharacterData({
	characterName: CharacterName.Edel,
	cosmetic: {
		emoji: CharacterEmoji.EDEL,
		color: 0xae9292,
		description: 'A skilled mage who specializes in memory magic and psychological warfare through intense eye contact.'
	},
	level: 40,
	races: [Race.Human],
	baseStats: edelStats,
	techniques: [ZOLTRAAK, ANALYSIS, MANA_SHIELD],
	ability: edelAbility,
	additionalMetadata: {
		eyeContactStacks: 0,
		memorySpecialist: true
	}
});

export default Edel;
