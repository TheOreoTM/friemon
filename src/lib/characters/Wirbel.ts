import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { ZOLTRAAK, DEFENSIVE_MAGIC, MANA_SHIELD } from '../techniques/SharedTechniques';
import type { Battle } from '../battle/Battle';

// Wirbel-specific interface that extends Character with additional metadata
interface WirbelCharacter extends Character {
	barrierStrength: number;
	resolveToKill: boolean;
}

const wirbelStats = {
	hp: 80,
	attack: 65,
	defense: 60,
	magicAttack: 85,
	magicDefense: 70,
	speed: 65
}; // Total: 425

const wirbelAbility: Ability = {
	abilityName: 'Resolve to Kill',
	abilityEffectString: `When opponent attacks while you have barriers active, increase attack by 20% of damage received, up to 20% of barrier strength.`,

	abilityOnDamageReceived: (character: Character, battle: Battle, damage: number) => {
		const wirbelChar = character as WirbelCharacter;
		const barrierStrength = wirbelChar.barrierStrength || 0;
		if (barrierStrength > 0) {
			const attackGain = Math.min(damage * 0.2, barrierStrength * 0.2);
			character.modifyStatBoost('attack', Math.floor(attackGain));
			battle.addToBattleLog(`${character.name} steels his resolve and gains ${Math.floor(attackGain)} attack!`);
		}
	}
};

const Wirbel = new CharacterData({
	characterName: CharacterName.Wirbel,
	cosmetic: {
		emoji: CharacterEmoji.WIRBEL,
		color: 0xa4a8b9,
		description: 'A methodical mage who grows stronger under pressure. His resolve hardens when facing adversity.'
	},
	level: 45,
	races: [Race.Human],
	baseStats: wirbelStats,
	techniques: [ZOLTRAAK, DEFENSIVE_MAGIC, MANA_SHIELD],
	ability: wirbelAbility,
	additionalMetadata: {
		barrierStrength: 0,
		resolveToKill: true
	}
});

export default Wirbel;
