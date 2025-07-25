import { Trait } from '../types/interfaces';
import { CombatCondition, Race, Affinity } from '../types/enums';
import { createTrait } from '../character/Trait';
import { Character } from '../character/Character';
import { Battle } from '../battle/Battle';
import { Technique } from '../character/Technique';

export const TRAITS: { [key: string]: Trait } = {
	magicPerception: createTrait({
		name: 'Magic Perception',
		description: 'Can perceive hidden magical effects and has increased accuracy against illusions.',
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.affinity === Affinity.Illusion) {
				return 0.5; // Reduced damage from illusions
			}
			return 1.0;
		}
	}),

	manaRegeneration: createTrait({
		name: 'Mana Regeneration',
		description: 'Recovers mana at the end of each turn.',
		onTurnEnd: (character: Character, _battle: Battle) => {
			const regen = Math.floor(character.maxMana * 0.1);
			character.restoreMana(regen);
		}
	}),

	auraOfDomination: createTrait({
		name: 'Aura of Domination',
		description: 'Reduces magic attack and magic defense of non-demon opponents.',
		onEnterField: (_user: Character, opponent: Character, _battle: Battle) => {
			if (!opponent.hasRace(Race.Demon)) {
				opponent.modifyStatBoost('magicAttack', -1);
				opponent.modifyStatBoost('magicDefense', -1);
			}
		}
	}),

	ironWill: createTrait({
		name: 'Iron Will',
		description: 'Prevents fear and charm conditions.',
		preventCondition: (_character: Character, condition: CombatCondition) => {
			return condition === CombatCondition.Fear || condition === CombatCondition.Charmed;
		}
	}),

	magicAbsorption: createTrait({
		name: 'Magic Absorption',
		description: 'Restores mana when KOing an opponent.',
		manaRestoreOnKO: (user: Character, _battle: Battle) => {
			return Math.floor(user.maxMana * 0.25);
		}
	}),

	ancientKnowledge: createTrait({
		name: 'Ancient Knowledge',
		description: 'Increases magical damage output.',
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.category === 'Magical') {
				return 1.3;
			}
			return 1.0;
		}
	}),

	heroicResolve: createTrait({
		name: 'Heroic Resolve',
		description: 'Increases physical damage when HP is low.',
		damageOutputMultiplier: (user: Character, _target: Character, technique: Technique) => {
			if (technique.category === 'Physical' && user.currentHP < user.maxHP * 0.33) {
				return 1.5;
			}
			return 1.0;
		}
	}),

	demonicResilience: createTrait({
		name: 'Demonic Resilience',
		description: 'Reduces damage from all sources.',
		onReceiveDamage: (_target: Character, _source: Character, _battle: Battle, damage: number) => {
			return Math.floor(damage * 0.85);
		}
	}),

	swiftCasting: createTrait({
		name: 'Swift Casting',
		description: 'Occasionally acts first regardless of speed.'
		// This would be checked in battle turn order logic
	}),

	battleInstinct: createTrait({
		name: 'Battle Instinct',
		description: 'Increases critical hit chance.'
		// This modifies the critical chance in Character class
	}),

	// === ADDITIONAL TRAITS ===
	elementalMastery: createTrait({
		name: 'Elemental Mastery',
		description: 'Boosts all elemental technique damage.',
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.affinity.startsWith('Elemental_')) {
				return 1.3;
			}
			return 1.0;
		}
	}),

	berserker: createTrait({
		name: 'Berserker',
		description: 'Attack increases when HP is low.',
		damageOutputMultiplier: (user: Character, _target: Character, _technique: Technique) => {
			const hpRatio = user.currentHP / user.maxHP;
			if (hpRatio < 0.5) {
				return 1.0 + (0.5 - hpRatio); // Up to 50% bonus when at 1 HP
			}
			return 1.0;
		}
	}),

	shadowStep: createTrait({
		name: 'Shadow Step',
		description: 'Occasionally dodges physical attacks.',
		onReceiveDamage: (_target: Character, _source: Character, _battle: Battle, damage: number) => {
			if (Math.random() < 0.25) { // 25% chance to dodge
				return 0;
			}
			return damage;
		}
	}),

	regenerativeHealing: createTrait({
		name: 'Regenerative Healing',
		description: 'Slowly recovers HP each turn.',
		onTurnEnd: (character: Character, _battle: Battle) => {
			const regen = Math.floor(character.maxHP * 0.0625); // 6.25% per turn
			character.heal(regen);
		}
	}),

	spellbreaker: createTrait({
		name: 'Spellbreaker',
		description: 'Immune to magical status effects.',
		preventCondition: (_character: Character, _condition: CombatCondition) => {
			return Math.random() < 0.5; // 50% chance to resist
		}
	}),

	berserkerRage: createTrait({
		name: 'Berserker Rage',
		description: 'Becomes stronger when taking damage.',
		onReceiveDamage: (_target: Character, _source: Character, _battle: Battle, damage: number) => {
			// Could boost attack stat here
			return damage;
		}
	}),

	guardian: createTrait({
		name: 'Guardian',
		description: 'Reduces damage from all sources.',
		onReceiveDamage: (_target: Character, _source: Character, _battle: Battle, damage: number) => {
			return Math.floor(damage * 0.9); // 10% damage reduction
		}
	}),

	mysticFocus: createTrait({
		name: 'Mystic Focus',
		description: 'Magical techniques cost less mana.',
		// This would be implemented in the technique cost calculation
	}),

	combatVeteran: createTrait({
		name: 'Combat Veteran',
		description: 'Immune to fear and intimidation effects.',
		preventCondition: (_character: Character, condition: CombatCondition) => {
			return condition === CombatCondition.Fear;
		}
	}),

	naturalHealer: createTrait({
		name: 'Natural Healer',
		description: 'Healing techniques are more effective.',
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.affinity === Affinity.Healing) {
				return 1.5;
			}
			return 1.0;
		}
	})
};

export const getRandomTrait = (): Trait => {
	const keys = Object.keys(TRAITS);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return TRAITS[randomKey];
};
