import { Equipment } from '../types/interfaces';

export const createEquipment = (data: Equipment): Equipment => {
	return {
		name: data.name,
		description: data.description,
		statMultiplier: data.statMultiplier,
		damageOutputMultiplier: data.damageOutputMultiplier,
		onTurnEnd: data.onTurnEnd,
		onReceiveStrike: data.onReceiveStrike,
		critChanceBoost: data.critChanceBoost,
		manaCostReduction: data.manaCostReduction
	};
};
