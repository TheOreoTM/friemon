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

export enum TechniqueEffectType {
	Condition = 'condition',
	StatBoost = 'stat_boost',
	Heal = 'heal',
	VolatileEffect = 'volatile_effect'
}

export enum EffectTarget {
	Self = 'self',
	Opponent = 'opponent',
	Party = 'party'
}

export enum VolatileEffectType {
	ManaShield = 'manaShield',
	LeechCurse = 'leechCurse',
	Tormented = 'tormented',
	Challenged = 'challenged',
	Channeling = 'channeling',
	Immaterial = 'immaterial',
	FocusedAura = 'focusedAura',
	MistyAura = 'mistyAura',
	Mimicry = 'mimicry',
	MagicSeal = 'magicSeal'
}
