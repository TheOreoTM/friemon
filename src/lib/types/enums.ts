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
	// === ELEMENTAL MAGIC ===
	Elemental_Fire = 'Elemental_Fire',
	Elemental_Water = 'Elemental_Water',
	Elemental_Earth = 'Elemental_Earth',
	Elemental_Wind = 'Elemental_Wind',
	Elemental_Ice = 'Elemental_Ice',
	Elemental_Lightning = 'Elemental_Lightning',

	// === COMBAT MAGIC ===
	Destruction = 'Destruction',
	Binding = 'Binding',
	Curse = 'Curse',
	Physical = 'Physical',

	// === UTILITY MAGIC ===
	Support = 'Support',
	Defense = 'Defense',
	Healing = 'Healing',
	Detection = 'Detection',
	Illusion = 'Illusion',
	Transformation = 'Transformation',

	// === ADVANCED MAGIC ===
	Space = 'Space',
	Mana = 'Mana',
	Ancient = 'Ancient',

	// === SPIRITUAL MAGIC ===
	Holy = 'Holy',
	Demonic_Aura = 'Demonic_Aura',
	Nature = 'Nature',
	Folk = 'Folk',

	// === HYBRID CATEGORIES ===
	Battle_Magic = 'Battle_Magic',
	Scholar_Magic = 'Scholar_Magic',
	Priest_Magic = 'Priest_Magic',
	Demon_Magic = 'Demon_Magic',
	Human_Magic = 'Human_Magic',
	Elven_Magic = 'Elven_Magic'
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
