import { Trait } from '../types/interfaces';

export const createTrait = (data: Trait): Trait => {
	return {
		name: data.name,
		description: data.description,
		onEnterField: data.onEnterField,
		onReceiveDamage: data.onReceiveDamage,
		damageOutputMultiplier: data.damageOutputMultiplier,
		onStrike: data.onStrike,
		preventCondition: data.preventCondition,
		onEnvironment: data.onEnvironment,
		manaRestoreOnKO: data.manaRestoreOnKO,
		onTurnEnd: data.onTurnEnd
	};
};
