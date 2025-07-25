import { CharacterData } from '../types/interfaces';
import { Race } from '../types/enums';

export const STARTER_CHARACTERS: { [key: string]: CharacterData } = {
	// === HUMAN CHARACTERS ===
	frieren: {
		id: 'frieren',
		name: 'Frieren',
		level: 50,
		races: [Race.Human],
		baseStats: {
			hp: 85,
			attack: 60,
			defense: 70,
			magicAttack: 120,
			magicDefense: 95,
			speed: 80
		},
		techniques: ['zoltraak', 'manaShield', 'healingMagic', 'defensiveMagic']
	},

	fern: {
		id: 'fern',
		name: 'Fern',
		level: 35,
		races: [Race.Human],
		baseStats: {
			hp: 75,
			attack: 65,
			defense: 75,
			magicAttack: 105,
			magicDefense: 85,
			speed: 90
		},
		techniques: ['zoltraak', 'manaShield', 'speedBoost', 'defensiveMagic']
	},

	stark: {
		id: 'stark',
		name: 'Stark',
		level: 35,
		races: [Race.Human],
		baseStats: {
			hp: 95,
			attack: 115,
			defense: 85,
			magicAttack: 45,
			magicDefense: 60,
			speed: 75
		},
		techniques: ['dragonSlash', 'berserkerRage', 'guardBreaker', 'healingPotion']
	},

	himmel: {
		id: 'himmel',
		name: 'Himmel',
		level: 60,
		races: [Race.Human],
		baseStats: {
			hp: 100,
			attack: 110,
			defense: 90,
			magicAttack: 70,
			magicDefense: 80,
			speed: 85
		},
		techniques: ['holyStrike', 'courageBoost', 'healingMagic', 'shieldWall']
	},

	// === ELF CHARACTERS ===
	elysia: {
		id: 'elysia',
		name: 'Elysia',
		level: 45,
		races: [Race.Elf],
		baseStats: {
			hp: 70,
			attack: 55,
			defense: 65,
			magicAttack: 125,
			magicDefense: 100,
			speed: 95
		},
		techniques: ['auserlese', 'natureBind', 'moonBeam', 'healingMagic']
	},

	sylvain: {
		id: 'sylvain',
		name: 'Sylvain',
		level: 40,
		races: [Race.Elf],
		baseStats: {
			hp: 65,
			attack: 70,
			defense: 60,
			magicAttack: 115,
			magicDefense: 90,
			speed: 105
		},
		techniques: ['windSlash', 'auserlese', 'natureShield', 'swiftStrike']
	},

	aelindra: {
		id: 'aelindra',
		name: 'Aelindra',
		level: 50,
		races: [Race.Elf],
		baseStats: {
			hp: 75,
			attack: 65,
			defense: 70,
			magicAttack: 130,
			magicDefense: 105,
			speed: 85
		},
		techniques: ['starfall', 'timeDilation', 'auserlese', 'arcaneShield']
	},

	// === DWARF CHARACTERS ===
	thorin: {
		id: 'thorin',
		name: 'Thorin',
		level: 45,
		races: [Race.Dwarf],
		baseStats: {
			hp: 110,
			attack: 100,
			defense: 120,
			magicAttack: 50,
			magicDefense: 85,
			speed: 55
		},
		techniques: ['earthquake', 'stoneWall', 'hammerStrike', 'ironWill']
	},

	daina: {
		id: 'daina',
		name: 'Daina',
		level: 40,
		races: [Race.Dwarf],
		baseStats: {
			hp: 105,
			attack: 90,
			defense: 115,
			magicAttack: 60,
			magicDefense: 90,
			speed: 50
		},
		techniques: ['rockThrow', 'defensiveMagic', 'forgeStrike', 'mountainResilience']
	},

	// === DEMON CHARACTERS ===
	malachar: {
		id: 'malachar',
		name: 'Malachar',
		level: 55,
		races: [Race.Demon],
		baseStats: {
			hp: 90,
			attack: 85,
			defense: 75,
			magicAttack: 135,
			magicDefense: 80,
			speed: 90
		},
		techniques: ['shadowBlast', 'lifeDrain', 'demonicAura', 'fearInduction']
	},

	lilith: {
		id: 'lilith',
		name: 'Lilith',
		level: 50,
		races: [Race.Demon],
		baseStats: {
			hp: 80,
			attack: 75,
			defense: 70,
			magicAttack: 125,
			magicDefense: 85,
			speed: 100
		},
		techniques: ['charmSpell', 'shadowStep', 'lifeDrain', 'cursedFlames']
	},

	// === MONSTER CHARACTERS ===
	tempest: {
		id: 'tempest',
		name: 'Tempest',
		level: 35,
		races: [Race.Monster],
		baseStats: {
			hp: 85,
			attack: 95,
			defense: 70,
			magicAttack: 110,
			magicDefense: 65,
			speed: 110
		},
		techniques: ['hurricane', 'lightning', 'windShield', 'stormCall']
	},

	ignitus: {
		id: 'ignitus',
		name: 'Ignitus',
		level: 40,
		races: [Race.Monster],
		baseStats: {
			hp: 90,
			attack: 105,
			defense: 80,
			magicAttack: 115,
			magicDefense: 70,
			speed: 85
		},
		techniques: ['flameCharge', 'inferno', 'emberStorm', 'heatWave']
	},

	aquaria: {
		id: 'aquaria',
		name: 'Aquaria',
		level: 38,
		races: [Race.Monster],
		baseStats: {
			hp: 95,
			attack: 80,
			defense: 85,
			magicAttack: 100,
			magicDefense: 90,
			speed: 75
		},
		techniques: ['tidalWave', 'iceBeam', 'waterPulse', 'frozenArmor']
	},

	// === GOLEM CHARACTERS ===
	atlas: {
		id: 'atlas',
		name: 'Atlas',
		level: 50,
		races: [Race.Golem],
		baseStats: {
			hp: 140,
			attack: 110,
			defense: 140,
			magicAttack: 40,
			magicDefense: 100,
			speed: 35
		},
		techniques: ['meteorStrike', 'stoneWall', 'earthquake', 'immovableForce']
	},

	// === SPIRIT CHARACTERS ===
	whisper: {
		id: 'whisper',
		name: 'Whisper',
		level: 45,
		races: [Race.Spirit],
		baseStats: {
			hp: 60,
			attack: 50,
			defense: 55,
			magicAttack: 120,
			magicDefense: 110,
			speed: 115
		},
		techniques: ['spiritBlast', 'etherealForm', 'auserlese', 'mindControl']
	},

	// === HYBRID CHARACTERS ===
	dracolich: {
		id: 'dracolich',
		name: 'Dracolich',
		level: 65,
		races: [Race.Monster, Race.Spirit],
		baseStats: {
			hp: 120,
			attack: 100,
			defense: 90,
			magicAttack: 140,
			magicDefense: 95,
			speed: 70
		},
		techniques: ['dragonBreath', 'necromancy', 'shadowFlame', 'terrorWave']
	},

	ironclad: {
		id: 'ironclad',
		name: 'Ironclad',
		level: 48,
		races: [Race.Human, Race.Golem],
		baseStats: {
			hp: 115,
			attack: 105,
			defense: 125,
			magicAttack: 55,
			magicDefense: 95,
			speed: 55
		},
		techniques: ['metalStorm', 'forgeArmor', 'hammerTime', 'magneticField']
	}
};

// Helper functions for character management
export const getCharacterByName = (name: string): CharacterData | null => {
	const key = Object.keys(STARTER_CHARACTERS).find((k) => STARTER_CHARACTERS[k].name.toLowerCase() === name.toLowerCase());
	return key ? STARTER_CHARACTERS[key] : null;
};

export const getCharactersByRace = (race: Race): CharacterData[] => {
	return Object.values(STARTER_CHARACTERS).filter((char) => char.races.includes(race));
};

export const getRandomCharacter = (): CharacterData => {
	const keys = Object.keys(STARTER_CHARACTERS);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return STARTER_CHARACTERS[randomKey];
};

export const getStarterTeam = (): CharacterData[] => {
	// Returns a balanced starter team of 3 characters
	return [
		STARTER_CHARACTERS.fern, // Human mage
		STARTER_CHARACTERS.stark, // Human warrior
		STARTER_CHARACTERS.elysia // Elf support
	];
};

// Character rarity/tier system
export enum CharacterTier {
	Common = 'Common',
	Uncommon = 'Uncommon',
	Rare = 'Rare',
	Epic = 'Epic',
	Legendary = 'Legendary'
}

export const CHARACTER_TIERS: { [key: string]: CharacterTier } = {
	// Common (easy to obtain)
	fern: CharacterTier.Common,
	stark: CharacterTier.Common,
	thorin: CharacterTier.Common,
	daina: CharacterTier.Common,
	tempest: CharacterTier.Common,

	// Uncommon
	elysia: CharacterTier.Uncommon,
	sylvain: CharacterTier.Uncommon,
	ignitus: CharacterTier.Uncommon,
	aquaria: CharacterTier.Uncommon,

	// Rare
	himmel: CharacterTier.Rare,
	aelindra: CharacterTier.Rare,
	malachar: CharacterTier.Rare,
	whisper: CharacterTier.Rare,
	ironclad: CharacterTier.Rare,

	// Epic
	frieren: CharacterTier.Epic,
	lilith: CharacterTier.Epic,
	atlas: CharacterTier.Epic,

	// Legendary
	dracolich: CharacterTier.Legendary
};
