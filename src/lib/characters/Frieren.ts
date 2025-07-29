import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { ZOLTRAAK, ANALYSIS, VOLLZANBEL, MANA_SHIELD, GRAUSAMKEIT, DETECT_MAGIC } from '../techniques/SharedTechniques';

// Frieren-specific character interface with additional metadata
interface FrierenCharacter extends Character {
	analysisStacks: number;
	manaSuppressed: boolean;
	ignoreManaSuppressed: boolean;
}

const frierenStats = {
	hp: 75,
	attack: 45,
	defense: 65,
	magicAttack: 100,
	magicDefense: 80,
	speed: 75
}; // Total: 440

const frierenAbility: Ability = {
	abilityName: 'Analysis',
	abilityEffectString: `At the end of every turn, gain 1 Analysis stack. When an Analysis technique is used, gain 2 Analysis stacks. Attack damage is increased by 7% per Analysis stack (max 10 stacks). After attacking, reset Analysis stacks to 0.`,

	subAbilities: [
		{
			name: 'Mana Suppression',
			description: 'Hide the amount of HP this character has.'
		},
		{
			name: "Flamme's Teachings",
			description: "See past the opponent's Mana Suppression."
		}
	],

	abilityEndOfTurnEffect: (character: Character, battle: any) => {
		const frierenChar = character as FrierenCharacter;
		// Gain 1 analysis stack at end of turn (max 10)
		const currentStacks = frierenChar.analysisStacks || 0;
		if (currentStacks < 10) {
			frierenChar.analysisStacks = currentStacks + 1;
			battle.logMessage(`${character.name} gains 1 Analysis stack (total: ${frierenChar.analysisStacks})`);
		}
	},

	abilityAfterOwnTechniqueUse: (character: Character, battle: any, technique: Technique) => {
		const frierenChar = character as FrierenCharacter;
		// Analysis techniques give extra stacks
		if (technique.name === 'Analysis' || technique.name === 'Detect Magic') {
			const currentStacks = frierenChar.analysisStacks || 0;
			const newStacks = Math.min(10, currentStacks + 2);
			frierenChar.analysisStacks = newStacks;
			battle.logMessage(`${character.name} gains 2 Analysis stacks from ${technique.name} (total: ${newStacks})`);
		}
	},

	damageOutputMultiplier: (user: Character, _target: Character, technique: Technique) => {
		const frierenChar = user as FrierenCharacter;
		const stacks = frierenChar.analysisStacks || 0;
		const multiplier = 1 + stacks * 0.07;

		// Reset stacks after attacking
		if (technique.power > 0) {
			frierenChar.analysisStacks = 0;
		}

		return multiplier;
	},

	preventCondition: (_character: Character, condition: CombatCondition) => {
		// Analysis provides some resistance to mental effects
		if (condition === CombatCondition.Confused) {
			return Math.random() < 0.3; // 30% chance to resist confusion
		}
		return false;
	}
};

const Frieren = new CharacterData({
	characterName: CharacterName.Frieren,
	cosmetic: {
		emoji: CharacterEmoji.FRIEREN,
		color: 0xc5c3cc,
		description: 'An ancient elf mage with over 1000 years of experience. Master of analysis and powerful destruction magic.'
	},
	level: 50,
	races: [Race.Elf],
	baseStats: frierenStats,
	techniques: [ZOLTRAAK, ANALYSIS, VOLLZANBEL, MANA_SHIELD, GRAUSAMKEIT, DETECT_MAGIC],
	ability: frierenAbility,
	additionalMetadata: {
		analysisStacks: 0,
		manaSuppressed: true,
		ignoreManaSuppressed: true
	}
});

export default Frieren;
