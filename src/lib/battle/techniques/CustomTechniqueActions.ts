import { TechniqueActionSystem, TechniqueActionFunction } from '../TechniqueActionSystem';

/**
 * Custom technique actions with detailed messages and effects
 */

// Speed Boost - Increases target's speed
const speedBoostAction: TechniqueActionFunction = ({ attacker, target, technique, messageCache, session }) => {
	const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
	const targetName = session.interface.formatCharacterWithPlayer(target, session);

	// Custom message for technique use
	messageCache.push(`✨ **${attackerName} casts ${technique.name}!**`);
	messageCache.push(`🌟 Magical energy swirls around ${targetName}, enhancing their agility!`);

	// Consume mana
	if (technique.manaCost > 0) {
		attacker.consumeMana(technique.manaCost);
		messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);
	}

	// Apply speed boost (30% increase)
	const speedBoost = Math.floor(target.getEffectiveStats().speed * 0.3);
	TechniqueActionSystem.adjustStat(target, 'Speed', speedBoost, messageCache, session);

	// Additional flavor message
	messageCache.push(`💨 ${targetName} feels incredibly swift and nimble!`);
};

// Ice Shard - Frieren's signature ice attack
const iceShardAction: TechniqueActionFunction = ({ attacker, target, technique, messageCache, session }) => {
	const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
	const targetName = session.interface.formatCharacterWithPlayer(target, session);

	// Dramatic technique use message
	messageCache.push(`❄️ **${attackerName} extends her hand, gathering frigid magical energy...**`);
	messageCache.push(`🧊 Sharp crystalline shards form in the air, gleaming with deadly cold!`);

	// Consume mana
	attacker.consumeMana(technique.manaCost);
	messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);

	// Calculate enhanced damage (Frieren's ancient magic mastery)
	const stats = attacker.getEffectiveStats();
	let damage = Math.floor((stats.magicAttack - target.getEffectiveStats().magicDefense) * 1.2);
	
	// Add variance
	damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
	damage = Math.max(1, damage);

	// Apply damage
	const oldHP = target.currentHP;
	target.takeDamage(damage);
	
	messageCache.push(`❄️ **The ice shards pierce through ${targetName} with chilling precision!**`);
	messageCache.pushDamage(attackerName, targetName, damage, target.currentHP);

	// Chance for freeze effect
	if (Math.random() < 0.2) {
		messageCache.push(`🧊 **${targetName} is frozen solid, unable to move!**`);
		// TODO: Apply freeze status effect
	}

	// Check for defeat
	if (target.currentHP <= 0 && oldHP > 0) {
		messageCache.push(`💀 **${targetName} collapses, defeated by the ancient ice magic!**`);
	}
};

// Warrior's Strike - Stark's powerful physical attack
const warriorsStrikeAction: TechniqueActionFunction = ({ attacker, target, messageCache, session }) => {
	const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
	const targetName = session.interface.formatCharacterWithPlayer(target, session);

	// Epic attack sequence
	messageCache.push(`⚔️ **${attackerName} grips his axe with both hands, muscles tensing!**`);
	messageCache.push(`🔥 Battle fury ignites in his eyes as he prepares to strike!`);

	// No mana cost for physical techniques
	
	// Calculate damage with potential critical hit
	const stats = attacker.getEffectiveStats();
	let damage = Math.floor(stats.attack - target.getEffectiveStats().defense);
	
	// Check for critical hit (15% chance)
	const isCritical = Math.random() < 0.15;
	if (isCritical) {
		damage = Math.floor(damage * 1.8);
		messageCache.push(`💥 **CRITICAL HIT!** ${attackerName}'s strike finds a perfect opening!`);
	}

	// Apply warrior's resolve if low HP
	if (attacker.currentHP < attacker.maxHP * 0.4) {
		damage = Math.floor(damage * 1.2);
		messageCache.push(`🔥 **Warrior's Resolve!** ${attackerName} fights harder when cornered!`);
	}

	damage = Math.max(1, damage);

	// Apply damage with dramatic description
	const oldHP = target.currentHP;
	target.takeDamage(damage);
	
	if (isCritical) {
		messageCache.push(`⚔️ **${attackerName}'s axe cleaves through ${targetName} with devastating force!**`);
	} else {
		messageCache.push(`⚔️ **${attackerName} delivers a powerful strike to ${targetName}!**`);
	}
	
	messageCache.pushDamage(attackerName, targetName, damage, target.currentHP);

	// Check for defeat
	if (target.currentHP <= 0 && oldHP > 0) {
		messageCache.push(`💀 **${targetName} falls before the warrior's might!**`);
	}
};

// Healing Light - Restoration magic
const healingLightAction: TechniqueActionFunction = ({ attacker, target, technique, messageCache, session }) => {
	const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
	const targetName = session.interface.formatCharacterWithPlayer(target, session);

	// Healing sequence
	messageCache.push(`✨ **${attackerName} raises their hands, channeling divine energy!**`);
	messageCache.push(`🌟 Warm, golden light surrounds ${targetName}!`);

	// Consume mana
	attacker.consumeMana(technique.manaCost);
	messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);

	// Calculate healing
	const healingPower = Math.floor(attacker.getEffectiveStats().magicAttack * 0.6);
	const actualHealing = Math.min(healingPower, target.maxHP - target.currentHP);
	
	if (actualHealing > 0) {
		target.currentHP += actualHealing;
		messageCache.push(`💚 **The divine light mends ${targetName}'s wounds!**`);
		messageCache.pushHealing(targetName, actualHealing, target.currentHP);
	} else {
		messageCache.push(`💚 **${targetName} is already at full health!**`);
	}

	// Chance to also restore mana
	if (Math.random() < 0.3) {
		const manaRestored = Math.floor(target.maxMana * 0.1);
		target.restoreMana(manaRestored);
		messageCache.push(`💙 **The healing energy also restores ${targetName}'s magical power!**`);
		messageCache.pushManaChange(targetName, manaRestored, target.currentMana);
	}
};

// Mana Drain - Absorb opponent's mana
const manaDrainAction: TechniqueActionFunction = ({ attacker, target, technique, messageCache, session }) => {
	const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
	const targetName = session.interface.formatCharacterWithPlayer(target, session);

	// Dramatic drain sequence
	messageCache.push(`🌀 **${attackerName} extends dark tendrils of energy toward ${targetName}!**`);
	messageCache.push(`💜 The shadowy magic seeks to drain magical essence!`);

	// Consume mana for the technique
	attacker.consumeMana(technique.manaCost);
	messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);

	// Calculate mana drain
	const drainAmount = Math.min(30, target.currentMana);
	
	if (drainAmount > 0) {
		// Drain from target
		target.currentMana -= drainAmount;
		messageCache.push(`💜 **Dark energy siphons ${targetName}'s magical power!**`);
		messageCache.pushManaChange(targetName, -drainAmount, target.currentMana);

		// Restore to attacker (partial)
		const restored = Math.floor(drainAmount * 0.7);
		attacker.restoreMana(restored);
		messageCache.push(`🌀 **${attackerName} absorbs the stolen magical energy!**`);
		messageCache.pushManaChange(attackerName, restored, attacker.currentMana);
	} else {
		messageCache.push(`💜 **${targetName} has no magical energy left to drain!**`);
	}
};

// Register all custom technique actions
export function registerCustomTechniqueActions(): void {
	TechniqueActionSystem.registerCustomAction('Speed Boost', {
		name: 'Speed Boost',
		description: 'Enhances the target\'s agility with magical energy',
		actionFunction: speedBoostAction
	});

	TechniqueActionSystem.registerCustomAction('Ice Shard', {
		name: 'Ice Shard',
		description: 'Frieren\'s signature ice magic attack',
		actionFunction: iceShardAction
	});

	TechniqueActionSystem.registerCustomAction('Warrior\'s Strike', {
		name: 'Warrior\'s Strike',
		description: 'Stark\'s powerful axe attack',
		actionFunction: warriorsStrikeAction
	});

	TechniqueActionSystem.registerCustomAction('Healing Light', {
		name: 'Healing Light',
		description: 'Restores HP with divine magic',
		actionFunction: healingLightAction
	});

	TechniqueActionSystem.registerCustomAction('Mana Drain', {
		name: 'Mana Drain',
		description: 'Absorbs the opponent\'s magical energy',
		actionFunction: manaDrainAction
	});

	console.log('Custom technique actions registered successfully!');
}