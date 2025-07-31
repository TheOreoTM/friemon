import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { SHADOW_BLAST, LIFE_DRAIN, DEMONIC_AURA, GRAUSAMKEIT } from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect, createConditionEffect } from '../character/TechniqueEffect';
import type { Battle } from '../battle/Battle';

// Aura-specific interface that extends Character with additional metadata
interface AuraCharacter extends Character {
	armyStrength: number;
	demonLordAuthority: boolean;
}

// Aura's unique techniques
const UNDEAD_ARMY = new Technique({
	name: 'Undead Army',
	description: 'Summon undead soldiers to fight alongside you',
	affinity: Affinity.Support,
	category: TechniqueCategory.Magical,
	power: 40,
	precision: 1.0,
	manaCost: 30,
	initiative: 0,
	effects: [createStatBoostEffect('attack', 1, 1.0, EffectTarget.Self)],
	properties: { magicBased: true, darkMagic: true, summoning: true }
});

const SCALES_OF_OBEDIENCE = new Technique({
	name: 'Scales of Obedience',
	description: 'Overwhelm the opponent with superior mana, forcing submission',
	affinity: Affinity.Support,
	category: TechniqueCategory.Magical,
	power: 30,
	precision: 0.8,
	manaCost: 25,
	initiative: 1,
	effects: [createConditionEffect(CombatCondition.Exhausted, 0.9, EffectTarget.Opponent)],
	properties: { magicBased: true, darkMagic: true, overwhelming: true }
});

const auraStats = {
	hp: 70,
	attack: 55,
	defense: 65,
	magicAttack: 105,
	magicDefense: 75,
	speed: 75
}; // Total: 445

const auraAbility: Ability = {
	abilityName: 'Until the End of Time',
	abilityEffectString: `Aura controls an undead army. 50% of damage targeted towards her is transferred to the army instead. Start with 60 Army Strength. At end of turn, lose soldiers if Army Strength drops too low.`,

	subAbilities: [
		{
			name: "Demon Lord's Authority",
			description: 'Immunity to fear and charm effects. Other demons deal reduced damage.'
		},
		{
			name: 'Undead Commander',
			description: 'Summon and control undead minions to absorb damage.'
		}
	],

	abilityStartOfTurnEffect: (character: Character, battle: Battle) => {
		const auraChar = character as AuraCharacter;
		// Initialize army on first turn
		if (battle.state.turn === 1) {
			auraChar.armyStrength = 60;
			battle.addToBattleLog(`${character.name} raises her undead army!`);
		}
	},

	abilityOnDamageReceived: (character: Character, battle: Battle, damage: number) => {
		const auraChar = character as AuraCharacter;
		// Army absorbs 50% of damage
		const armyStrength = auraChar.armyStrength || 0;
		if (armyStrength > 0) {
			const absorbedDamage = Math.floor(damage * 0.5);
			auraChar.armyStrength = Math.max(0, armyStrength - absorbedDamage);
			battle.addToBattleLog(`${character.name}'s army absorbs ${absorbedDamage} damage!`);
			return damage - absorbedDamage; // Return reduced damage
		}
		return damage;
	},

	abilityEndOfTurnEffect: (character: Character, battle: Battle) => {
		const auraChar = character as AuraCharacter;
		// Army maintenance - lose soldiers if strength is too low
		const armyStrength = auraChar.armyStrength || 0;
		if (armyStrength < 20 && armyStrength > 0) {
			auraChar.armyStrength = Math.max(0, armyStrength - 5);
			battle.addToBattleLog(`${character.name}'s army weakens as soldiers fall!`);
		}
	},

	preventCondition: (_character: Character, condition: CombatCondition) => {
		// Demon lord immunity
		if (condition === CombatCondition.Fear || condition === CombatCondition.Charmed) {
			return true; // Complete immunity
		}
		return false;
	},

	damageInputMultiplier: (_user: Character, target: Character, _technique: Technique) => {
		// Reduced damage from other demons
		if (target.races?.includes(Race.Demon)) {
			return 0.7; // 30% damage reduction
		}
		return 1.0;
	}
};

const Aura = new CharacterData({
	characterName: CharacterName.Aura,
	cosmetic: {
		emoji: CharacterEmoji.AURA,
		color: 0xcb83b8,
		description: 'A powerful demon who commands vast armies of the undead. One of the Seven Sages of Destruction with overwhelming magical power.'
	},
	level: 60,
	races: [Race.Demon],
	baseStats: auraStats,
	techniques: [UNDEAD_ARMY, SCALES_OF_OBEDIENCE, SHADOW_BLAST, LIFE_DRAIN, DEMONIC_AURA, GRAUSAMKEIT],
	ability: auraAbility,
	additionalMetadata: {
		armyStrength: 0,
		demonLordAuthority: true
	}
});

export default Aura;
