import { Affinity, TechniqueCategory } from '../types/enums';
import { TechniqueEffect } from './TechniqueEffect';
import { TechniqueProperty, TargetType } from '../types/types';
import { Character } from './Character';
import { Battle } from '../battle/Battle';

export class Technique {
	name: string;
	affinity: Affinity;
	category: TechniqueCategory;
	power: number;
	precision: number;
	manaCost: number;
	initiative: number;
	effects: TechniqueEffect[];
	properties: { [key in TechniqueProperty]?: boolean };
	targetType: TargetType;
	multiTargetCount?: number; // How many targets for multiTarget techniques (default 2)
	description: string;
	execute?: (user: Character, target: Character, battle: Battle, technique: Technique) => boolean;

	constructor(data: {
		name: string;
		affinity: Affinity;
		category: TechniqueCategory;
		power: number;
		precision: number;
		manaCost: number;
		initiative?: number; // Priority
		effects?: TechniqueEffect[];
		properties?: { [key in TechniqueProperty]?: boolean };
		targetType?: TargetType;
		multiTargetCount?: number;
		description: string;
		execute?: (user: Character, target: Character, battle: Battle, technique: Technique) => boolean;
	}) {
		this.name = data.name;
		this.affinity = data.affinity;
		this.category = data.category;
		this.power = data.power;
		this.precision = data.precision;
		this.manaCost = data.manaCost;
		this.initiative = data.initiative || 0;
		this.effects = data.effects || [];
		this.properties = data.properties || {};
		this.targetType = data.targetType || 'single';
		this.multiTargetCount = data.multiTargetCount || 2;
		this.description = data.description;
		this.execute = data.execute;
	}

	canUse(user: Character): boolean {
		if (user.volatileEffects.magicSeal && this.category === TechniqueCategory.Magical) {
			return false;
		}
		return user.currentMana >= this.manaCost;
	}

	getEffectivePower(user: Character, target: Character): number {
		let power = this.power;

		// Apply trait damage multipliers
		if (user.trait && user.trait.damageOutputMultiplier) {
			power *= user.trait.damageOutputMultiplier(user, target, this);
		}

		// Apply equipment damage multipliers
		if (user.equipment && user.equipment.damageOutputMultiplier) {
			power *= user.equipment.damageOutputMultiplier(user, target, this);
		}

		return Math.floor(power);
	}

	getEffectivePrecision(user: Character, _target: Character, battle: Battle): number {
		let precision = this.precision;

		// Environmental effects
		if (battle.state.terrain === 'ObscuringMist' && this.category === TechniqueCategory.Physical) {
			precision *= 0.8;
		} else if (battle.state.terrain === 'ObscuringMist' && this.affinity === Affinity.Illusion) {
			precision *= 1.2;
		}

		// Magic Perception bonus against illusions
		if (user.trait && user.trait.name === 'Magic Perception' && this.affinity === Affinity.Illusion) {
			precision *= 1.15;
		}

		return Math.min(1.0, precision);
	}
}
