import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { SORGANEIL, SPEED_BOOST, MANA_SHIELD, DEFENSIVE_MAGIC } from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';
import type { Battle } from '../battle/Battle';

// Fern's unique techniques
const QUICK_ZOLTRAAK = new Technique({
	name: 'Quick Zoltraak',
	description: 'A rapid-fire version of the basic offensive spell',
	affinity: Affinity.Destruction,
	category: TechniqueCategory.Magical,
	power: 65,
	precision: 0.98,
	manaCost: 12,
	initiative: 1,
	effects: [],
	properties: { magicBased: true, rapid: true },
	onUsed: ({ user, target, messageCache, session }) => {
		const userName = session.interface.formatCharacterWithPlayer(user, session);
		const targetName = session.interface.formatCharacterWithPlayer(target!, session);

		// Dramatic technique sequence
		messageCache.push(`⚡ **${userName} raises her hand with practiced precision!**`);
		messageCache.push(`🔥 Magical energy crackles as she prepares to cast!`);

		// Consume mana
		user.consumeMana(12);
		messageCache.pushManaChange(userName, -12, user.currentMana);

		// Calculate enhanced damage (rapid technique bonus)
		const stats = user.getEffectiveStats();
		const targetStats = target!.getEffectiveStats();
		let damage = Math.floor(stats.magicAttack - targetStats.magicDefense);
		
		// Rapid technique bonus (20% extra damage from ability)
		damage = Math.floor(damage * 1.2);
		
		// Apply technique power
		damage = Math.floor(damage * 0.65);
		
		// Add variance
		damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
		damage = Math.max(1, damage);

		// Apply damage with dramatic description
		const oldHP = target!.currentHP;
		target!.takeDamage(damage);
		
		messageCache.push(`⚡ **"Zoltraak!" ${userName} unleashes rapid magical projectiles!**`);
		messageCache.pushDamage(userName, targetName, damage, target!.currentHP);

		// Check for defeat
		if (target!.currentHP <= 0 && oldHP > 0) {
			messageCache.push(`💀 **${targetName} falls to Fern's precise magical assault!**`);
		}

		// Prodigious Talent - chance to recover mana
		if (Math.random() < 0.3) {
			const manaRecovered = Math.floor(user.maxMana * 0.08);
			user.restoreMana(manaRecovered);
			messageCache.push(`✨ **Fern's Prodigious Talent**: Her natural magical control recovers ${manaRecovered} MP!`);
		}
	}
});

const MANA_CONTROL = new Technique({
	name: 'Mana Control',
	description: 'Precise mana manipulation for efficient spellcasting',
	affinity: Affinity.Support,
	category: TechniqueCategory.Support,
	power: 0,
	precision: 1.0,
	manaCost: 8,
	initiative: 0,
	effects: [createStatBoostEffect('magicAttack', 1, 1.0, EffectTarget.Self)],
	properties: { magicBased: true },
	onUsed: ({ user, messageCache, session }) => {
		const userName = session.interface.formatCharacterWithPlayer(user, session);

		// Support technique sequence
		messageCache.push(`🌟 **${userName} closes her eyes, focusing deeply on her magical flow!**`);
		messageCache.push(`💫 Mana streams become visible around her as she refines her control!`);

		// Consume mana
		user.consumeMana(8);
		messageCache.pushManaChange(userName, -8, user.currentMana);

		// Restore more mana than consumed (net positive)
		const manaRestored = Math.floor(user.maxMana * 0.15); // 15% of max mana
		user.restoreMana(manaRestored);
		messageCache.push(`💙 **${userName}'s precise control channels ambient mana!**`);
		messageCache.pushManaChange(userName, manaRestored, user.currentMana);

		// Boost magic attack temporarily (this would need a stat boost system)
		messageCache.push(`✨ **${userName}'s magical precision increases significantly!**`);
		messageCache.push(`🔮 **${userName}'s next magical techniques will be more powerful!**`);

		// Prodigious Talent passive check
		if (Math.random() < 0.4) { // Higher chance for support spells
			const bonusMana = Math.floor(user.maxMana * 0.05);
			user.restoreMana(bonusMana);
			messageCache.push(`✨ **Fern's Prodigious Talent**: Her natural efficiency grants ${bonusMana} bonus MP!`);
		}
	}
});

const fernStats = {
	hp: 70,
	attack: 50,
	defense: 55,
	magicAttack: 90,
	magicDefense: 70,
	speed: 80
}; // Total: 415

const fernAbility: Ability = {
	abilityName: 'Prodigious Talent',
	abilityEffectString: `Natural magical talent allows for rapid improvement and efficient spellcasting. Restore mana equal to 8% of max mana each turn. Fast magical techniques deal 20% more damage.`,

	subAbilities: [
		{
			name: 'Mana Suppression',
			description: 'Hide the amount of HP this character has.'
		},
		{
			name: 'Keen Eye',
			description: "See past the opponent's Mana Suppression."
		}
	],

	abilityEndOfTurnEffect: (character: Character, battle: Battle) => {
		// Restore mana each turn
		const manaRestore = Math.floor(character.maxMana * 0.08);
		character.restoreMana(manaRestore);
		if (manaRestore > 0) {
			battle.addToBattleLog(`${character.name}'s talent restores ${manaRestore} mana!`);
		}
	},

	damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
		// Bonus for fast magical techniques
		if (technique.properties?.magicBased && technique.initiative >= 0) {
			return 1.2; // 20% bonus for fast magical techniques
		}
		return 1.0;
	},

	preventCondition: (_character: Character, condition: CombatCondition) => {
		// Training provides resistance to magic seal
		if (condition === CombatCondition.MagicSeal) {
			return Math.random() < 0.4; // 40% chance to resist magic seal
		}
		return false;
	}
};

const Fern = new CharacterData({
	characterName: CharacterName.Fern,
	cosmetic: {
		emoji: CharacterEmoji.FERN,
		color: 0x9b59b6,
		description: "Frieren's human apprentice. A prodigious young mage with exceptional talent and rapid spellcasting abilities."
	},
	level: 35,
	races: [Race.Human],
	baseStats: fernStats,
	techniques: [QUICK_ZOLTRAAK, SPEED_BOOST, MANA_CONTROL, MANA_SHIELD, SORGANEIL, DEFENSIVE_MAGIC],
	ability: fernAbility,
	additionalMetadata: {
		manaSuppressed: true,
		ignoreManaSuppressed: true
	}
});

export default Fern;
