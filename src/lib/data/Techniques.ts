import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, CombatCondition, TechniqueEffectType, EffectTarget, VolatileEffectType } from '../types/enums';
import { Character } from '../character/Character';
import { Battle } from '../battle/Battle';
import { TechniqueEffect, createConditionEffect, createStatBoostEffect, createHealEffect, createVolatileEffect } from '../character/TechniqueEffect';

export const TECHNIQUES: { [key: string]: Technique } = {
	// === DESTRUCTION AFFINITY ===
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

	darkPulse: new Technique({
		name: 'Dark Pulse',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 75,
		precision: 0.9,
		manaCost: 16,
		description: 'A pulse of dark energy.',
		properties: { magicBased: true },
		effects: [createConditionEffect(CombatCondition.Fear, 0.2, EffectTarget.Opponent)]
	}),

	annihilation: new Technique({
		name: 'Annihilation',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 160,
		precision: 0.8,
		manaCost: 40,
		description: 'Ultimate destructive magic.',
		properties: { magicBased: true }
	}),

	voidStrike: new Technique({
		name: 'Void Strike',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Magical,
		power: 110,
		precision: 0.85,
		manaCost: 26,
		description: 'Strikes with the power of nothingness.',
		properties: { magicBased: true, barrierBypassing: true }
	}),

	// === ELEMENTAL FIRE ===
	ember: new Technique({
		name: 'Ember',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 45,
		precision: 0.95,
		manaCost: 8,
		description: 'A small flame that can cause burns.',
		properties: { magicBased: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Exhausted,
				chance: 0.3,
				target: EffectTarget.Opponent
			})
		]
	}),

	flameBurst: new Technique({
		name: 'Flame Burst',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 75,
		precision: 0.9,
		manaCost: 15,
		description: 'A burst of intense flames.',
		properties: { magicBased: true, areaEffect: true }
	}),

	inferno: new Technique({
		name: 'Inferno',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 110,
		precision: 0.85,
		manaCost: 25,
		description: 'Creates a massive wall of fire.',
		properties: { magicBased: true, areaEffect: true }
	}),

	flameCharge: new Technique({
		name: 'Flame Charge',
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
				return true;
			} else {
				user.volatileEffects.channeling = true;
				return false;
			}
		}
	}),

	// === ELEMENTAL WATER ===
	waterPulse: new Technique({
		name: 'Water Pulse',
		affinity: Affinity.Elemental_Water,
		category: TechniqueCategory.Magical,
		power: 60,
		precision: 0.9,
		manaCost: 12,
		description: 'A pulsing wave of water that can confuse.',
		properties: { magicBased: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Confused,
				chance: 0.2,
				target: EffectTarget.Opponent
			})
		]
	}),

	tidalWave: new Technique({
		name: 'Tidal Wave',
		affinity: Affinity.Elemental_Water,
		category: TechniqueCategory.Magical,
		power: 95,
		precision: 0.85,
		manaCost: 20,
		description: 'A massive wave that crashes down.',
		properties: { magicBased: true, areaEffect: true }
	}),

	iceBeam: new Technique({
		name: 'Ice Beam',
		affinity: Affinity.Elemental_Water,
		category: TechniqueCategory.Magical,
		power: 80,
		precision: 0.9,
		manaCost: 16,
		description: 'A beam of freezing energy.',
		properties: { magicBased: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Stunned,
				chance: 0.25,
				target: EffectTarget.Opponent
			})
		]
	}),

	blizzard: new Technique({
		name: 'Blizzard',
		affinity: Affinity.Elemental_Water,
		category: TechniqueCategory.Magical,
		power: 120,
		precision: 0.8,
		manaCost: 28,
		description: 'A devastating ice storm.',
		properties: { magicBased: true, areaEffect: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Stunned,
				chance: 0.4,
				target: EffectTarget.Opponent
			})
		]
	}),

	// === ELEMENTAL WIND ===
	gust: new Technique({
		name: 'Gust',
		affinity: Affinity.Elemental_Wind,
		category: TechniqueCategory.Magical,
		power: 50,
		precision: 0.95,
		manaCost: 10,
		description: 'A quick burst of wind.',
		properties: { magicBased: true },
		initiative: 1
	}),

	windSlash: new Technique({
		name: 'Wind Slash',
		affinity: Affinity.Elemental_Wind,
		category: TechniqueCategory.Magical,
		power: 70,
		precision: 0.9,
		manaCost: 14,
		description: 'Sharp blades of compressed air.',
		properties: { magicBased: true }
	}),

	hurricane: new Technique({
		name: 'Hurricane',
		affinity: Affinity.Elemental_Wind,
		category: TechniqueCategory.Magical,
		power: 100,
		precision: 0.85,
		manaCost: 24,
		description: 'A swirling vortex of destructive wind.',
		properties: { magicBased: true, areaEffect: true }
	}),

	tornado: new Technique({
		name: 'Tornado',
		affinity: Affinity.Elemental_Wind,
		category: TechniqueCategory.Magical,
		power: 130,
		precision: 0.8,
		manaCost: 30,
		description: 'Creates a massive tornado.',
		properties: { magicBased: true, areaEffect: true }
	}),

	// === ELEMENTAL EARTH ===
	rockThrow: new Technique({
		name: 'Rock Throw',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Physical,
		power: 55,
		precision: 0.9,
		manaCost: 8,
		description: 'Hurls a heavy rock at the opponent.',
		properties: { physicalBased: true, contact: true }
	}),

	earthquake: new Technique({
		name: 'Earthquake',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Magical,
		power: 90,
		precision: 0.9,
		manaCost: 20,
		description: 'Causes the ground to shake violently.',
		properties: { magicBased: true, areaEffect: true }
	}),

	stoneWall: new Technique({
		name: 'Stone Wall',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 15,
		description: 'Creates a protective wall of stone.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'defense', stages: 2 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	meteorStrike: new Technique({
		name: 'Meteor Strike',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Magical,
		power: 140,
		precision: 0.75,
		manaCost: 35,
		description: 'Calls down a meteor from the sky.',
		properties: { magicBased: true, areaEffect: true }
	}),

	// === SUPPORT AFFINITY ===
	manaShield: new Technique({
		name: 'Mana Shield',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 10,
		description: 'Creates a protective barrier using mana.',
		effects: [createVolatileEffect(VolatileEffectType.ManaShield, 1.0, EffectTarget.Self)]
	}),

	speedBoost: new Technique({
		name: 'Speed Boost',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 12,
		description: 'Increases speed dramatically.',
		effects: [createStatBoostEffect('speed', 2, 1.0, EffectTarget.Self)]
	}),

	powerBoost: new Technique({
		name: 'Power Boost',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 15,
		description: 'Increases attack power.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'attack', stages: 2 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	magicBoost: new Technique({
		name: 'Magic Boost',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 15,
		description: 'Increases magical attack power.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'magicAttack', stages: 2 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	magicSealing: new Technique({
		name: 'Magic Sealing',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.85,
		manaCost: 20,
		description: "Seals the opponent's magical abilities.",
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.MagicSeal,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	timeDilation: new Technique({
		name: 'Time Dilation',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 25,
		description: 'Manipulates time to act multiple times.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'speed', stages: 3 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	// === DEFENSE AFFINITY ===
	defensiveMagic: new Technique({
		name: 'Defensive Magic',
		affinity: Affinity.Defense,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 8,
		description: 'Reinforces magical defenses.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'magicDefense', stages: 2 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	shieldWall: new Technique({
		name: 'Shield Wall',
		affinity: Affinity.Defense,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 12,
		description: 'Creates an impenetrable defensive barrier.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'defense', stages: 3 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	ironWill: new Technique({
		name: 'Iron Will',
		affinity: Affinity.Defense,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 15,
		description: 'Hardens resolve against status effects.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'magicDefense', stages: 1 },
				chance: 1.0,
				target: EffectTarget.Self
			}),
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'defense', stages: 1 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	// === HEALING AFFINITY ===
	healingMagic: new Technique({
		name: 'Healing Magic',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 12,
		description: 'Basic healing spell.',
		effects: [createHealEffect(0.5, 1.0, EffectTarget.Self)]
	}),

	regeneration: new Technique({
		name: 'Regeneration',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 18,
		description: 'Gradually restores HP over time.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 0.3,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	fullRestore: new Technique({
		name: 'Full Restore',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 35,
		description: 'Completely restores HP and cures conditions.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 1.0,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	groupHeal: new Technique({
		name: 'Group Heal',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 25,
		description: 'Heals all party members.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 0.4,
				chance: 1.0,
				target: EffectTarget.Party
			})
		]
	}),

	holyStrike: new Technique({
		name: 'Holy Strike',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Physical,
		power: 95,
		precision: 0.95,
		manaCost: 12,
		description: 'A blessed attack effective against demons.',
		properties: { physicalBased: true, contact: true }
	}),

	healingPotion: new Technique({
		name: 'Healing Potion',
		affinity: Affinity.Healing,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 0,
		description: 'Uses a healing potion to restore HP.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 0.4,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	// === ILLUSION AFFINITY ===
	auserlese: new Technique({
		name: 'Auserlese',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Magical,
		power: 0,
		precision: 0.75,
		manaCost: 18,
		description: 'Creates disorienting illusions.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Confused,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	invisibility: new Technique({
		name: 'Invisibility',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 20,
		description: 'Becomes invisible, making attacks miss.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.VolatileEffect,
				value: VolatileEffectType.Immaterial,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	mindControl: new Technique({
		name: 'Mind Control',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.7,
		manaCost: 25,
		description: "Controls the opponent's actions.",
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Charmed,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	mirrorImage: new Technique({
		name: 'Mirror Image',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 18,
		description: 'Creates decoy images.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.VolatileEffect,
				value: VolatileEffectType.MistyAura,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	starfall: new Technique({
		name: 'Starfall',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Magical,
		power: 125,
		precision: 0.85,
		manaCost: 30,
		description: 'Calls down stars from the heavens.',
		properties: { magicBased: true, areaEffect: true }
	}),

	// === DEMONIC AURA AFFINITY ===
	shadowBlast: new Technique({
		name: 'Shadow Blast',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Magical,
		power: 85,
		precision: 0.9,
		manaCost: 18,
		description: 'Blasts the opponent with dark energy.',
		properties: { magicBased: true }
	}),

	lifeDrain: new Technique({
		name: 'Life Drain',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Magical,
		power: 70,
		precision: 0.9,
		manaCost: 16,
		description: 'Drains life force to heal self.',
		properties: { magicBased: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 0.5,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	demonicAura: new Technique({
		name: 'Demonic Aura',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 20,
		description: 'Intimidates opponents, reducing their stats.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'attack', stages: -1 },
				chance: 1.0,
				target: EffectTarget.Opponent
			}),
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'magicAttack', stages: -1 },
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	fearInduction: new Technique({
		name: 'Fear Induction',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.8,
		manaCost: 15,
		description: 'Instills deep fear in the opponent.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Fear,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	cursedFlames: new Technique({
		name: 'Cursed Flames',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Magical,
		power: 90,
		precision: 0.85,
		manaCost: 22,
		description: 'Dark flames that burn the soul.',
		properties: { magicBased: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Exhausted,
				chance: 0.4,
				target: EffectTarget.Opponent
			})
		]
	}),

	shadowStep: new Technique({
		name: 'Shadow Step',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Physical,
		power: 75,
		precision: 0.95,
		manaCost: 10,
		description: 'Teleports behind the enemy for a sneak attack.',
		properties: { physicalBased: true, contact: true },
		initiative: 2
	}),

	// === PHYSICAL TECHNIQUES ===
	dragonSlash: new Technique({
		name: 'Dragon Slash',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Physical,
		power: 100,
		precision: 0.9,
		manaCost: 0,
		description: 'A powerful sword technique.',
		properties: { physicalBased: true, contact: true }
	}),

	berserkerRage: new Technique({
		name: 'Berserker Rage',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Physical,
		power: 120,
		precision: 0.8,
		manaCost: 0,
		description: 'A frenzied attack that boosts power but reduces defense.',
		properties: { physicalBased: true, contact: true },
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'attack', stages: 1 },
				chance: 1.0,
				target: EffectTarget.Self
			}),
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'defense', stages: -1 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	guardBreaker: new Technique({
		name: 'Guard Breaker',
		affinity: Affinity.Destruction,
		category: TechniqueCategory.Physical,
		power: 80,
		precision: 0.9,
		manaCost: 0,
		description: 'An attack that ignores defensive boosts.',
		properties: { physicalBased: true, contact: true, barrierBypassing: true }
	}),

	hammerStrike: new Technique({
		name: 'Hammer Strike',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Physical,
		power: 90,
		precision: 0.85,
		manaCost: 0,
		description: 'A crushing blow with a heavy weapon.',
		properties: { physicalBased: true, contact: true }
	}),

	swiftStrike: new Technique({
		name: 'Swift Strike',
		affinity: Affinity.Support,
		category: TechniqueCategory.Physical,
		power: 65,
		precision: 0.95,
		manaCost: 0,
		description: 'A quick attack that always goes first.',
		properties: { physicalBased: true, contact: true },
		initiative: 3
	}),

	// === COMBO/SPECIAL TECHNIQUES ===
	dragonBreath: new Technique({
		name: 'Dragon Breath',
		affinity: Affinity.Elemental_Fire,
		category: TechniqueCategory.Magical,
		power: 130,
		precision: 0.9,
		manaCost: 28,
		description: 'Breathes powerful flames like a dragon.',
		properties: { magicBased: true, areaEffect: true }
	}),

	necromancy: new Technique({
		name: 'Necromancy',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.8,
		manaCost: 30,
		description: 'Raises fallen allies or controls the undead.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Heal,
				value: 0.25,
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	shadowFlame: new Technique({
		name: 'Shadow Flame',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Magical,
		power: 105,
		precision: 0.85,
		manaCost: 24,
		description: 'Dark flames that burn both body and soul.',
		properties: { magicBased: true }
	}),

	terrorWave: new Technique({
		name: 'Terror Wave',
		affinity: Affinity.Demonic_Aura,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.9,
		manaCost: 20,
		description: 'Sends waves of terror to paralyze enemies.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Fear,
				chance: 0.8,
				target: EffectTarget.Opponent
			})
		]
	}),

	// === UTILITY/SUPPORT TECHNIQUES ===
	courageBoost: new Technique({
		name: 'Courage Boost',
		affinity: Affinity.Support,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 1.0,
		manaCost: 12,
		description: 'Inspires courage, boosting all stats slightly.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'attack', stages: 1 },
				chance: 1.0,
				target: EffectTarget.Self
			}),
			new TechniqueEffect({
				type: TechniqueEffectType.StatBoost,
				value: { stat: 'defense', stages: 1 },
				chance: 1.0,
				target: EffectTarget.Self
			})
		]
	}),

	natureBind: new Technique({
		name: 'Nature Bind',
		affinity: Affinity.Elemental_Earth,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.85,
		manaCost: 16,
		description: 'Binds the opponent with vines and roots.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Stunned,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	}),

	moonBeam: new Technique({
		name: 'Moon Beam',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Magical,
		power: 85,
		precision: 0.9,
		manaCost: 18,
		description: 'Calls down ethereal moonlight.',
		properties: { magicBased: true }
	}),

	charmSpell: new Technique({
		name: 'Charm Spell',
		affinity: Affinity.Illusion,
		category: TechniqueCategory.Support,
		power: 0,
		precision: 0.75,
		manaCost: 18,
		description: 'Charms the opponent into compliance.',
		effects: [
			new TechniqueEffect({
				type: TechniqueEffectType.Condition,
				value: CombatCondition.Charmed,
				chance: 1.0,
				target: EffectTarget.Opponent
			})
		]
	})
};

// Technique learning levels by race
export const TECHNIQUE_LEARNS: { [key: string]: { level: number; technique: string }[] } = {
	human: [
		{ level: 1, technique: 'zoltraak' },
		{ level: 5, technique: 'healingMagic' },
		{ level: 10, technique: 'manaShield' },
		{ level: 15, technique: 'defensiveMagic' },
		{ level: 20, technique: 'speedBoost' },
		{ level: 25, technique: 'judaBeam' },
		{ level: 30, technique: 'timeDilation' }
	],
	elf: [
		{ level: 1, technique: 'auserlese' },
		{ level: 5, technique: 'healingMagic' },
		{ level: 10, technique: 'windSlash' },
		{ level: 15, technique: 'moonBeam' },
		{ level: 20, technique: 'starfall' },
		{ level: 25, technique: 'mindControl' },
		{ level: 30, technique: 'invisibility' }
	],
	dwarf: [
		{ level: 1, technique: 'rockThrow' },
		{ level: 5, technique: 'stoneWall' },
		{ level: 10, technique: 'hammerStrike' },
		{ level: 15, technique: 'earthquake' },
		{ level: 20, technique: 'shieldWall' },
		{ level: 25, technique: 'meteorStrike' },
		{ level: 30, technique: 'ironWill' }
	],
	demon: [
		{ level: 1, technique: 'shadowBlast' },
		{ level: 5, technique: 'lifeDrain' },
		{ level: 10, technique: 'demonicAura' },
		{ level: 15, technique: 'fearInduction' },
		{ level: 20, technique: 'cursedFlames' },
		{ level: 25, technique: 'shadowStep' },
		{ level: 30, technique: 'necromancy' }
	],
	monster: [
		{ level: 1, technique: 'ember' },
		{ level: 5, technique: 'waterPulse' },
		{ level: 10, technique: 'gust' },
		{ level: 15, technique: 'flameBurst' },
		{ level: 20, technique: 'tidalWave' },
		{ level: 25, technique: 'hurricane' },
		{ level: 30, technique: 'inferno' }
	],
	golem: [
		{ level: 1, technique: 'stoneWall' },
		{ level: 5, technique: 'earthquake' },
		{ level: 10, technique: 'meteorStrike' },
		{ level: 15, technique: 'hammerStrike' },
		{ level: 20, technique: 'shieldWall' },
		{ level: 25, technique: 'ironWill' },
		{ level: 30, technique: 'rockThrow' }
	],
	spirit: [
		{ level: 1, technique: 'invisibility' },
		{ level: 5, technique: 'auserlese' },
		{ level: 10, technique: 'mindControl' },
		{ level: 15, technique: 'mirrorImage' },
		{ level: 20, technique: 'shadowBlast' },
		{ level: 25, technique: 'terrorWave' },
		{ level: 30, technique: 'necromancy' }
	]
};

// Helper functions
export const getTechniquesByAffinity = (affinity: Affinity): Technique[] => {
	return Object.values(TECHNIQUES).filter((tech) => tech.affinity === affinity);
};

export const getTechniquesByCategory = (category: TechniqueCategory): Technique[] => {
	return Object.values(TECHNIQUES).filter((tech) => tech.category === category);
};

export const getTechniqueByName = (name: string): Technique | null => {
	const key = Object.keys(TECHNIQUES).find((k) => TECHNIQUES[k].name.toLowerCase() === name.toLowerCase());
	return key ? TECHNIQUES[key] : null;
};

export const getRandomTechnique = (): Technique => {
	const keys = Object.keys(TECHNIQUES);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return TECHNIQUES[randomKey];
};
