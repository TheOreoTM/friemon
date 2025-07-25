export enum Race {
	Human = 'Human',
	Elf = 'Elf',
	Dwarf = 'Dwarf',
	Demon = 'Demon',
	Monster = 'Monster',
	Golem = 'Golem',
	Spirit = 'Spirit'
}

export enum Affinity {
	Destruction = 'Destruction',
	Support = 'Support',
	Defense = 'Defense',
	Healing = 'Healing',
	Illusion = 'Illusion',
	Elemental_Fire = 'Elemental_Fire',
	Elemental_Water = 'Elemental_Water',
	Elemental_Wind = 'Elemental_Wind',
	Elemental_Earth = 'Elemental_Earth',
	Demonic_Aura = 'Demonic_Aura'
}

export enum TechniqueCategory {
	Physical = 'Physical',
	Magical = 'Magical',
	Support = 'Support'
}

export enum CombatCondition {
	Normal = 'Normal',
	Exhausted = 'Exhausted', // Burn/Poison
	Stunned = 'Stunned', // Paralysis/Freeze
	Confused = 'Confused',
	Frenzied = 'Frenzied', // Confusion/Infatuation
	Charmed = 'Charmed',
	Dazed = 'Dazed', // Flinch
	Fear = 'Fear', // New custom condition
	MagicSeal = 'MagicSeal' // New custom condition
}

export enum AmbientMagicCondition {
	None = 'None',
	DenseMana = 'DenseMana',
	ChaosSurge = 'ChaosSurge',
	ArcaneStorm = 'ArcaneStorm',
	NullField = 'NullField'
}

export enum TerrainType {
	Normal = 'Normal',
	ForestCanopy = 'ForestCanopy',
	ObscuringMist = 'ObscuringMist',
	AncientRuins = 'AncientRuins',
	DemonicGround = 'DemonicGround'
}

export enum AIMindset {
	Random = 'Random',
	Aggressive = 'Aggressive',
	Defensive = 'Defensive',
	Balanced = 'Balanced',
	Strategic = 'Strategic',
	Masterful = 'Masterful'
}
