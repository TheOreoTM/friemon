import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { SPEED_BOOST, ZOLTRAAK } from '../techniques/SharedTechniques';
import type { Battle } from '../battle/Battle';
import { Race } from '../types/enums';

const laufenStats = {
	hp: 65,
	attack: 60,
	defense: 55,
	magicAttack: 75,
	magicDefense: 60,
	speed: 105
}; // Total: 420

const laufenAbility: Ability = {
	abilityName: 'Graze',
	abilityEffectString: `Reduce opponent's attack damage by speed difference percentage. High speed allows dodging attacks.`,

	abilityOnDamageReceived: (character: Character, battle: Battle, damage: number) => {
		// Determine opponent based on whether this character is user or opponent
		const isUserCharacter = character === battle.state.userCharacter;
		const opponent = isUserCharacter ? battle.state.opponentCharacter : battle.state.userCharacter;
		const opponentSpeed = opponent.getEffectiveStats().speed;
		const speedDiff = character.getEffectiveStats().speed - opponentSpeed;
		const grazeReduction = Math.min(Math.max(speedDiff / 100, 0), 0.8);

		const reducedDamage = Math.floor(damage * (1 - grazeReduction));
		if (grazeReduction > 0) {
			battle.addToBattleLog(`${character.name} grazes the attack with superior speed!`);
		}
		return reducedDamage;
	}
};

const Laufen = new CharacterData({
	characterName: CharacterName.Laufen,
	cosmetic: {
		emoji: CharacterEmoji.LAUFEN,
		color: 0xcf7457,
		description: 'An incredibly fast mage who specializes in evasion and hit-and-run tactics.'
	},
	baseStats: laufenStats,
	techniques: [SPEED_BOOST, ZOLTRAAK],
	races: [Race.Human],
	ability: laufenAbility,
	additionalMetadata: {
		grazeSpecialist: true
	}
});

export default Laufen;
