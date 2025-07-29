import { Race, CombatCondition } from '../types/enums';
import { Stats, StatBoosts, VolatileEffect, Trait, Equipment, Disposition } from '../types/interfaces';
import { StatName, BoostableStat } from '../types/types';
import { clamp, randomInt } from '../util/utils';
import { Technique } from './Technique';
import { getTechniqueByName } from '../data/Techniques';

export class Character {
	id: string;
	name: string;
	ownerId: string;
	level: number;
	currentXP: number;
	xpToNextLevel: number;
	races: Race[];
	baseStats: Stats;
	hpIv: number;
	atkIv: number;
	defIv: number;
	mgAtkIv: number;
	mgDefIv: number;
	spdIv: number;
	totalIV: number;
	ivPercent: number;
	growthPoints: Stats;
	disposition: Disposition;
	trait: Trait;
	equipment: Equipment | null;
	techniques: Technique[];
	currentHP: number;
	maxHP: number;
	mana: number;
	maxMana: number;
	currentMana: number;
	conditions: Set<CombatCondition>;
	conditionDurations: Map<CombatCondition, number>;
	statBoosts: StatBoosts;
	volatileEffects: VolatileEffect;

	constructor(data: Partial<Character>) {
		this.id = data.id || '';
		this.name = data.name || '';
		this.ownerId = data.ownerId || '';
		this.level = data.level || 1;
		this.currentXP = data.currentXP || 0;
		this.xpToNextLevel = this.calculateXPToNextLevel();
		this.races = data.races || [];
		this.baseStats = data.baseStats || { hp: 50, attack: 50, defense: 50, magicAttack: 50, magicDefense: 50, speed: 50 };
		this.hpIv = data.hpIv ?? randomInt(0, 31);
		this.atkIv = data.atkIv ?? randomInt(0, 31);
		this.defIv = data.defIv ?? randomInt(0, 31);
		this.mgAtkIv = data.mgAtkIv ?? randomInt(0, 31);
		this.mgDefIv = data.mgDefIv ?? randomInt(0, 31);
		this.spdIv = data.spdIv ?? randomInt(0, 31);
		this.totalIV = data.totalIV ?? this.calculateTotalIV();
		this.ivPercent = data.ivPercent ?? this.calculateIVPercent();
		this.growthPoints = data.growthPoints || { hp: 0, attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 };
		this.disposition = data.disposition!;
		this.trait = data.trait!;
		this.equipment = data.equipment || null;
		this.techniques = data.techniques || [];
		this.conditions = new Set();
		this.conditionDurations = new Map();
		this.statBoosts = { attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 };
		this.volatileEffects = this.createEmptyVolatileEffects();

		this.maxHP = 0;
		this.currentHP = 0;
		this.maxMana = 0;
		this.mana = 0;
		this.currentMana = 0;

		this.initialize();
	}

	initialize(): void {
		this.maxHP = this.calculateMaxHP();
		this.currentHP = this.maxHP;
		this.maxMana = this.calculateMaxMana();
		this.mana = this.maxMana;
		this.currentMana = this.maxMana;
		this.conditions.clear();
		this.conditionDurations.clear();
		this.statBoosts = { attack: 0, defense: 0, magicAttack: 0, magicDefense: 0, speed: 0 };
		this.volatileEffects = this.createEmptyVolatileEffects();
	}

	private calculateTotalIV(): number {
		return this.hpIv + this.atkIv + this.defIv + this.mgAtkIv + this.mgDefIv + this.spdIv;
	}

	private calculateIVPercent(): number {
		const total = this.calculateTotalIV();
		const maxPossible = 31 * 6; // 186 max total IVs
		return Math.round((total / maxPossible) * 100 * 100) / 100; // Round to 2 decimal places
	}

	private createEmptyVolatileEffects(): VolatileEffect {
		return {
			manaShield: false,
			leechCurse: false,
			tormented: false,
			challenged: false,
			channeling: false,
			immaterial: false,
			lastDamage: 0,
			consecutiveUse: 0,
			focusedAura: false,
			mistyAura: false,
			mimicry: false,
			magicSeal: false
		};
	}

	private calculateMaxHP(): number {
		const base = this.baseStats.hp;
		const iv = this.hpIv;
		const gp = Math.floor(this.growthPoints.hp / 4);
		const hp = Math.floor(((2 * base + iv + gp) * this.level) / 100) + this.level + 10;

		// Apply disposition modifier
		if (this.disposition.increasedStat === 'hp') {
			return Math.floor(hp * 1.1);
		} else if (this.disposition.decreasedStat === 'hp') {
			return Math.floor(hp * 0.9);
		}

		return hp;
	}

	private calculateMaxMana(): number {
		const magicAttack = this.getEffectiveStats().magicAttack;
		return Math.floor(50 + magicAttack * 0.5 + this.level * 2);
	}

	private calculateStat(stat: StatName): number {
		if (stat === 'hp') return this.maxHP;

		const base = this.baseStats[stat];
		let iv: number;
		switch (stat) {
			case 'attack':
				iv = this.atkIv;
				break;
			case 'defense':
				iv = this.defIv;
				break;
			case 'magicAttack':
				iv = this.mgAtkIv;
				break;
			case 'magicDefense':
				iv = this.mgDefIv;
				break;
			case 'speed':
				iv = this.spdIv;
				break;
			default:
				iv = 0;
		}
		const gp = Math.floor(this.growthPoints[stat] / 4);
		let value = Math.floor(((2 * base + iv + gp) * this.level) / 100) + 5;

		// Apply disposition modifier
		if (this.disposition.increasedStat === stat) {
			value = Math.floor(value * 1.1);
		} else if (this.disposition.decreasedStat === stat) {
			value = Math.floor(value * 0.9);
		}

		// Apply stat boosts (only for boostable stats, not HP)
		if (stat in this.statBoosts) {
			const boost = this.statBoosts[stat as BoostableStat];
			const multiplier = boost >= 0 ? (2 + boost) / 2 : 2 / (2 - boost);
			value = Math.floor(value * multiplier);
		}

		return value;
	}

	getEffectiveStats(): Stats {
		let stats: Stats = {
			hp: this.maxHP,
			attack: this.calculateStat('attack'),
			defense: this.calculateStat('defense'),
			magicAttack: this.calculateStat('magicAttack'),
			magicDefense: this.calculateStat('magicDefense'),
			speed: this.calculateStat('speed')
		};

		// Apply equipment stat modifiers
		if (this.equipment && this.equipment.statMultiplier) {
			stats = this.equipment.statMultiplier(this, stats);
		}

		return stats;
	}

	takeDamage(damage: number): void {
		if (this.volatileEffects.manaShield) {
			// Mana Shield absorbs damage up to 25% of max HP
			const shieldStrength = Math.floor(this.maxHP * 0.25);
			if (damage >= shieldStrength) {
				damage -= shieldStrength;
				this.volatileEffects.manaShield = false;
			} else {
				this.volatileEffects.manaShield = false;
				return;
			}
		}

		this.currentHP = Math.max(0, this.currentHP - damage);
		this.volatileEffects.lastDamage = damage;
	}

	heal(amount: number): void {
		this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
	}

	consumeMana(amount: number): boolean {
		if (this.equipment && this.equipment.manaCostReduction) {
			amount = Math.max(1, amount - this.equipment.manaCostReduction);
		}

		if (this.mana >= amount) {
			this.mana -= amount;
			return true;
		}
		return false;
	}

	restoreMana(amount: number): void {
		this.mana = Math.min(this.maxMana, this.mana + amount);
	}

	isDefeated(): boolean {
		return this.currentHP <= 0;
	}

	hasRace(race: Race): boolean {
		return this.races.includes(race);
	}

	canAct(): boolean {
		if (this.conditions.has(CombatCondition.Stunned)) return false;
		if (this.conditions.has(CombatCondition.Dazed)) {
			this.removeCondition(CombatCondition.Dazed);
			return false;
		}
		if (this.conditions.has(CombatCondition.Fear)) {
			return Math.random() > 0.25; // 25% chance to not act
		}
		return true;
	}

	applyConditionDamage(): void {
		if (this.conditions.has(CombatCondition.Exhausted)) {
			const damage = Math.floor(this.maxHP / 8);
			this.takeDamage(damage);
		}
	}

	updateCondition(): void {
		const conditionsToRemove: CombatCondition[] = [];

		for (const [condition, turns] of this.conditionDurations) {
			const newTurns = turns - 1;
			if (newTurns <= 0) {
				conditionsToRemove.push(condition);
			} else {
				this.conditionDurations.set(condition, newTurns);
			}
		}

		for (const condition of conditionsToRemove) {
			this.removeCondition(condition);
		}
	}

	addCondition(condition: CombatCondition, duration: number = 3): void {
		if (condition === CombatCondition.Normal) return;

		this.conditions.add(condition);
		this.conditionDurations.set(condition, duration);
	}

	removeCondition(condition: CombatCondition): void {
		this.conditions.delete(condition);
		this.conditionDurations.delete(condition);
	}

	hasCondition(condition: CombatCondition): boolean {
		return this.conditions.has(condition);
	}

	hasAnyCondition(): boolean {
		return this.conditions.size > 0;
	}

	getConditionNames(): string[] {
		return Array.from(this.conditions).map((condition) => condition.toString());
	}

	modifyStatBoost(stat: BoostableStat, stages: number): void {
		this.statBoosts[stat] = clamp(this.statBoosts[stat] + stages, -6, 6);
	}

	getCriticalStrikeChance(): number {
		let chance = this.volatileEffects.focusedAura ? 0.125 : 0.0625;
		if (this.equipment && this.equipment.critChanceBoost) {
			chance += this.equipment.critChanceBoost;
		}
		return chance;
	}

	calculateSelfInflictedDamage(): number {
		const attack = this.getEffectiveStats().attack;
		return Math.floor((40 * attack) / 100 + 2);
	}

	learnTechnique(technique: Technique | string): boolean {
		if (this.techniques.length >= 4) {
			return false;
		}

		if (typeof technique === 'string') {
			const techniqueObj = getTechniqueByName(technique);
			if (!techniqueObj) {
				console.warn(`Technique "${technique}" not found`);
				return false;
			}
			technique = techniqueObj;
		}

		// Check if already knows this technique
		if (this.techniques.some((t) => t.name === technique.name)) {
			return false;
		}

		this.techniques.push(technique);
		return true;
	}

	forgetTechnique(index: number): boolean {
		if (index < 0 || index >= this.techniques.length) {
			return false;
		}
		this.techniques.splice(index, 1);
		return true;
	}

	private calculateXPToNextLevel(): number {
		return Math.floor((4 * Math.pow(this.level + 1, 3)) / 5);
	}

	gainXP(amount: number): boolean {
		this.currentXP += amount;
		let leveled = false;

		while (this.currentXP >= this.xpToNextLevel && this.level < 100) {
			this.currentXP -= this.xpToNextLevel;
			this.level++;
			leveled = true;
			this.xpToNextLevel = this.calculateXPToNextLevel();

			// Recalculate stats on level up
			const oldMaxHP = this.maxHP;
			const oldMaxMana = this.maxMana;
			this.maxHP = this.calculateMaxHP();
			this.maxMana = this.calculateMaxMana();

			// Heal HP and Mana proportionally
			const hpRatio = this.currentHP / oldMaxHP;
			const manaRatio = this.mana / oldMaxMana;
			this.currentHP = Math.floor(this.maxHP * hpRatio);
			this.mana = Math.floor(this.maxMana * manaRatio);
		}

		return leveled;
	}

	getActiveConditions(): string[] {
		return this.getConditionNames();
	}

	getTechniqueNames(): string[] {
		return this.techniques.map((technique) => technique.name);
	}

	getTechniqueByName(name: string): Technique | null {
		return this.techniques.find((technique) => technique.name.toLowerCase() === name.toLowerCase()) || null;
	}

	getTotalIV(): number {
		return this.totalIV;
	}

	getIVPercent(): number {
		return this.ivPercent;
	}
}
