import { Character } from './Character';
import { Technique } from './Technique';
import { Race, CombatCondition, type Affinity } from '../types/enums';
import { Stats } from '../types/interfaces';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { generateRandomLevel, generateStartingXP } from '../util/levelGeneration';
import { LEVEL_CONSTANTS } from '../util/constants';
import type { Battle } from '../battle/Battle';
import type { UserCharacter } from '@prisma/client';
import { randomInt } from '../util/utils';
import { container } from '@sapphire/framework';

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
	abilityStartOfTurnEffect?: (character: Character, battle: Battle) => void;
	abilityEndOfTurnEffect?: (character: Character, battle: Battle) => void;
	abilityAfterOwnTechniqueUse?: (character: Character, battle: Battle, technique: Technique) => void;
	abilityAfterOpponentTechniqueUse?: (character: Character, battle: Battle, technique: Technique) => void;
	abilityOnDamageReceived?: (character: Character, battle: Battle, damage: number) => void;
	abilityOnDamageDealt?: (character: Character, battle: Battle, damage: number) => void;

	// Damage modifiers
	damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
	damageInputMultiplier?: (user: Character, target: Character, technique: Technique) => number;

	// Condition effects
	preventCondition?: (character: Character, condition: CombatCondition) => boolean;

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
	level?: number;
	races: Race[];
	resistances?: Affinity[];
	weaknesses?: Affinity[];
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
	public readonly resistances: Affinity[];
	public readonly weaknesses: Affinity[];
	public readonly baseStats: Stats;
	public readonly techniques: Technique[];
	public readonly ability: Ability;
	public readonly additionalMetadata: CharacterMetadata;

	constructor(options: CharacterDataOptions) {
		this.characterName = options.characterName;
		this.cosmetic = options.cosmetic;
		this.level = options.level || 1;
		this.races = options.races;
		this.resistances = options.resistances || [];
		this.weaknesses = options.weaknesses || [];
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

		// Validate resistances and weaknesses don't overlap
		const overlap = this.resistances.filter((r) => this.weaknesses.includes(r));
		if (overlap.length > 0) {
			throw new Error(`Character cannot be both resistant and weak to: ${overlap.join(', ')}`);
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
			resistances: [...this.resistances],
			weaknesses: [...this.weaknesses],
			maxHP: this.baseStats.hp,
			currentHP: this.baseStats.hp,
			maxMana: Math.floor(this.baseStats.hp * 0.6),
			currentMana: Math.floor(this.baseStats.hp * 0.6),
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
	 * Creates a UserCharacter in the database with random IVs
	 */
	public async createUserCharacter(
		userId: string,
		options: {
			setSelected?: boolean;
			isStarter?: boolean;
			obtainedFrom?: string;
			nickname?: string;
			level?: number;
		} = {}
	): Promise<UserCharacter> {
		const { isStarter = false, obtainedFrom = 'unknown', nickname = null, level = 1, setSelected = false } = options;

		const hpIv = randomInt(1, 31);
		const atkIv = randomInt(1, 31);
		const defIv = randomInt(1, 31);
		const mgAtkIv = randomInt(1, 31);
		const mgDefIv = randomInt(1, 31);
		const spdIv = randomInt(1, 31);

		const totalIV = hpIv + atkIv + defIv + mgAtkIv + mgDefIv + spdIv;
		const ivPercent = (totalIV / 186) * 100; // 186 is max possible (31 * 6)

		// Create the character in the database
		const userCharacter = await container.db.userCharacter.create({
			data: {
				userId: userId,
				characterName: this.characterName,
				level: level,
				currentXP: level === 1 ? 0 : generateStartingXP(level),
				maxHP: this.baseStats.hp,
				maxMana: Math.floor(this.baseStats.hp * 0.6),
				hpIv: hpIv,
				atkIv: atkIv,
				defIv: defIv,
				mgAtkIv: mgAtkIv,
				mgDefIv: mgDefIv,
				spdIv: spdIv,
				totalIV: totalIV,
				ivPercent: ivPercent,
				nickname: nickname,
				isStarter: isStarter,
				obtainedFrom: obtainedFrom
			}
		});

		if (setSelected) {
			await container.db.user.update({
				where: { id: userId },
				data: { selectedCharacterId: userCharacter.id }
			});
		}

		// Update character collection
		await container.db.characterCollection.upsert({
			where: {
				userId_characterName: {
					userId: userId,
					characterName: this.characterName
				}
			},
			create: {
				userId: userId,
				characterName: this.characterName,
				timesObtained: 1,
				firstObtained: new Date()
			},
			update: {
				timesObtained: { increment: 1 }
			}
		});

		return userCharacter;
	}

	/**
	 * Creates a UserCharacter with completely random level (for gacha/rewards)
	 */
	public async createRandomUserCharacter(
		userId: string,
		options: {
			obtainedFrom?: string;
			nickname?: string;
		} = {}
	): Promise<UserCharacter> {
		const randomLevel = generateRandomLevel();

		return this.createUserCharacter(userId, {
			...options,
			level: randomLevel,
			isStarter: false
		});
	}

	/**
	 * Creates a Character instance from this CharacterData
	 * @deprecated Use createCharacterWithRandomLevel instead
	 */
	public createCharacter(): Character {
		const character = new Character({
			id: `${this.characterName}-${Date.now()}`,
			name: this.characterName,
			ownerId: '',
			level: this.level,
			currentXP: 0,
			races: [...this.races],
			resistances: [...this.resistances],
			weaknesses: [...this.weaknesses],
			maxHP: this.baseStats.hp,
			currentHP: this.baseStats.hp,
			maxMana: Math.floor(this.baseStats.hp * 0.6),
			currentMana: Math.floor(this.baseStats.hp * 0.6),
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
			resistances: this.resistances,
			weaknesses: this.weaknesses,
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
			resistances: [...this.resistances],
			weaknesses: [...this.weaknesses],
			baseStats: { ...this.baseStats },
			techniques: [...this.techniques],
			ability: { ...this.ability },
			additionalMetadata: { ...this.additionalMetadata }
		});
	}

	/**
	 * Check if this character can learn a specific technique
	 */
	public canLearnTechnique(technique: Technique): boolean {
		return !technique.levelRequirement || this.level >= technique.levelRequirement;
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

	/**
	 * Check if this character has a specific race
	 */
	public hasRace(race: Race): boolean {
		return this.races.includes(race);
	}

	/**
	 * Check if character is resistant to a specific element/type
	 */
	public isResistantTo(element: Affinity): boolean {
		return this.resistances.includes(element);
	}

	/**
	 * Check if character is weak to a specific element/type
	 */
	public isWeakTo(element: Affinity): boolean {
		return this.weaknesses.includes(element);
	}

	/**
	 * Get damage multiplier for a specific element/type
	 */
	public getDamageMultiplier(element: Affinity): number {
		if (this.isResistantTo(element)) {
			return 0.5; // 50% damage
		}
		if (this.isWeakTo(element)) {
			return 2.0; // 200% damage
		}
		return 1.0; // Normal damage
	}
}
