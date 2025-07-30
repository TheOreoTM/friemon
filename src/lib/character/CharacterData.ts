import { Character } from './Character';
import { Technique } from './Technique';
import { Race } from '../types/enums';
import { Stats } from '../types/interfaces';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { generateRandomLevel, generateStartingXP } from '../util/levelGeneration';
import { LEVEL_CONSTANTS } from '../util/constants';

// ============== COSMETIC & DISPLAY ==============

export interface CharacterCosmetic {
	emoji: CharacterEmoji;
	color: number;
	description?: string;
}

// ============== ABILITY SYSTEM ==============

export interface Ability {
	abilityName: string;
	abilityEffectString: string;

	// Battle event hooks
	abilityStartOfTurnEffect?: (character: Character, battle: any) => void;
	abilityEndOfTurnEffect?: (character: Character, battle: any) => void;
	abilityAfterOwnTechniqueUse?: (character: Character, battle: any, technique: Technique) => void;
	abilityAfterOpponentTechniqueUse?: (character: Character, battle: any, technique: Technique) => void;
	abilityOnDamageReceived?: (character: Character, battle: any, damage: number) => void;
	abilityOnDamageDealt?: (character: Character, battle: any, damage: number) => void;

	// Damage modifiers
	damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
	damageInputMultiplier?: (user: Character, target: Character, technique: Technique) => number;

	// Condition effects
	preventCondition?: (character: Character, condition: any) => boolean;

	// Sub-abilities for complex characters
	subAbilities?: Array<{
		name: string;
		description: string;
	}>;
}

// ============== CHARACTER METADATA ==============

export interface CharacterMetadata {
	// Analysis/Stack-based abilities
	analysisStacks?: number;
	perseveranceStacks?: number;
	chainStacks?: number;
	eyeContactStacks?: number;
	observations?: number;
	resolve?: number;
	theoryCount?: number;
	barrierStrength?: number;
	armyStrength?: number;

	// Boolean flags
	manaSuppressed?: boolean;
	ignoreManaSuppressed?: boolean;
	empathyLearning?: boolean;
	reckless?: boolean;
	dragonSlayerTraining?: boolean;
	demonLordAuthority?: boolean;
	heroicPresence?: boolean;
	divineProtection?: boolean;
	highSpeedEscape?: boolean;
	resolveToKill?: boolean;
	memorySpecialist?: boolean;
	grazeSpecialist?: boolean;
	overheal?: boolean;
	divineBlessing?: boolean;
	pinnacleUnlocked?: boolean;
}

// ============== CHARACTER DATA OPTIONS ==============

export interface CharacterDataOptions {
	characterName: CharacterName;
	cosmetic: CharacterCosmetic;
	level: number;
	races: Race[];
	baseStats: Stats;
	techniques: Technique[];
	ability: Ability;

	// Additional metadata for special mechanics
	additionalMetadata?: CharacterMetadata;
}

// ============== MAIN CHARACTER DATA CLASS ==============

export class CharacterData {
	public readonly characterName: CharacterName;
	public readonly cosmetic: CharacterCosmetic;
	public readonly level: number;
	public readonly races: Race[];
	public readonly baseStats: Stats;
	public readonly techniques: Technique[];
	public readonly ability: Ability;
	public readonly additionalMetadata: CharacterMetadata;

	constructor(options: CharacterDataOptions) {
		this.characterName = options.characterName;
		this.cosmetic = options.cosmetic;
		this.level = options.level;
		this.races = options.races;
		this.baseStats = options.baseStats;
		this.techniques = options.techniques;
		this.ability = options.ability;
		this.additionalMetadata = options.additionalMetadata || {};

		// Validate the character data
		this.validate();
	}

	private validate(): void {
		if (!this.characterName) {
			throw new Error('Character name is required');
		}

		if (this.level < 1 || this.level > LEVEL_CONSTANTS.MAX_LEVEL) {
			throw new Error(`Character level must be between 1 and ${LEVEL_CONSTANTS.MAX_LEVEL}`);
		}

		if (!this.races || this.races.length === 0 || this.races.length > 3) {
			throw new Error('Character must have 1-3 races');
		}

		if (!this.baseStats) {
			throw new Error('Base stats are required');
		}

		if (!this.techniques || this.techniques.length === 0 || this.techniques.length > 8) {
			throw new Error('Character must have 1-8 techniques');
		}

		if (!this.ability || !this.ability.abilityName) {
			throw new Error('Character must have an ability');
		}

		// Validate stat totals for balance (adjusted for inflated Pokemon-style stats)
		const totalStats = Object.values(this.baseStats).reduce((sum, stat) => sum + stat, 0);
		if (totalStats < 300 || totalStats > 500) {
			console.warn(`Character ${this.characterName} has unusual stat total: ${totalStats}. Recommended range: 300-500`);
		}
	}

	/**
	 * Creates a Character instance from this CharacterData with random level
	 */
	public createCharacterWithRandomLevel(): Character {
		const randomLevel = generateRandomLevel();
		const randomXP = generateStartingXP(randomLevel);

		const character = new Character({
			id: `${this.characterName}-${Date.now()}`,
			name: this.characterName,
			ownerId: '',
			level: randomLevel,
			currentXP: randomXP,
			races: [...this.races],
			maxHP: this.baseStats.hp,
			currentHP: this.baseStats.hp,
			maxMana: Math.floor(this.baseStats.hp * 0.6),
			currentMana: Math.floor(this.baseStats.hp * 0.6),
			mana: Math.floor(this.baseStats.hp * 0.6),
			baseStats: { ...this.baseStats },
			techniques: [...this.techniques],
			disposition: {
				name: 'Balanced',
				increasedStat: 'hp',
				decreasedStat: 'hp'
			},
			trait: {
				name: this.ability.abilityName,
				description: this.ability.abilityEffectString
			}
		});

		// Set trait-like ability system (convert ability to trait)
		character.trait = {
			name: this.ability.abilityName,
			description: this.ability.abilityEffectString,

			// Convert ability methods to trait methods
			onTurnStart: this.ability.abilityStartOfTurnEffect,
			onTurnEnd: this.ability.abilityEndOfTurnEffect,
			onTechniqueUsed: this.ability.abilityAfterOwnTechniqueUse,
			onOpponentTechniqueUsed: this.ability.abilityAfterOpponentTechniqueUse,
			onDamageReceived: this.ability.abilityOnDamageReceived,
			onDamageDealt: this.ability.abilityOnDamageDealt,
			damageOutputMultiplier: this.ability.damageOutputMultiplier,
			damageInputMultiplier: this.ability.damageInputMultiplier,
			preventCondition: this.ability.preventCondition
		};

		// Set metadata (much cleaner!)
		character.metadata = { ...this.additionalMetadata };

		return character;
	}

	/**
	 * Creates a Character instance from this CharacterData
	 */
	public createCharacter(): Character {
		const character = new Character({
			id: `${this.characterName}-${Date.now()}`,
			name: this.characterName,
			ownerId: '',
			level: this.level,
			currentXP: 0,
			races: [...this.races],
			maxHP: this.baseStats.hp,
			currentHP: this.baseStats.hp,
			maxMana: Math.floor(this.baseStats.hp * 0.6),
			currentMana: Math.floor(this.baseStats.hp * 0.6),
			mana: Math.floor(this.baseStats.hp * 0.6),
			baseStats: { ...this.baseStats },
			techniques: [...this.techniques],
			disposition: {
				name: 'Balanced',
				increasedStat: 'hp',
				decreasedStat: 'hp'
			},
			trait: {
				name: this.ability.abilityName,
				description: this.ability.abilityEffectString
			}
		});

		// Set trait-like ability system (convert ability to trait)
		character.trait = {
			name: this.ability.abilityName,
			description: this.ability.abilityEffectString,

			// Convert ability methods to trait methods
			onTurnStart: this.ability.abilityStartOfTurnEffect,
			onTurnEnd: this.ability.abilityEndOfTurnEffect,
			onTechniqueUsed: this.ability.abilityAfterOwnTechniqueUse,
			onOpponentTechniqueUsed: this.ability.abilityAfterOpponentTechniqueUse,
			onDamageReceived: this.ability.abilityOnDamageReceived,
			onDamageDealt: this.ability.abilityOnDamageDealt,
			damageOutputMultiplier: this.ability.damageOutputMultiplier,
			damageInputMultiplier: this.ability.damageInputMultiplier,
			preventCondition: this.ability.preventCondition
		};

		character.metadata = { ...this.additionalMetadata };

		return character;
	}

	/**
	 * Get display information for UI
	 */
	public getDisplayInfo() {
		return {
			name: this.characterName,
			emoji: this.cosmetic.emoji,
			color: this.cosmetic.color,
			description: this.cosmetic.description,
			level: this.level,
			races: this.races,
			statTotal: Object.values(this.baseStats).reduce((sum, stat) => sum + stat, 0),
			ability: this.ability.abilityName,
			abilityDescription: this.ability.abilityEffectString,
			subAbilities: this.ability.subAbilities || []
		};
	}

	/**
	 * Clone this character data
	 */
	public clone(): CharacterData {
		return new CharacterData({
			characterName: this.characterName,
			cosmetic: { ...this.cosmetic },
			level: this.level,
			races: [...this.races],
			baseStats: { ...this.baseStats },
			techniques: [...this.techniques],
			ability: { ...this.ability },
			additionalMetadata: { ...this.additionalMetadata }
		});
	}

	/**
	 * Check if this character can use a specific technique
	 */
	public canUseTechnique(techniqueName: string): boolean {
		return this.techniques.some((tech) => tech.name.toLowerCase() === techniqueName.toLowerCase());
	}

	/**
	 * Get a technique by name
	 */
	public getTechnique(techniqueName: string): Technique | undefined {
		return this.techniques.find((tech) => tech.name.toLowerCase() === techniqueName.toLowerCase());
	}

	/**
	 * Get character's effective stats including racial bonuses
	 */
	public getEffectiveStats(): Stats {
		// Base stats with potential racial bonuses
		const effectiveStats = { ...this.baseStats };

		// Apply racial bonuses based on race
		for (const race of this.races) {
			switch (race) {
				case Race.Elf:
					effectiveStats.magicAttack += 5;
					effectiveStats.magicDefense += 5;
					effectiveStats.speed += 3;
					break;
				case Race.Human:
					// Humans are balanced, small bonus to all
					effectiveStats.hp += 2;
					effectiveStats.attack += 2;
					effectiveStats.defense += 2;
					effectiveStats.magicAttack += 2;
					effectiveStats.magicDefense += 2;
					effectiveStats.speed += 2;
					break;
				case Race.Dwarf:
					effectiveStats.hp += 10;
					effectiveStats.attack += 5;
					effectiveStats.defense += 8;
					effectiveStats.speed -= 3;
					break;
				case Race.Demon:
					effectiveStats.magicAttack += 8;
					effectiveStats.attack += 3;
					effectiveStats.magicDefense += 3;
					break;
				case Race.Monster:
					effectiveStats.attack += 6;
					effectiveStats.speed += 4;
					effectiveStats.hp += 5;
					break;
			}
		}

		return effectiveStats;
	}
}
