import { Affinity, Race } from '../types/enums';

// Affinity effectiveness chart
// 2.0 = Super effective, 1.5 = Very effective, 0.5 = Not very effective, 0.25 = Barely effective, 1.0 = Normal
export const AFFINITY_CHART: { [key in Affinity]: { [key in Affinity]?: number } } = {
	// === ELEMENTAL INTERACTIONS ===
	[Affinity.Elemental_Fire]: {
		[Affinity.Elemental_Water]: 0.5,
		[Affinity.Elemental_Ice]: 2.0,
		[Affinity.Elemental_Wind]: 1.5,
		[Affinity.Elemental_Earth]: 0.5,
		[Affinity.Nature]: 2.0,
		[Affinity.Folk]: 1.5,
		[Affinity.Human_Magic]: 1.2
	},

	[Affinity.Elemental_Water]: {
		[Affinity.Elemental_Fire]: 2.0,
		[Affinity.Elemental_Earth]: 1.5,
		[Affinity.Elemental_Lightning]: 0.25,
		[Affinity.Elemental_Ice]: 0.5,
		[Affinity.Demon_Magic]: 1.2
	},

	[Affinity.Elemental_Earth]: {
		[Affinity.Elemental_Wind]: 0.5,
		[Affinity.Elemental_Water]: 0.5,
		[Affinity.Elemental_Lightning]: 2.0,
		[Affinity.Elemental_Fire]: 1.5,
		[Affinity.Physical]: 1.5,
		[Affinity.Nature]: 1.2
	},

	[Affinity.Elemental_Wind]: {
		[Affinity.Elemental_Earth]: 2.0,
		[Affinity.Elemental_Fire]: 0.5,
		[Affinity.Elemental_Lightning]: 1.5,
		[Affinity.Physical]: 1.5,
		[Affinity.Elven_Magic]: 1.2
	},

	[Affinity.Elemental_Ice]: {
		[Affinity.Elemental_Fire]: 0.5,
		[Affinity.Elemental_Water]: 1.5,
		[Affinity.Nature]: 2.0,
		[Affinity.Physical]: 1.5,
		[Affinity.Demon_Magic]: 1.2
	},

	[Affinity.Elemental_Lightning]: {
		[Affinity.Elemental_Water]: 2.0,
		[Affinity.Elemental_Earth]: 0.5,
		[Affinity.Elemental_Wind]: 0.5,
		[Affinity.Physical]: 2.0,
		[Affinity.Mana]: 1.5,
		[Affinity.Battle_Magic]: 1.2
	},

	// === COMBAT MAGIC ===
	[Affinity.Destruction]: {
		[Affinity.Defense]: 2.0,
		[Affinity.Illusion]: 1.5,
		[Affinity.Support]: 1.5,
		[Affinity.Physical]: 2.0,
		[Affinity.Folk]: 2.0,
		[Affinity.Ancient]: 0.5,
		[Affinity.Human_Magic]: 1.2
	},

	[Affinity.Binding]: {
		[Affinity.Physical]: 2.0,
		[Affinity.Transformation]: 2.0,
		[Affinity.Space]: 0.5,
		[Affinity.Elven_Magic]: 1.5,
		[Affinity.Battle_Magic]: 1.5,
		[Affinity.Human_Magic]: 0.5
	},

	[Affinity.Curse]: {
		[Affinity.Holy]: 0.25,
		[Affinity.Healing]: 0.5,
		[Affinity.Support]: 1.5,
		[Affinity.Nature]: 1.5,
		[Affinity.Demonic_Aura]: 1.5,
		[Affinity.Folk]: 2.0,
		[Affinity.Priest_Magic]: 0.5
	},

	[Affinity.Physical]: {
		[Affinity.Destruction]: 0.5,
		[Affinity.Binding]: 0.5,
		[Affinity.Elemental_Lightning]: 0.5,
		[Affinity.Illusion]: 2.0,
		[Affinity.Mana]: 0.25,
		[Affinity.Scholar_Magic]: 2.0,
		[Affinity.Ancient]: 0.5,
		[Affinity.Battle_Magic]: 0.5
	},

	// === UTILITY MAGIC ===
	[Affinity.Support]: {
		[Affinity.Destruction]: 0.5,
		[Affinity.Defense]: 1.5,
		[Affinity.Curse]: 0.5,
		[Affinity.Demonic_Aura]: 0.5,
		[Affinity.Human_Magic]: 1.2,
		[Affinity.Elven_Magic]: 1.2
	},

	[Affinity.Defense]: {
		[Affinity.Destruction]: 0.5,
		[Affinity.Support]: 0.5,
		[Affinity.Physical]: 1.5,
		[Affinity.Battle_Magic]: 0.5,
		[Affinity.Demon_Magic]: 1.2
	},

	[Affinity.Healing]: {
		[Affinity.Demonic_Aura]: 2.0,
		[Affinity.Curse]: 2.0,
		[Affinity.Destruction]: 0.5,
		[Affinity.Nature]: 1.5,
		[Affinity.Holy]: 1.5,
		[Affinity.Priest_Magic]: 1.2
	},

	[Affinity.Detection]: {
		[Affinity.Illusion]: 2.0,
		[Affinity.Transformation]: 2.0,
		[Affinity.Ancient]: 1.5,
		[Affinity.Scholar_Magic]: 1.5,
		[Affinity.Elven_Magic]: 1.2,
		[Affinity.Demon_Magic]: 1.5
	},

	[Affinity.Illusion]: {
		[Affinity.Detection]: 0.5,
		[Affinity.Physical]: 0.5,
		[Affinity.Support]: 0.5,
		[Affinity.Scholar_Magic]: 0.5,
		[Affinity.Ancient]: 0.5,
		[Affinity.Human_Magic]: 1.2,
		[Affinity.Elven_Magic]: 1.5
	},

	[Affinity.Transformation]: {
		[Affinity.Detection]: 0.5,
		[Affinity.Binding]: 0.5,
		[Affinity.Ancient]: 1.5,
		[Affinity.Nature]: 1.5,
		[Affinity.Demon_Magic]: 1.2
	},

	// === ADVANCED MAGIC ===
	[Affinity.Space]: {
		[Affinity.Binding]: 2.0,
		[Affinity.Physical]: 2.0,
		[Affinity.Ancient]: 0.5,
		[Affinity.Mana]: 1.5,
		[Affinity.Elven_Magic]: 1.2,
		[Affinity.Demon_Magic]: 1.5
	},

	[Affinity.Mana]: {
		[Affinity.Physical]: 2.0,
		[Affinity.Folk]: 2.0,
		[Affinity.Ancient]: 0.5,
		[Affinity.Elemental_Lightning]: 0.5,
		[Affinity.Scholar_Magic]: 1.5,
		[Affinity.Human_Magic]: 0.5
	},

	[Affinity.Ancient]: {
		[Affinity.Destruction]: 1.5,
		[Affinity.Folk]: 2.0,
		[Affinity.Scholar_Magic]: 2.0,
		[Affinity.Mana]: 1.5,
		[Affinity.Space]: 1.5,
		[Affinity.Transformation]: 0.5,
		[Affinity.Human_Magic]: 2.0,
		[Affinity.Elven_Magic]: 0.5
	},

	// === SPIRITUAL MAGIC ===
	[Affinity.Holy]: {
		[Affinity.Demonic_Aura]: 2.0,
		[Affinity.Curse]: 2.0,
		[Affinity.Ancient]: 0.5,
		[Affinity.Healing]: 0.5,
		[Affinity.Priest_Magic]: 1.5,
		[Affinity.Demon_Magic]: 2.0
	},

	[Affinity.Demonic_Aura]: {
		[Affinity.Holy]: 0.5,
		[Affinity.Healing]: 0.5,
		[Affinity.Support]: 1.5,
		[Affinity.Defense]: 1.5,
		[Affinity.Curse]: 0.5,
		[Affinity.Nature]: 1.5,
		[Affinity.Demon_Magic]: 1.5
	},

	[Affinity.Nature]: {
		[Affinity.Elemental_Fire]: 0.5,
		[Affinity.Elemental_Ice]: 0.5,
		[Affinity.Demonic_Aura]: 0.5,
		[Affinity.Curse]: 0.5,
		[Affinity.Healing]: 0.5,
		[Affinity.Transformation]: 0.5,
		[Affinity.Elven_Magic]: 1.5,
		[Affinity.Human_Magic]: 1.2
	},

	[Affinity.Folk]: {
		[Affinity.Ancient]: 0.25,
		[Affinity.Scholar_Magic]: 0.5,
		[Affinity.Destruction]: 0.5,
		[Affinity.Mana]: 0.5,
		[Affinity.Elemental_Fire]: 0.5,
		[Affinity.Human_Magic]: 1.5,
		[Affinity.Demon_Magic]: 0.5
	},

	// === HYBRID CATEGORIES ===
	[Affinity.Battle_Magic]: {
		[Affinity.Defense]: 1.5,
		[Affinity.Physical]: 0.5,
		[Affinity.Scholar_Magic]: 1.5,
		[Affinity.Support]: 1.5,
		[Affinity.Folk]: 2.0,
		[Affinity.Human_Magic]: 1.2,
		[Affinity.Demon_Magic]: 1.2
	},

	[Affinity.Scholar_Magic]: {
		[Affinity.Physical]: 0.5,
		[Affinity.Folk]: 2.0,
		[Affinity.Battle_Magic]: 0.5,
		[Affinity.Detection]: 0.5,
		[Affinity.Ancient]: 0.5,
		[Affinity.Illusion]: 1.5,
		[Affinity.Elven_Magic]: 1.2,
		[Affinity.Human_Magic]: 0.5
	},

	[Affinity.Priest_Magic]: {
		[Affinity.Demonic_Aura]: 1.5,
		[Affinity.Curse]: 1.5,
		[Affinity.Holy]: 0.5,
		[Affinity.Healing]: 0.5,
		[Affinity.Ancient]: 1.5,
		[Affinity.Demon_Magic]: 2.0,
		[Affinity.Human_Magic]: 1.2
	},

	[Affinity.Demon_Magic]: {
		[Affinity.Holy]: 0.25,
		[Affinity.Priest_Magic]: 0.5,
		[Affinity.Healing]: 0.5,
		[Affinity.Destruction]: 1.2,
		[Affinity.Curse]: 1.5,
		[Affinity.Battle_Magic]: 1.2,
		[Affinity.Human_Magic]: 1.5,
		[Affinity.Elven_Magic]: 1.2
	},

	[Affinity.Human_Magic]: {
		[Affinity.Folk]: 0.5,
		[Affinity.Ancient]: 0.5,
		[Affinity.Scholar_Magic]: 1.5,
		[Affinity.Support]: 0.5,
		[Affinity.Battle_Magic]: 0.5,
		[Affinity.Demon_Magic]: 0.5,
		[Affinity.Elven_Magic]: 0.8,
		[Affinity.Mana]: 1.5
	},

	[Affinity.Elven_Magic]: {
		[Affinity.Ancient]: 1.5,
		[Affinity.Nature]: 0.5,
		[Affinity.Binding]: 0.5,
		[Affinity.Illusion]: 0.5,
		[Affinity.Detection]: 0.5,
		[Affinity.Scholar_Magic]: 0.5,
		[Affinity.Human_Magic]: 1.2,
		[Affinity.Demon_Magic]: 0.8,
		[Affinity.Mana]: 1.2
	}
};

// Race-based affinity interactions
export const RACE_AFFINITY_BONUS: { [key in Race]: { [key in Affinity]?: number } } = {
	[Race.Human]: {
		[Affinity.Support]: 1.2,
		[Affinity.Folk]: 1.4,
		[Affinity.Human_Magic]: 1.5,
		[Affinity.Battle_Magic]: 1.1,
		[Affinity.Demonic_Aura]: 0.8,
		[Affinity.Ancient]: 0.7,
		[Affinity.Elven_Magic]: 0.6
	},

	[Race.Elf]: {
		[Affinity.Healing]: 1.3,
		[Affinity.Illusion]: 1.3,
		[Affinity.Ancient]: 1.5,
		[Affinity.Elven_Magic]: 1.6,
		[Affinity.Detection]: 1.3,
		[Affinity.Nature]: 1.4,
		[Affinity.Mana]: 1.3,
		[Affinity.Scholar_Magic]: 1.2,
		[Affinity.Physical]: 0.7,
		[Affinity.Human_Magic]: 0.8,
		[Affinity.Folk]: 0.6
	},

	[Race.Dwarf]: {
		[Affinity.Defense]: 1.5,
		[Affinity.Elemental_Earth]: 1.4,
		[Affinity.Physical]: 1.3,
		[Affinity.Battle_Magic]: 1.2,
		[Affinity.Illusion]: 0.6,
		[Affinity.Ancient]: 0.7,
		[Affinity.Elven_Magic]: 0.5,
		[Affinity.Scholar_Magic]: 0.8
	},

	[Race.Demon]: {
		[Affinity.Demonic_Aura]: 1.7,
		[Affinity.Demon_Magic]: 1.6,
		[Affinity.Destruction]: 1.4,
		[Affinity.Curse]: 1.5,
		[Affinity.Battle_Magic]: 1.3,
		[Affinity.Mana]: 1.2,
		[Affinity.Holy]: 0.2,
		[Affinity.Healing]: 0.3,
		[Affinity.Priest_Magic]: 0.1,
		[Affinity.Human_Magic]: 0.7
	},

	[Race.Monster]: {
		[Affinity.Physical]: 1.4,
		[Affinity.Elemental_Fire]: 1.2,
		[Affinity.Elemental_Water]: 1.2,
		[Affinity.Elemental_Earth]: 1.1,
		[Affinity.Nature]: 1.3,
		[Affinity.Battle_Magic]: 1.1,
		[Affinity.Scholar_Magic]: 0.6,
		[Affinity.Ancient]: 0.5,
		[Affinity.Human_Magic]: 0.8,
		[Affinity.Elven_Magic]: 0.7
	},
	[Race.Golem]: {
		[Affinity.Defense]: 1.6,
		[Affinity.Physical]: 1.4,
		[Affinity.Elemental_Earth]: 1.5,
		[Affinity.Battle_Magic]: 1.2,
		[Affinity.Healing]: 0.3,
		[Affinity.Illusion]: 0.4,
		[Affinity.Scholar_Magic]: 0.5,
		[Affinity.Ancient]: 0.6,
		[Affinity.Human_Magic]: 0.7,
		[Affinity.Elven_Magic]: 0.5
	},
	[Race.Spirit]: {
		[Affinity.Mana]: 1.5,
		[Affinity.Ancient]: 1.4,
		[Affinity.Illusion]: 1.3,
		[Affinity.Detection]: 1.3,
		[Affinity.Space]: 1.2,
		[Affinity.Transformation]: 1.2,
		[Affinity.Physical]: 0.5,
		[Affinity.Folk]: 0.6,
		[Affinity.Battle_Magic]: 0.7
	}
};

export function getAffinityAdvantage(attackingAffinity: Affinity, defendingAffinity: Affinity): number {
	const chart = AFFINITY_CHART[attackingAffinity];
	return chart?.[defendingAffinity] ?? 1.0;
}

export function getRaceAffinityBonus(techniqueAffinity: Affinity, userRaces: Race[]): number {
	let multiplier = 1.0;

	// Check each user race for affinity bonuses
	for (const race of userRaces) {
		const raceBonus = RACE_AFFINITY_BONUS[race];
		if (raceBonus && raceBonus[techniqueAffinity]) {
			multiplier *= raceBonus[techniqueAffinity]!;
		}
	}

	return multiplier;
}

export function getAdvantageText(advantage: number): string {
	if (advantage >= 2.0) {
		return "It's super effective!";
	} else if (advantage >= 1.5) {
		return "It's very effective!";
	} else if (advantage >= 1.2) {
		return "It's effective!";
	} else if (advantage <= 0.25) {
		return 'It barely affects the target...';
	} else if (advantage <= 0.5) {
		return "It's not very effective...";
	} else if (advantage < 1.0) {
		return "It's somewhat effective.";
	}
	return '';
}

// Helper function to calculate total damage multiplier
export function calculateTotalAffinityMultiplier(
	attackingAffinity: Affinity,
	defendingAffinities: Affinity[],
	attackerRaces: Race[],
	defenderRaces: Race[]
): { multiplier: number; message: string } {
	let totalMultiplier = 1.0;
	let bestAdvantage = 1.0;

	// Affinity vs Affinity interactions - take the best advantage
	for (const defendingAffinity of defendingAffinities) {
		const affinityAdvantage = getAffinityAdvantage(attackingAffinity, defendingAffinity);
		if (affinityAdvantage > bestAdvantage) {
			bestAdvantage = affinityAdvantage;
		}
	}

	totalMultiplier *= bestAdvantage;

	// Race bonuses for attacker (using technique better)
	const attackerBonus = getRaceAffinityBonus(attackingAffinity, attackerRaces);
	totalMultiplier *= attackerBonus;

	return {
		multiplier: totalMultiplier,
		message: getAdvantageText(totalMultiplier)
	};
}
