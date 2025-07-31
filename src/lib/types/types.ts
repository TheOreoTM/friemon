export type StatName = 'hp' | 'attack' | 'defense' | 'magicAttack' | 'magicDefense' | 'speed';
export type BoostableStat = 'attack' | 'defense' | 'magicAttack' | 'magicDefense' | 'speed';

export type HazardType = 'mana_traps' | 'spiritual_spikes' | 'illusory_terrain';

export const HazardNameMap: { [key in HazardType]: string } = {
	mana_traps: 'Mana Traps',
	spiritual_spikes: 'Spiritual Spikes',
	illusory_terrain: 'Illusory Terrain'
};

export type TechniqueProperty =
	| 'contact'
	| 'areaEffect'
	| 'concentration'
	| 'barrierBypassing'
	| 'magicBased'
	| 'physicalBased'
	| 'weaponBased'
	| 'dragonSlayer'
	| 'holyDamage'
	| 'armorPiercing'
	| 'slashing'
	| 'inspirational'
	| 'defensive'
	| 'enhancement'
	| 'darkMagic'
	| 'aura'
	| 'lifeDrain'
	| 'divine'
	| 'removesCurses'
	| 'antiMagic'
	| 'reliable'
	| 'elementalType'
	| 'summoning'
	| 'overwhelming'
	| 'movement'
	| 'physical'
	| 'empathy'
	| 'rapid'
	| 'theory'
	| 'evasion'
	| 'precisionTarget'
	| 'multiTarget'
	| 'allEnemyTarget';

export type TargetType = 'single' | 'chooseTarget' | 'multiTarget' | 'allEnemies' | 'self';

export type TeamPosition = 1 | 2 | 3 | 4;
