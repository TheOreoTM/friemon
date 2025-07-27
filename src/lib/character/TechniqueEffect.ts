import { Character } from './Character';
import type { Battle } from '../battle/Battle';
import { TechniqueEffectType, EffectTarget, VolatileEffectType, CombatCondition } from '../types/enums';
import { StatBoosts } from '../types/interfaces';

// Discriminated union types for different effect structures
export type TechniqueEffectData = ConditionEffect | StatBoostEffect | HealEffect | VolatileEffect;

export interface ConditionEffect {
	type: TechniqueEffectType.Condition;
	value: CombatCondition;
	chance: number;
	target: EffectTarget.Self | EffectTarget.Opponent;
	condition?: (user: Character, target: Character, battle: Battle) => boolean;
}

export interface StatBoostEffect {
	type: TechniqueEffectType.StatBoost;
	value: { stat: keyof StatBoosts; stages: number };
	chance: number;
	target: EffectTarget.Self | EffectTarget.Opponent;
	condition?: (user: Character, target: Character, battle: Battle) => boolean;
}

export interface HealEffect {
	type: TechniqueEffectType.Heal;
	value: number; // Percentage of max HP (0.0 to 1.0)
	chance: number;
	target: EffectTarget.Self | EffectTarget.Opponent | EffectTarget.Party;
	condition?: (user: Character, target: Character, battle: Battle) => boolean;
}

export interface VolatileEffect {
	type: TechniqueEffectType.VolatileEffect;
	value: VolatileEffectType;
	chance: number;
	target: EffectTarget.Self | EffectTarget.Opponent;
	condition?: (user: Character, target: Character, battle: Battle) => boolean;
}

// Helper functions to create strongly-typed effects
export function createConditionEffect(
	value: CombatCondition,
	chance: number,
	target: EffectTarget.Self | EffectTarget.Opponent,
	condition?: (user: Character, target: Character, battle: Battle) => boolean
): TechniqueEffect {
	return new TechniqueEffect({
		type: TechniqueEffectType.Condition,
		value,
		chance,
		target,
		condition
	});
}

export function createStatBoostEffect(
	stat: keyof StatBoosts,
	stages: number,
	chance: number,
	target: EffectTarget.Self | EffectTarget.Opponent,
	condition?: (user: Character, target: Character, battle: Battle) => boolean
): TechniqueEffect {
	return new TechniqueEffect({
		type: TechniqueEffectType.StatBoost,
		value: { stat, stages },
		chance,
		target,
		condition
	});
}

export function createHealEffect(
	value: number,
	chance: number,
	target: EffectTarget.Self | EffectTarget.Opponent | EffectTarget.Party,
	condition?: (user: Character, target: Character, battle: Battle) => boolean
): TechniqueEffect {
	return new TechniqueEffect({
		type: TechniqueEffectType.Heal,
		value,
		chance,
		target,
		condition
	});
}

export function createVolatileEffect(
	value: VolatileEffectType,
	chance: number,
	target: EffectTarget.Self | EffectTarget.Opponent,
	condition?: (user: Character, target: Character, battle: Battle) => boolean
): TechniqueEffect {
	return new TechniqueEffect({
		type: TechniqueEffectType.VolatileEffect,
		value,
		chance,
		target,
		condition
	});
}

export class TechniqueEffect {
	private data: TechniqueEffectData;

	constructor(data: TechniqueEffectData) {
		this.data = data;
	}

	get type(): TechniqueEffectType {
		return this.data.type;
	}

	get chance(): number {
		return this.data.chance;
	}

	get target(): EffectTarget {
		return this.data.target;
	}

	get value(): TechniqueEffectData['value'] {
		return this.data.value;
	}

	get condition(): ((user: Character, target: Character, battle: Battle) => boolean) | undefined {
		return this.data.condition;
	}

	canActivate(user: Character, target: Character, battle: Battle): boolean {
		return this.condition ? this.condition(user, target, battle) : true;
	}

	shouldActivate(): boolean {
		return Math.random() < this.chance;
	}

	apply(user: Character, target: Character, battle: Battle): void {
		if (!this.canActivate(user, target, battle) || !this.shouldActivate()) {
			return;
		}

		switch (this.data.type) {
			case TechniqueEffectType.Condition: {
				const conditionData = this.data as ConditionEffect;
				if (conditionData.target === EffectTarget.Opponent) {
					target.addCondition(conditionData.value);
				} else if (conditionData.target === EffectTarget.Self) {
					user.addCondition(conditionData.value);
				}
				break;
			}
			case TechniqueEffectType.StatBoost: {
				const statData = this.data as StatBoostEffect;
				const statTarget = statData.target === EffectTarget.Opponent ? target : user;
				const { stat, stages } = statData.value;
				statTarget.statBoosts[stat] = Math.max(-6, Math.min(6, statTarget.statBoosts[stat] + stages));
				break;
			}
			case TechniqueEffectType.Heal: {
				const healData = this.data as HealEffect;
				const healTarget = healData.target === EffectTarget.Self ? user : target;
				const healAmount = Math.floor(healTarget.baseStats.hp * healData.value);
				healTarget.currentHP = Math.min(healTarget.baseStats.hp, healTarget.currentHP + healAmount);
				break;
			}
			case TechniqueEffectType.VolatileEffect: {
				const volatileData = this.data as VolatileEffect;
				const volatileTarget = volatileData.target === EffectTarget.Self ? user : target;
				const effectKey = volatileData.value;
				
				// Since enum values match property names exactly, we can use bracket notation
				(volatileTarget.volatileEffects as any)[effectKey] = true;
				break;
			}
		}
	}
}
