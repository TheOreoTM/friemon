import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, CombatCondition } from '../types/enums';
import { Character } from '../character/Character';
import { Battle } from '../battle/Battle';

export const TECHNIQUES: { [key: string]: Technique } = {
	// Destruction Affinity
	zoltraak: new Technique({
		name: 'Zoltraak',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 90,
		precision: 0.95,
		manaCost: 15,
		description: 'The ordinary offensive spell, highly efficient against demons.',
		properties: { magicBased: true }
	}),

	judaBeam: new Technique({
		name: 'Juda Beam',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 120,
		precision: 0.85,
		manaCost: 25,
		description: 'A powerful beam of destructive magic.',
		properties: { magicBased: true, barrierBypassing: true }
	}),

	// Support Affinity
	manaShield: new Technique({
		name: 'Mana Shield',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 10,
		description: 'Creates a protective barrier using mana.',
		effects: [
			{
				type: 'volatile_effect',
				value: 'manaShield',
				chance: 1.0,
				target: 'self'
			}
		]
	}),

	// Defense Affinity
	defensiveMagic: new Technique({
		name: 'Defensive Magic',
		affinity: Affinity.Defense,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 8,
		description: 'Reinforces magical defenses.',
		effects: [
			{
				type: 'stat_change',
				value: { stat: 'magicDefense', stages: 2 },
				chance: 1.0,
				target: 'self'
			}
		]
	}),

	// Healing Affinity
	healingMagic: new Technique({
		name: 'Healing Magic',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 12,
		description: 'Basic healing spell.',
		effects: [
			{
				type: 'heal',
				value: 0.5, // 50% of max HP
				chance: 1.0,
				target: 'self'
			}
		]
	}),

	// Illusion Affinity
	auserlese: new Technique({
		name: 'Auserlese',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Magical,
		power: 0,
		precision: 0.75,
		manaCost: 18,
		description: 'Creates disorienting illusions.',
		effects: [
			{
				type: 'condition',
				value: CombatCondition.Confused,
				chance: 1.0,
				target: 'target'
			}
		],
		properties: { magicBased: true }
	}),

	// Physical Techniques
	heroStrike: new Technique({
		name: 'Hero Strike',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Physical,
		power: 80,
		precision: 1.0,
		manaCost: 5,
		description: 'A powerful physical attack.',
		properties: { physicalBased: true, contact: true }
	}),

	lightningSwift: new Technique({
		name: 'Lightning Swift',
		affinity: Affinity.Elemental_Wind,
		category: TechniqueCategory.Physical,
		power: 40,
		precision: 1.0,
		manaCost: 3,
		initiative: 1,
		description: 'A swift strike that always goes first.',
		properties: { physicalBased: true, contact: true }
	}),

	// Elemental Techniques
	volcanicRay: new Technique({
		name: 'Volcanic Ray',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 85,
		precision: 0.9,
		manaCost: 14,
		description: 'Unleashes a ray of volcanic fire.',
		effects: [
			{
				type: 'condition',
				value: CombatCondition.Exhausted,
				chance: 0.3,
				target: 'target'
			}
		],
		properties: { magicBased: true }
	}),

	// Demonic Techniques
	auraOfGuillotine: new Technique({
		name: 'Aura of the Guillotine',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Magical,
		power: 110,
		precision: 0.8,
		manaCost: 22,
		description: 'Overwhelming demonic aura that cuts through defenses.',
		effects: [
			{
				type: 'condition',
				value: CombatCondition.Fear,
				chance: 0.3,
				target: 'target'
			}
		],
		properties: { magicBased: true, barrierBypassing: true }
	}),

	// Special Techniques
	magicSealSpell: new Technique({
		name: 'Magic Seal',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.85,
		manaCost: 15,
		description: "Seals the target's magical abilities.",
		effects: [
			{
				type: 'magic_seal',
				value: 3, // turns
				chance: 1.0,
				target: 'target'
			}
		]
	}),

	manaDrain: new Technique({
		name: 'Mana Drain',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 60,
		precision: 1.0,
		manaCost: 10,
		description: 'Drains mana from the target.',
		effects: [
			{
				type: 'mana_drain',
				value: 15,
				chance: 1.0,
				target: 'target'
			}
		],
		properties: { magicBased: true }
	}),

	// Area Effect Techniques
	meteorSwarm: new Technique({
		name: 'Meteor Swarm',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 65,
		precision: 0.85,
		manaCost: 18,
		description: 'Calls down meteors on all enemies.',
		properties: { magicBased: true, areaEffect: true }
	}),

	// Concentration Techniques
	großeFlame: new Technique({
		name: 'Große Flame',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 150,
		precision: 0.9,
		manaCost: 30,
		description: 'Charges for one turn, then unleashes devastating flames.',
		properties: { magicBased: true, concentration: true },
		execute: (user: Character, _target: Character, _battle: Battle, _technique: Technique) => {
			if (user.volatileEffects.channeling) {
				user.volatileEffects.channeling = false;
				return true; // Execute the attack
			} else {
				user.volatileEffects.channeling = true;
				return false; // Charging turn
			}
		}
	})
};

// Learnsets by character archetype
export const LEARNSETS: { [key: string]: { level: number; technique: string }[] } = {
	mage: [
		{ level: 1, technique: 'zoltraak' },
		{ level: 5, technique: 'manaShield' },
		{ level: 10, technique: 'healingMagic' },
		{ level: 15, technique: 'judaBeam' },
		{ level: 20, technique: 'defensiveMagic' },
		{ level: 25, technique: 'meteorSwarm' },
		{ level: 30, technique: 'großeFlame' }
	],
	warrior: [
		{ level: 1, technique: 'heroStrike' },
		{ level: 5, technique: 'lightningSwift' },
		{ level: 10, technique: 'defensiveMagic' },
		{ level: 15, technique: 'heroStrike' },
		{ level: 20, technique: 'manaShield' }
	],
	demon: [
		{ level: 1, technique: 'manaDrain' },
		{ level: 5, technique: 'auraOfGuillotine' },
		{ level: 10, technique: 'auserlese' },
		{ level: 15, technique: 'magicSealSpell' },
		{ level: 20, technique: 'judaBeam' }
	]
};
