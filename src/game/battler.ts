import {
	type StaticCharacterData,
	type StaticMoveData,
	type IBattler,
	type BattlerMove,
	type Stat,
	type StatStage,
	type StatStages,
	type StatusCondition,
	type VolatileStatus
} from './types';
function calculateStats(baseStats: Record<Stat, number>, level: number): Record<Stat, number> {
	const calculatedStats: Record<Stat, number> = {} as any;
	for (const stat in baseStats) {
		if (stat === 'hp') {
			calculatedStats[stat as Stat] = Math.floor((2 * baseStats[stat as Stat] * level) / 100) + level + 10;
		} else {
			calculatedStats[stat as Stat] = Math.floor((2 * baseStats[stat as Stat] * level) / 100) + 5;
		}
	}
	return calculatedStats;
}

export class Battler implements IBattler {
	public id: string;
	public staticData: StaticCharacterData;
	public ownerId: string;
	public currentHp: number;
	public level: number;
	public stats: Record<Stat, number>;
	public statStages: StatStages;
	public moves: BattlerMove[];
	public currentStatus: StatusCondition | null = null;
	public volatileStatus: VolatileStatus[] = [];
	public abilityActive: boolean = true;
	public abilityTriggered: Record<string, boolean> = {};
	public team: Battler[];
	public position: number;

	constructor(staticData: StaticCharacterData, ownerId: string, level: number, movesData: StaticMoveData[], team: Battler[], position: number) {
		this.id = `${ownerId}-${staticData.id}-${Date.now()}`;
		this.staticData = staticData;
		this.ownerId = ownerId;
		this.level = level;
		this.stats = calculateStats(staticData.baseStats, level);
		this.currentHp = this.stats.hp;

		this.statStages = {
			hp: 0, // HP stages usually aren't a thing, but included for completeness
			atk: 0,
			def: 0,
			spAtk: 0,
			spDef: 0,
			spd: 0
		};

		// Initialize moves with current PP
		this.moves = movesData.map((move) => ({ moveData: move, currentPP: move.pp }));

		for (const ability of staticData.abilities) {
			this.abilityTriggered[ability] = false;
		}
		if (staticData.hiddenAbility) {
			this.abilityTriggered[staticData.hiddenAbility] = false;
		}

		this.team = team;
		this.position = position;
	}

	takeDamage(amount: number): void {
		this.currentHp -= amount;
		if (this.currentHp < 0) {
			this.currentHp = 0;
		}
	}

	heal(amount: number): void {
		this.currentHp += amount;
		if (this.currentHp > this.stats.hp) {
			this.currentHp = this.stats.hp;
		}
	}

	applyStatus(status: StatusCondition): void {
		if (this.currentStatus === null) {
			this.currentStatus = status;
		}
	}

	removeStatus(): void {
		this.currentStatus = null;
	}

	applyVolatileStatus(status: VolatileStatus): void {
		if (!this.volatileStatus.includes(status)) {
			this.volatileStatus.push(status);
		}
	}

	removeVolatileStatus(status: VolatileStatus): void {
		this.volatileStatus = this.volatileStatus.filter((s) => s !== status);
	}

	modifyStat(stat: Stat, stages: number): void {
		const currentStage = this.statStages[stat];
		let newStage = (currentStage + stages) as StatStage;

		// Cap stages between -6 and +6
		if (newStage > 6) newStage = 6;
		if (newStage < -6) newStage = -6;

		this.statStages[stat] = newStage;
	}

	hasAbility(abilityId: string): boolean {
		return this.staticData.abilities.includes(abilityId) || this.staticData.hiddenAbility === abilityId;
	}

	hasAbilityTriggered(abilityId: string): boolean {
		return this.abilityTriggered[abilityId] || false;
	}

	markAbilityTriggered(abilityId: string): void {
		if (this.hasAbility(abilityId)) {
			this.abilityTriggered[abilityId] = true;
		}
	}
}
