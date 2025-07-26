import { Race, CombatCondition, AmbientMagicCondition, TerrainType } from './enums';
import { Character } from '../character/Character';
import type { Battle } from '../battle/Battle';
import type { Technique } from '../character/Technique';

export interface Stats {
	hp: number;
	attack: number;
	defense: number;
	magicAttack: number;
	magicDefense: number;
	speed: number;
}

export interface StatBoosts {
	attack: number;
	defense: number;
	magicAttack: number;
	magicDefense: number;
	speed: number;
}

export interface VolatileEffect {
	manaShield: boolean;
	leechCurse: boolean;
	tormented: boolean;
	challenged: boolean;
	channeling: boolean;
	immaterial: boolean;
	lastDamage: number;
	consecutiveUse: number;
	focusedAura: boolean;
	mistyAura: boolean;
	mimicry: boolean;
	magicSeal: boolean;
}

export interface TechniqueEffect {
	type: string;
	value: any;
	chance: number;
	target: string;
	condition?: (user: Character, target: Character, battle: Battle) => boolean;
}

export interface Trait {
	name: string;
	description: string;
	onEnterField?: (user: Character, opponent: Character, battle: Battle) => void;
	onReceiveDamage?: (target: Character, source: Character, battle: Battle, damage: number) => number;
	damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
	onStrike?: (user: Character, target: Character, battle: Battle) => void;
	preventCondition?: (character: Character, condition: CombatCondition) => boolean;
	onEnvironment?: (character: Character, battle: Battle) => void;
	manaRestoreOnKO?: (user: Character, battle: Battle) => number;
	onTurnEnd?: (character: Character, battle: Battle) => void;
}

export interface Equipment {
	name: string;
	description: string;
	statMultiplier?: (holder: Character, stats: Stats) => Stats;
	damageOutputMultiplier?: (user: Character, target: Character, technique: Technique) => number;
	onTurnEnd?: (holder: Character, battle: Battle) => void;
	onReceiveStrike?: (holder: Character, source: Character, battle: Battle) => void;
	critChanceBoost?: number;
	manaCostReduction?: number;
}

export interface Disposition {
	name: string;
	increasedStat: keyof Stats;
	decreasedStat: keyof Stats;
}

export interface BattleAction {
	type: 'technique' | 'switch';
	player: number;
	data: number; // technique index or switch target index
}

export interface Challenge {
	challengerID: string;
	challengedID: string;
	channelID: string;
	createdAt: Date;
}

export interface DiscordBattle {
	battleID: string;
	battle: Battle;
	player1ID: string;
	player2ID: string;
	channelID: string;
	currentTurn: number;
	waitingFor: string;
	actionNeeded: 'technique' | 'switch' | 'defeated';
	player1Technique?: number;
	player2Technique?: number;
	player1Ready: boolean;
	player2Ready: boolean;
}

export interface BattleState {
	userCharacter: Character;
	opponentCharacter: Character;
	userParty: Character[];
	opponentParty: Character[];
	userActiveIndex: number;
	opponentActiveIndex: number;
	ambientMagic: AmbientMagicCondition;
	terrain: TerrainType;
	turn: number;
	userHazards: Map<string, number>;
	opponentHazards: Map<string, number>;
}


export interface CharacterData {
	id: string;
	name: string;
	level: number;
	races: Race[];
	baseStats: Stats;
	techniques: string[];
	trait?: string;
	equipment?: string;
}
