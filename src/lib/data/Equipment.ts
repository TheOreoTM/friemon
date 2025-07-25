import { Equipment, Stats } from '../types/interfaces';
import { createEquipment } from '../character/Equipment';
import { Character } from '../character/Character';
import { Battle } from '../battle/Battle';
import { Technique } from '../character/Technique';

export const EQUIPMENT: { [key: string]: Equipment } = {
	staffOfJudgement: createEquipment({
		name: 'Staff of Judgement',
		description: 'Increases magical attack significantly.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				magicAttack: Math.floor(stats.magicAttack * 1.3)
			};
		}
	}),

	axeOfTheHero: createEquipment({
		name: 'Axe of the Hero',
		description: 'Increases physical attack and critical hit chance.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				attack: Math.floor(stats.attack * 1.2)
			};
		},
		critChanceBoost: 0.1
	}),

	elixirOfRestoration: createEquipment({
		name: 'Elixir of Restoration',
		description: 'Gradually restores HP and mana.',
		onTurnEnd: (holder: Character, _battle: Battle) => {
			holder.heal(Math.floor(holder.maxHP * 0.0625));
			holder.restoreMana(Math.floor(holder.maxMana * 0.05));
		}
	}),

	manaCrystal: createEquipment({
		name: 'Mana Crystal',
		description: 'Reduces mana cost of techniques and restores mana.',
		manaCostReduction: 3,
		onTurnEnd: (holder: Character, _battle: Battle) => {
			holder.restoreMana(5);
		}
	}),

	barrierRing: createEquipment({
		name: 'Barrier Ring',
		description: 'Increases defenses.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				defense: Math.floor(stats.defense * 1.15),
				magicDefense: Math.floor(stats.magicDefense * 1.15)
			};
		}
	}),

	swiftBoots: createEquipment({
		name: 'Swift Boots',
		description: 'Greatly increases speed.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				speed: Math.floor(stats.speed * 1.5)
			};
		}
	}),

	focusLens: createEquipment({
		name: 'Focus Lens',
		description: 'Increases damage when moving after the opponent.',
		damageOutputMultiplier: (_user: Character, _target: Character, _technique: Technique) => {
			// This would check if user moved second in the turn
			return 1.2;
		}
	}),

	lifeOrb: createEquipment({
		name: 'Life Orb',
		description: 'Increases damage but causes recoil.',
		damageOutputMultiplier: (_user: Character, _target: Character, _technique: Technique) => {
			return 1.3;
		},
		onTurnEnd: (holder: Character, _battle: Battle) => {
			// Recoil damage if attacked this turn
			if (holder.volatileEffects.lastDamage > 0) {
				holder.takeDamage(Math.floor(holder.maxHP * 0.1));
			}
		}
	}),

	scopeOfForesight: createEquipment({
		name: 'Scope of Foresight',
		description: 'Increases accuracy and critical hit rate.',
		critChanceBoost: 0.0625
	}),

	grimoire: createEquipment({
		name: 'Grimoire',
		description: 'Enhances magical techniques.',
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.properties.magicBased) {
				return 1.2;
			}
			return 1.0;
		}
	}),

	// === ADDITIONAL EQUIPMENT ===
	dragonScale: createEquipment({
		name: 'Dragon Scale',
		description: 'Reduces fire damage and boosts fire attacks.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				magicDefense: Math.floor(stats.magicDefense * 1.2)
			};
		},
		damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
			if (technique.affinity === 'Elemental_Fire') {
				return 1.25;
			}
			return 1.0;
		}
	}),

	spiritCloak: createEquipment({
		name: 'Spirit Cloak',
		description: 'Protects against status effects and boosts speed.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				speed: Math.floor(stats.speed * 1.3)
			};
		}
	}),

	titanGauntlets: createEquipment({
		name: 'Titan Gauntlets',
		description: 'Massively increases physical power.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				attack: Math.floor(stats.attack * 1.4)
			};
		}
	}),

	arcaneOrb: createEquipment({
		name: 'Arcane Orb',
		description: 'Reduces mana costs and boosts magical power.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				magicAttack: Math.floor(stats.magicAttack * 1.25)
			};
		},
		manaCostReduction: 5
	}),

	vampiricFangs: createEquipment({
		name: 'Vampiric Fangs',
		description: 'Heals user when dealing damage.',
		damageOutputMultiplier: (_user: Character, _target: Character, _technique: Technique) => {
			return 1.0;
		},
		onReceiveStrike: (holder: Character, _source: Character, _battle: Battle) => {
			holder.heal(Math.floor(holder.maxHP * 0.1));
		}
	}),

	phoenixFeather: createEquipment({
		name: 'Phoenix Feather',
		description: 'Grants resurrection and fire immunity.',
		onTurnEnd: (holder: Character, _battle: Battle) => {
			if (holder.isDefeated()) {
				holder.heal(Math.floor(holder.maxHP * 0.5));
			}
		}
	}),

	shadowMask: createEquipment({
		name: 'Shadow Mask',
		description: 'Increases critical hit rate and evasion.',
		critChanceBoost: 0.15,
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				speed: Math.floor(stats.speed * 1.1)
			};
		}
	}),

	runicArmor: createEquipment({
		name: 'Runic Armor',
		description: 'Provides balanced defensive bonuses.',
		statMultiplier: (_holder: Character, stats: Stats) => {
			return {
				...stats,
				defense: Math.floor(stats.defense * 1.2),
				magicDefense: Math.floor(stats.magicDefense * 1.2),
				hp: Math.floor(stats.hp * 1.1)
			};
		}
	})
};

export const getRandomEquipment = (): Equipment | null => {
	if (Math.random() < 0.7) return null; // 30% chance to have equipment
	const keys = Object.keys(EQUIPMENT);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return EQUIPMENT[randomKey];
};
