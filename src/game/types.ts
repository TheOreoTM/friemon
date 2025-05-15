export type Stat = 'hp' | 'atk' | 'def' | 'spAtk' | 'spDef' | 'spd';

export type ElementType =
	| 'Normal'
	| 'Fire'
	| 'Water'
	| 'Electric'
	| 'Grass'
	| 'Ice'
	| 'Fighting'
	| 'Poison'
	| 'Ground'
	| 'Flying'
	| 'Psychic'
	| 'Bug'
	| 'Rock'
	| 'Ghost'
	| 'Dragon'
	| 'Dark'
	| 'Steel'
	| 'Fairy';

export interface StaticCharacterData {
	id: string;
	name: string;
	types: ElementType[];
	abilities: string[]; // Ability IDs or names
	hiddenAbility: string | null; // Ability ID or name
	baseStats: Record<Stat, number>;
	learnableMoves: string[]; // Move IDs
	canLearnEveryTM: boolean;
}

export interface StaticMoveData {
	id: string;
	name: string;
	type: ElementType;
	category: 'Physical' | 'Special' | 'Status';
	power: number | null; // null for status moves
	accuracy: number | null; // null if never misses
	pp: number;
	description: string;
	effectId?: string; // Link to special move logic
}

export interface BattlerMove {
	moveData: StaticMoveData;
	currentPP: number;
}

export type StatusCondition = 'poisoned' | 'burned' | 'paralyzed' | 'frozen' | 'asleep';
export type VolatileStatus = 'confusion' | 'flinch' | 'leechSeed' | 'taunt';

// Stat stages (e.g., +1 Atk, -2 Def)
export type StatStage = -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type StatStages = Record<Stat, StatStage>;

// Represents a character actively participating in a battle
export interface Battler {
	id: string; // Unique ID for this battler instance in the battle
	staticData: StaticCharacterData; // Reference to the base character data
	ownerId: string; // Discord User ID of the owner

	// Battle-specific state
	currentHp: number;
	level: number; // Character's current level
	stats: Record<Stat, number>; // Calculated current stats
	statStages: StatStages; // Current stat stage modifiers

	moves: BattlerMove[]; // Moves the battler knows in this battle
	currentStatus: StatusCondition | null;
	volatileStatus: VolatileStatus[];
	abilityActive: boolean; // Whether the ability is currently active/suppressed
	abilityTriggered: Record<string, boolean>; // To track abilities that trigger once (like Intrepid Sword)

	// Team information
	team: Battler[]; // Reference to the battler's team in this battle
	position: number; // Position in the team (0-indexed)

	takeDamage(amount: number): void;
	heal(amount: number): void;
	applyStatus(status: StatusCondition): void;
	removeStatus(): void;
	applyVolatileStatus(status: VolatileStatus): void;
	removeVolatileStatus(status: VolatileStatus): void;
	modifyStat(stat: Stat, stages: number): void;
	hasAbility(abilityId: string): boolean;
	hasAbilityTriggered(abilityId: string): boolean;
	markAbilityTriggered(abilityId: string): void;
}

// Represents the overall state of the battle
export interface IBattleState {
	id: string;
	players: { userId: string; team: Battler[] }[]; // Players and their teams
	activeBattlers: Battler[]; // Battlers currently on the field (e.g., [player1_active, player2_active])
	turn: number; // Current turn number
	log: string[]; // Battle log
	weather: 'none' | 'sun' | 'rain' | 'hail' | 'sandstorm' | 'snow'; // Basic weather
	fieldEffect: 'none';
}
