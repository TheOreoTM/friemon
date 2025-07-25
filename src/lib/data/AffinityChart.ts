import { Affinity, Race } from '../types/enums';

// Affinity effectiveness chart
// 2.0 = Super effective, 0.5 = Not very effective, 1.0 = Normal
export const AFFINITY_CHART: { [key in Affinity]: { [key in Affinity]?: number } } = {
  [Affinity.Destruction]: {
    [Affinity.Defense]: 0.5,
    [Affinity.Illusion]: 2.0,
    [Affinity.Support]: 1.5
  },
  [Affinity.Support]: {
    [Affinity.Destruction]: 0.5,
    [Affinity.Defense]: 2.0
  },
  [Affinity.Defense]: {
    [Affinity.Destruction]: 2.0,
    [Affinity.Support]: 0.5
  },
  [Affinity.Healing]: {
    [Affinity.Demonic_Aura]: 2.0,
    [Affinity.Destruction]: 0.5
  },
  [Affinity.Illusion]: {
    [Affinity.Support]: 2.0,
    [Affinity.Destruction]: 0.5
  },
  [Affinity.Elemental_Fire]: {
    [Affinity.Elemental_Water]: 0.5,
    [Affinity.Elemental_Wind]: 2.0,
    [Affinity.Elemental_Earth]: 1.5
  },
  [Affinity.Elemental_Water]: {
    [Affinity.Elemental_Fire]: 2.0,
    [Affinity.Elemental_Earth]: 0.5
  },
  [Affinity.Elemental_Wind]: {
    [Affinity.Elemental_Earth]: 2.0,
    [Affinity.Elemental_Fire]: 0.5
  },
  [Affinity.Elemental_Earth]: {
    [Affinity.Elemental_Wind]: 0.5,
    [Affinity.Elemental_Water]: 2.0
  },
  [Affinity.Demonic_Aura]: {
    [Affinity.Healing]: 0.5,
    [Affinity.Support]: 2.0,
    [Affinity.Defense]: 1.5
  }
};

// Race-based affinity interactions
export const RACE_AFFINITY_BONUS: { [key in Race]: { [key in Affinity]?: number } } = {
  [Race.Human]: {
    [Affinity.Support]: 1.2,
    [Affinity.Demonic_Aura]: 0.8
  },
  [Race.Elf]: {
    [Affinity.Healing]: 1.3,
    [Affinity.Illusion]: 1.2,
    [Affinity.Destruction]: 1.1
  },
  [Race.Dwarf]: {
    [Affinity.Defense]: 1.3,
    [Affinity.Elemental_Earth]: 1.2,
    [Affinity.Illusion]: 0.8
  },
  [Race.Demon]: {
    [Affinity.Demonic_Aura]: 1.5,
    [Affinity.Destruction]: 1.2,
    [Affinity.Healing]: 0.5
  },
  [Race.Monster]: {
    [Affinity.Elemental_Fire]: 1.1,
    [Affinity.Elemental_Water]: 1.1,
    [Affinity.Support]: 0.9
  },
  [Race.Golem]: {
    [Affinity.Defense]: 1.5,
    [Affinity.Elemental_Earth]: 1.3,
    [Affinity.Elemental_Water]: 0.7
  },
  [Race.Spirit]: {
    [Affinity.Illusion]: 1.4,
    [Affinity.Support]: 1.2,
    [Affinity.Destruction]: 0.8
  }
};

export function getAffinityAdvantage(techniqueAffinity: Affinity, targetRaces: Race[]): number {
  let multiplier = 1.0;
  
  // Check each target race for affinity interactions
  for (const race of targetRaces) {
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
  } else if (advantage <= 0.5) {
    return "It's not very effective...";
  } else if (advantage < 1.0) {
    return "It's somewhat effective.";
  }
  return "It's effective.";
}