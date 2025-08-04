import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { VOLLZANBEL, ANALYSIS, ZOLTRAAK, DETECT_MAGIC } from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';
import type { Battle } from '../battle/Battle';

const THEORY_RESEARCH = new Technique({
	name: 'Theory Research',
	description: 'Advance magical theory through careful study',
	affinity: Affinity.Support,
	category: TechniqueCategory.Support,
	power: 0,
	precision: 1.0,
	manaCost: 15,
	initiative: 0,
	targetType: 'single',
	effects: [createStatBoostEffect('magicAttack', 2, 1.0, EffectTarget.Self)],
	properties: { magicBased: true, theory: true }
});

const flammeStats = {
	hp: 75,
	attack: 50,
	defense: 65,
	magicAttack: 115,
	magicDefense: 85,
	speed: 65
}; // Total: 430

const flammeAbility: Ability = {
	abilityName: "Founder of Humanity's Magic",
	abilityEffectString: `The Foundation of Humanity's Magic develops for each Theory technique used. After using 4 Theory techniques, unlock a devastating ultimate attack.`,

	subAbilities: [
		{
			name: 'All-Knowing',
			description: "See past opponent's Mana Suppression and hidden effects."
		},
		{
			name: 'Magic Pioneer',
			description: 'All magical techniques have increased power and precision.'
		}
	],

	abilityAfterOwnTechniqueUse: (character: Character, battle: Battle, technique: Technique) => {
		const flammeChar = character;
		if (technique.properties?.theory) {
			flammeChar.theoryCount = (flammeChar.theoryCount || 0) + 1;
			battle.addToBattleLog(`${character.name} advances magical theory (${flammeChar.theoryCount}/4)`);

			if (flammeChar.theoryCount >= 4) {
				flammeChar.pinnacleUnlocked = true;
				battle.addToBattleLog(`${character.name} has discovered the Pinnacle of Humanity's Magic!`);
			}
		}
	},

	damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
		if (technique.properties?.magicBased) {
			return 1.25; // 25% bonus to all magic
		}
		return 1.0;
	}
};

const Flamme = new CharacterData({
	characterName: CharacterName.Flamme,
	cosmetic: {
		emoji: CharacterEmoji.FLAMME,
		color: 0xde8a54,
		description: "The legendary mage who founded modern human magic. Frieren's master and creator of countless magical techniques."
	},
	level: 70,
	races: [Race.Human],
	baseStats: flammeStats,
	techniques: [THEORY_RESEARCH, VOLLZANBEL, ANALYSIS, ZOLTRAAK, DETECT_MAGIC],
	ability: flammeAbility,
	additionalMetadata: {
		theoryCount: 0,
		pinnacleUnlocked: false,
		ignoreManaSuppressed: true
	}
});

export default Flamme;
