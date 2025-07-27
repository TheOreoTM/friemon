import { Race } from '../types/enums';
import { Technique } from '../character/Technique';
import { getTechniqueByName, TECHNIQUES } from './Techniques';

export interface TechniqueLearnSet {
	level: number;
	technique: string;
}

export interface RacialTechniqueSet {
	[key: string]: TechniqueLearnSet[];
}

// Enhanced technique learning system based on race and level
export const RACIAL_TECHNIQUE_SETS: RacialTechniqueSet = {
	[Race.Human]: [
		{ level: 1, technique: 'zoltraak' },
		{ level: 1, technique: 'healingMagic' },
		{ level: 5, technique: 'manaShield' },
		{ level: 10, technique: 'defensiveMagic' },
		{ level: 15, technique: 'speedBoost' },
		{ level: 20, technique: 'judaBeam' },
		{ level: 25, technique: 'holyStrike' },
		{ level: 30, technique: 'courageBoost' },
		{ level: 35, technique: 'shieldWall' },
		{ level: 40, technique: 'timeDilation' }
	],
	[Race.Elf]: [
		{ level: 1, technique: 'auserlese' },
		{ level: 1, technique: 'windSlash' },
		{ level: 5, technique: 'healingMagic' },
		{ level: 10, technique: 'moonBeam' },
		{ level: 15, technique: 'natureBind' },
		{ level: 20, technique: 'starfall' },
		{ level: 25, technique: 'mindControl' },
		{ level: 30, technique: 'invisibility' },
		{ level: 35, technique: 'mirrorImage' },
		{ level: 40, technique: 'timeDilation' }
	],
	[Race.Dwarf]: [
		{ level: 1, technique: 'rockThrow' },
		{ level: 1, technique: 'hammerStrike' },
		{ level: 5, technique: 'stoneWall' },
		{ level: 10, technique: 'earthquake' },
		{ level: 15, technique: 'shieldWall' },
		{ level: 20, technique: 'meteorStrike' },
		{ level: 25, technique: 'ironWill' },
		{ level: 30, technique: 'defensiveMagic' },
		{ level: 35, technique: 'guardBreaker' },
		{ level: 40, technique: 'dragonSlash' }
	],
	[Race.Demon]: [
		{ level: 1, technique: 'shadowBlast' },
		{ level: 1, technique: 'lifeDrain' },
		{ level: 5, technique: 'demonicAura' },
		{ level: 10, technique: 'fearInduction' },
		{ level: 15, technique: 'cursedFlames' },
		{ level: 20, technique: 'shadowStep' },
		{ level: 25, technique: 'necromancy' },
		{ level: 30, technique: 'shadowFlame' },
		{ level: 35, technique: 'terrorWave' },
		{ level: 40, technique: 'charmSpell' }
	],
	[Race.Monster]: [
		{ level: 1, technique: 'ember' },
		{ level: 1, technique: 'waterPulse' },
		{ level: 5, technique: 'gust' },
		{ level: 10, technique: 'flameBurst' },
		{ level: 15, technique: 'tidalWave' },
		{ level: 20, technique: 'hurricane' },
		{ level: 25, technique: 'inferno' },
		{ level: 30, technique: 'blizzard' },
		{ level: 35, technique: 'tornado' },
		{ level: 40, technique: 'dragonBreath' }
	],
	[Race.Golem]: [
		{ level: 1, technique: 'stoneWall' },
		{ level: 1, technique: 'earthquake' },
		{ level: 5, technique: 'meteorStrike' },
		{ level: 10, technique: 'hammerStrike' },
		{ level: 15, technique: 'shieldWall' },
		{ level: 20, technique: 'ironWill' },
		{ level: 25, technique: 'rockThrow' },
		{ level: 30, technique: 'guardBreaker' },
		{ level: 35, technique: 'defensiveMagic' },
		{ level: 40, technique: 'powerBoost' }
	],
	[Race.Spirit]: [
		{ level: 1, technique: 'invisibility' },
		{ level: 1, technique: 'auserlese' },
		{ level: 5, technique: 'mindControl' },
		{ level: 10, technique: 'mirrorImage' },
		{ level: 15, technique: 'shadowBlast' },
		{ level: 20, technique: 'terrorWave' },
		{ level: 25, technique: 'necromancy' },
		{ level: 30, technique: 'moonBeam' },
		{ level: 35, technique: 'starfall' },
		{ level: 40, technique: 'timeDilation' }
	]
};

// Pre-defined technique sets for specific characters
export const CHARACTER_TECHNIQUE_SETS: { [key: string]: string[] } = {
	// === HUMAN CHARACTERS ===
	frieren: ['zoltraak', 'manaShield', 'healingMagic', 'timeDilation'],
	fern: ['zoltraak', 'manaShield', 'speedBoost', 'defensiveMagic'],
	stark: ['dragonSlash', 'berserkerRage', 'guardBreaker', 'swiftStrike'],
	himmel: ['holyStrike', 'courageBoost', 'healingMagic', 'shieldWall'],

	// === ELF CHARACTERS ===
	elysia: ['auserlese', 'natureBind', 'moonBeam', 'healingMagic'],
	sylvain: ['windSlash', 'auserlese', 'swiftStrike', 'speedBoost'],
	aelindra: ['starfall', 'timeDilation', 'auserlese', 'mirrorImage'],

	// === DWARF CHARACTERS ===
	thorin: ['earthquake', 'stoneWall', 'hammerStrike', 'ironWill'],
	daina: ['rockThrow', 'defensiveMagic', 'shieldWall', 'stoneWall'],

	// === DEMON CHARACTERS ===
	malachar: ['shadowBlast', 'lifeDrain', 'demonicAura', 'fearInduction'],
	lilith: ['charmSpell', 'shadowStep', 'lifeDrain', 'cursedFlames'],

	// === MONSTER CHARACTERS ===
	tempest: ['hurricane', 'gust', 'windSlash', 'tornado'],
	ignitus: ['inferno', 'ember', 'flameBurst', 'dragonBreath'],
	aquaria: ['tidalWave', 'iceBeam', 'waterPulse', 'blizzard'],

	// === GOLEM CHARACTERS ===
	atlas: ['meteorStrike', 'stoneWall', 'earthquake', 'shieldWall'],

	// === SPIRIT CHARACTERS ===
	whisper: ['invisibility', 'auserlese', 'mindControl', 'terrorWave'],

	// === HYBRID CHARACTERS ===
	dracolich: ['dragonBreath', 'necromancy', 'shadowFlame', 'terrorWave'],
	ironclad: ['hammerStrike', 'shieldWall', 'guardBreaker', 'powerBoost']
};

/**
 * Gets all techniques a character should know based on their race and level
 */
export function getTechniquesForRaceAndLevel(race: Race, level: number): Technique[] {
	const learnSet = RACIAL_TECHNIQUE_SETS[race] || [];
	const techniques: Technique[] = [];
	
	for (const learn of learnSet) {
		if (level >= learn.level) {
			const technique = getTechniqueByName(learn.technique);
			if (technique) {
				techniques.push(technique);
			}
		}
	}
	
	return techniques;
}

/**
 * Gets techniques for a specific character by ID
 */
export function getTechniquesForCharacter(characterId: string): Technique[] {
	const techniqueNames = CHARACTER_TECHNIQUE_SETS[characterId];
	if (!techniqueNames) {
		return [];
	}
	
	const techniques: Technique[] = [];
	for (const name of techniqueNames) {
		const technique = getTechniqueByName(name);
		if (technique) {
			techniques.push(technique);
		} else {
			console.warn(`Technique "${name}" not found for character "${characterId}"`);
		}
	}
	
	return techniques;
}

/**
 * Gets the best 4 techniques for a character based on their race, level, and predefined set
 */
export function getBestTechniquesForCharacter(characterId: string, races: Race[], level: number): Technique[] {
	// First try to get predefined techniques for this character
	let techniques = getTechniquesForCharacter(characterId);
	
	// If no predefined set, or we need more techniques, get from racial sets
	if (techniques.length < 4) {
		const racialTechniques = new Set<string>();
		
		// Combine techniques from all races
		for (const race of races) {
			const raceTechniques = getTechniquesForRaceAndLevel(race, level);
			raceTechniques.forEach(tech => racialTechniques.add(tech.name));
		}
		
		// Add racial techniques that aren't already included
		for (const techName of racialTechniques) {
			if (techniques.length >= 4) break;
			if (!techniques.some(t => t.name === techName)) {
				const technique = getTechniqueByName(techName);
				if (technique) {
					techniques.push(technique);
				}
			}
		}
	}
	
	// Ensure we don't exceed 4 techniques
	return techniques.slice(0, 4);
}

/**
 * Gets all available techniques (for reference)
 */
export function getAllTechniques(): Technique[] {
	return Object.values(TECHNIQUES);
}

/**
 * Validates that all character technique sets reference valid techniques
 */
export function validateTechniqueSets(): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	// Check character sets
	for (const [charId, techniqueNames] of Object.entries(CHARACTER_TECHNIQUE_SETS)) {
		for (const techName of techniqueNames) {
			if (!getTechniqueByName(techName)) {
				errors.push(`Character "${charId}" references unknown technique "${techName}"`);
			}
		}
	}
	
	// Check racial sets
	for (const [race, learnSet] of Object.entries(RACIAL_TECHNIQUE_SETS)) {
		for (const learn of learnSet) {
			if (!getTechniqueByName(learn.technique)) {
				errors.push(`Race "${race}" references unknown technique "${learn.technique}"`);
			}
		}
	}
	
	return {
		valid: errors.length === 0,
		errors
	};
}