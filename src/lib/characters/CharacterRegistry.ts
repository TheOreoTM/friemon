import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';

// Import all character definitions
import Frieren from './Frieren';
import Fern from './Fern';
import Himmel from './Himmel';
import Stark from './Stark';
import Flamme from './Flamme';
import Serie from './Serie';
import Denken from './Denken';
import Sein from './Sein';
import Ubel from './Ubel';
import Sense from './Sense';
import Wirbel from './Wirbel';
import Edel from './Edel';
import Laufen from './Laufen';
import Linie from './Linie';

/**
 * Registry of all available characters using the new TCG-inspired system
 */
export class CharacterRegistry {
	private static characters: Map<CharacterName, CharacterData> = new Map();

	// Initialize the registry with all 16 characters
	static {
		// Main party characters
		this.registerCharacter(Frieren);
		this.registerCharacter(Fern);
		this.registerCharacter(Himmel);
		this.registerCharacter(Stark);

		// Legendary mages
		this.registerCharacter(Flamme);
		this.registerCharacter(Serie);

		// Demons
		this.registerCharacter(Linie);

		// First-Class Mage Exam participants
		this.registerCharacter(Denken);
		this.registerCharacter(Edel);
		this.registerCharacter(Laufen);
		this.registerCharacter(Ubel);
		this.registerCharacter(Wirbel);

		// Other notable characters
		this.registerCharacter(Sein);
		this.registerCharacter(Sense);
	}

	/**
	 * Register a character in the registry
	 */
	private static registerCharacter(characterData: CharacterData): void {
		const characterName = characterData.characterName;
		this.characters.set(characterName, characterData);
	}

	/**
	 * Get a character by name
	 */
	public static getCharacter(name: CharacterName): CharacterData | undefined {
		return this.characters.get(name);
	}

	/**
	 * Get all available characters
	 */
	public static getAllCharacters(): CharacterData[] {
		return Array.from(this.characters.values());
	}

	/**
	 * Get character names
	 */
	public static getCharacterNames(): CharacterName[] {
		return Array.from(this.characters.keys());
	}

	/**
	 * Check if a character exists
	 */
	public static hasCharacter(name: CharacterName): boolean {
		return this.characters.has(name);
	}

	/**
	 * Get characters by race
	 */
	public static getCharactersByRace(race: string): CharacterData[] {
		return this.getAllCharacters().filter((character) => character.races.includes(race as any));
	}

	/**
	 * Get starter characters (balanced for new players)
	 */
	public static getStarterCharacters(): CharacterData[] {
		return [
			this.getCharacter(CharacterName.Fern),
			this.getCharacter(CharacterName.Himmel),
			this.getCharacter(CharacterName.Stark),
			this.getCharacter(CharacterName.Denken),
			this.getCharacter(CharacterName.Edel),
			this.getCharacter(CharacterName.Laufen)
		].filter((char) => char !== undefined) as CharacterData[];
	}

	/**
	 * Get characters by power level
	 */
	public static getCharactersByLevel(minLevel: number, maxLevel: number): CharacterData[] {
		return this.getAllCharacters().filter((character) => character.level >= minLevel && character.level <= maxLevel);
	}

	/**
	 * Get legendary characters (high level)
	 */
	public static getLegendaryCharacters(): CharacterData[] {
		return this.getCharactersByLevel(70, 100);
	}

	/**
	 * Get beginner-friendly characters (lower level)
	 */
	public static getBeginnerCharacters(): CharacterData[] {
		return this.getCharactersByLevel(30, 50);
	}

	/**
	 * Create a Character instance from character name
	 */
	public static createCharacterInstance(name: CharacterName) {
		const characterData = this.getCharacter(name);
		if (!characterData) {
			throw new Error(`Character ${name} not found in registry`);
		}
		return characterData.createCharacter();
	}

	/**
	 * Create a Character instance with random level from character name
	 */
	public static createRandomLevelCharacterInstance(name: CharacterName) {
		const characterData = this.getCharacter(name);
		if (!characterData) {
			throw new Error(`Character ${name} not found in registry`);
		}
		return characterData.createCharacterWithRandomLevel();
	}

	/**
	 * Get display information for all characters (for UI)
	 */
	public static getCharacterDisplayList() {
		return this.getAllCharacters().map((character) => character.getDisplayInfo());
	}

	/**
	 * Search characters by name (partial match)
	 */
	public static searchCharacters(searchTerm: string): CharacterData[] {
		const term = searchTerm.toLowerCase();
		return this.getAllCharacters().filter((character) => character.characterName.toLowerCase().includes(term));
	}

	/**
	 * Get random character
	 */
	public static getRandomCharacter(): CharacterData {
		const characters = this.getAllCharacters();
		const randomIndex = Math.floor(Math.random() * characters.length);
		return characters[randomIndex];
	}

	/**
	 * Get random starter team (3 characters)
	 */
	public static getRandomStarterTeam(): CharacterData[] {
		const beginnerChars = this.getBeginnerCharacters();
		const shuffled = [...beginnerChars].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 3);
	}

	/**
	 * Get character statistics
	 */
	public static getRegistryStats() {
		const characters = this.getAllCharacters();
		const raceCount = new Map<string, number>();
		const levelGroups = {
			beginner: 0, // 30-49
			intermediate: 0, // 50-69
			advanced: 0, // 70-89
			legendary: 0 // 90+
		};

		characters.forEach((char) => {
			// Count races
			char.races.forEach((race) => {
				raceCount.set(race, (raceCount.get(race) || 0) + 1);
			});

			// Count level groups
			if (char.level < 50) levelGroups.beginner++;
			else if (char.level < 70) levelGroups.intermediate++;
			else if (char.level < 90) levelGroups.advanced++;
			else levelGroups.legendary++;
		});

		return {
			totalCharacters: characters.length,
			raceDistribution: Object.fromEntries(raceCount),
			levelDistribution: levelGroups,
			averageLevel: Math.round(characters.reduce((sum, char) => sum + char.level, 0) / characters.length)
		};
	}
}
