import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, CombatCondition, EffectTarget } from '../types/enums';
import { createConditionEffect, createStatBoostEffect, createHealEffect } from '../character/TechniqueEffect';

// ============== BASIC TECHNIQUES ==============

export const ZOLTRAAK = new Technique({
    name: 'Zoltraak',
    description: 'Basic offensive spell - fires piercing magic projectiles',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 70,
    precision: 0.95,
    manaCost: 15,
    initiative: 0,
    effects: [],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);

        // Classic Zoltraak casting
        messageCache.push(`⚡ **${userName} extends their hand, magical energy gathering!**`);
        messageCache.push(`🔮 "Zoltraak!" The basic offensive spell takes shape!`);

        // Consume mana
        user.consumeMana(15);
        messageCache.pushManaChange(userName, -15, user.currentMana);

        // Calculate damage
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor(stats.magicAttack - targetStats.magicDefense);
        
        // Apply technique power
        damage = Math.floor(damage * 0.7);
        
        // Add variance
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);

        // Apply damage
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        
        messageCache.push(`💫 **Piercing magical projectiles streak toward ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);

        // Check for defeat
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} falls to the fundamental offensive magic!**`);
        }
    }
});

export const HEALING_MAGIC = new Technique({
    name: 'Healing Magic',
    description: 'Restore HP using healing magic',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 1,
    effects: [
        createHealEffect(40, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = target ? session.interface.formatCharacterWithPlayer(target, session) : userName;

        // Healing sequence
        messageCache.push(`✨ **${userName} extends their hands, channeling restorative magic!**`);
        messageCache.push(`🌟 Warm, golden light envelops ${targetName}!`);

        // Consume mana
        user.consumeMana(20);
        messageCache.pushManaChange(userName, -20, user.currentMana);

        // Calculate healing
        const healingPower = Math.floor(user.getEffectiveStats().magicAttack * 0.6);
        const targetToHeal = target || user;
        const actualHealing = Math.min(healingPower, targetToHeal.maxHP - targetToHeal.currentHP);
        
        if (actualHealing > 0) {
            targetToHeal.currentHP += actualHealing;
            messageCache.push(`💚 **The divine light mends ${targetName}'s wounds!**`);
            messageCache.pushHealing(targetName, actualHealing, targetToHeal.currentHP);
        } else {
            messageCache.push(`💚 **${targetName} is already at full health!**`);
        }

        // Chance for bonus effect
        if (Math.random() < 0.2) {
            const bonusHealing = Math.floor(healingPower * 0.3);
            if (targetToHeal.currentHP + bonusHealing <= targetToHeal.maxHP) {
                targetToHeal.currentHP += bonusHealing;
                messageCache.push(`🌟 **The healing magic resonates, providing ${bonusHealing} additional restoration!**`);
            }
        }
    }
});

export const MANA_SHIELD = new Technique({
    name: 'Mana Shield',
    description: 'Creates a magical barrier that absorbs damage',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 18,
    initiative: 2,
    effects: [
        createStatBoostEffect('magicDefense', 3, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`🛡️ **${userName} weaves protective magic around themselves!**`);
        user.consumeMana(18);
        messageCache.pushManaChange(userName, -18, user.currentMana);
        messageCache.push(`✨ **A shimmering mana barrier surrounds ${userName}!**`);
    }
});

export const DEFENSIVE_MAGIC = new Technique({
    name: 'Defensive Magic',
    description: 'General defensive enchantment',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 16,
    initiative: 1,
    effects: [
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`⛨ **${userName} channels defensive enchantments!**`);
        user.consumeMana(16);
        messageCache.pushManaChange(userName, -16, user.currentMana);
        messageCache.push(`🔰 **${userName}'s defenses are magically reinforced!**`);
    }
});

// ============== BINDING TECHNIQUES ==============

export const SORGANEIL = new Technique({
    name: 'Sorganeil',
    description: 'Binding magic that restricts the opponent\'s movement',
    affinity: Affinity.Support,
    category: TechniqueCategory.Magical,
    power: 25,
    precision: 0.85,
    manaCost: 25,
    initiative: 0,
    effects: [
        createConditionEffect(CombatCondition.Stunned, 0.6, EffectTarget.Opponent)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🕸️ **${userName} extends their hand toward ${targetName}!**`);
        messageCache.push(`⛓️ "Sorganeil!" Binding magic weaves through the air!`);
        user.consumeMana(25);
        messageCache.pushManaChange(userName, -25, user.currentMana);
        messageCache.push(`🔒 **Magical restraints attempt to bind ${targetName}!**`);
    }
});

export const BINDING_SPELL = new Technique({
    name: 'Binding Spell',
    description: 'Magical restraints that slow the enemy',
    affinity: Affinity.Support,
    category: TechniqueCategory.Magical,
    power: 15,
    precision: 0.9,
    manaCost: 20,
    initiative: 1,
    effects: [
        createStatBoostEffect('speed', -2, 0.8, EffectTarget.Opponent)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🌀 **${userName} weaves restraining magic!**`);
        user.consumeMana(20);
        messageCache.pushManaChange(userName, -20, user.currentMana);
        messageCache.push(`⛓️ **Magical bindings attempt to slow ${targetName}!**`);
    }
});

// ============== ADVANCED DESTRUCTION MAGIC ==============

export const JUDRADJIM = new Technique({
    name: 'Judradjim',
    description: 'Lightning magic that strikes with electric fury',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 95,
    precision: 0.88,
    manaCost: 35,
    initiative: -1,
    effects: [
        createConditionEffect(CombatCondition.Stunned, 0.3, EffectTarget.Opponent)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`⚡ **${userName} raises both hands as electricity crackles!**`);
        messageCache.push(`🌩️ "Judradjim!" Lightning magic surges forth!`);
        user.consumeMana(35);
        messageCache.pushManaChange(userName, -35, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.magicAttack - targetStats.magicDefense) * 0.95);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`⚡ **Bolts of lightning strike ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} is overwhelmed by the electric assault!**`);
        }
    }
});

export const VOLLZANBEL = new Technique({
    name: 'Vollzanbel',
    description: 'Explosive fire magic that deals massive damage',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 110,
    precision: 0.82,
    manaCost: 45,
    initiative: -2,
    effects: [],
    properties: { magicBased: true, areaEffect: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🔥 **${userName} gathers immense magical energy!**`);
        messageCache.push(`🌋 "Vollzanbel!" Explosive fire magic takes form!`);
        user.consumeMana(45);
        messageCache.pushManaChange(userName, -45, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.magicAttack - targetStats.magicDefense) * 1.1);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`💥 **A massive explosion engulfs ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} is consumed by the fiery explosion!**`);
        }
    }
});

export const GRAUSAMKEIT = new Technique({
    name: 'Grausamkeit',
    description: 'Cruel magic that tears through defenses',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 85,
    precision: 0.9,
    manaCost: 30,
    initiative: 0,
    effects: [],
    properties: { magicBased: true, armorPiercing: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🔪 **${userName} channels cruel, piercing magic!**`);
        messageCache.push(`⚔️ "Grausamkeit!" Dark energy tears through the air!`);
        user.consumeMana(30);
        messageCache.pushManaChange(userName, -30, user.currentMana);
        const stats = user.getEffectiveStats();
        let damage = Math.floor(stats.magicAttack * 0.85);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`🧨 **Cruel magic pierces through ${targetName}'s defenses!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} falls to the merciless assault!**`);
        }
    }
});

// ============== ANALYSIS AND DETECTION ==============

export const ANALYSIS = new Technique({
    name: 'Analysis',
    description: 'Study the opponent to gain tactical advantage',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 12,
    initiative: 2,
    effects: [
        createStatBoostEffect('magicAttack', 1, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🔍 **${userName} carefully observes ${targetName}!**`);
        user.consumeMana(12);
        messageCache.pushManaChange(userName, -12, user.currentMana);
        messageCache.push(`🧠 **${userName} analyzes ${targetName}'s weaknesses!**`);
        messageCache.push(`✨ **${userName}'s magical precision increases!**`);
    }
});

export const DETECT_MAGIC = new Technique({
    name: 'Detect Magic',
    description: 'Sense magical auras and hidden spells',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 10,
    initiative: 3,
    effects: [],
    properties: { magicBased: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`🔮 **${userName} extends their magical senses!**`);
        user.consumeMana(10);
        messageCache.pushManaChange(userName, -10, user.currentMana);
        messageCache.push(`✨ **${userName} detects the flow of magical energy!**`);
    }
});

// ============== PHYSICAL TECHNIQUES ==============

export const DRAGON_SLASH = new Technique({
    name: 'Dragon Slash',
    description: 'Powerful sword technique capable of slaying dragons',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 120,
    precision: 0.85,
    manaCost: 25,
    initiative: -1,
    effects: [],
    properties: { weaponBased: true, dragonSlayer: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);

        // Epic dragon slaying sequence
        messageCache.push(`⚔️ **${userName} raises their weapon high, channeling draconic energy!**`);
        messageCache.push(`🐉 Ancient dragon power courses through the blade!`);
        messageCache.push(`🔥 The weapon glows with legendary dragonslaying force!`);

        // Consume mana (physical techniques can still use mana for enhancement)
        user.consumeMana(25);
        messageCache.pushManaChange(userName, -25, user.currentMana);

        // Calculate enhanced damage
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor(stats.attack - targetStats.defense);
        
        // Dragon Slash power bonus
        damage = Math.floor(damage * 1.2);
        
        // Check if target is dragon-like for bonus damage
        const isDragonLike = target!.races.some(race => 
            race.toLowerCase().includes('dragon') || 
            race.toLowerCase().includes('wyrm') || 
            race.toLowerCase().includes('drake')
        );
        
        if (isDragonLike) {
            damage = Math.floor(damage * 1.5);
            messageCache.push(`🐲 **The dragonslaying technique finds its true purpose!**`);
        }
        
        // Add variance
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);

        // Critical hit chance
        const isCritical = Math.random() < 0.2;
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
            messageCache.push(`💥 **CRITICAL HIT!** The dragon slash finds a devastating opening!`);
        }

        // Apply damage with epic description
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        
        if (isCritical) {
            messageCache.push(`⚔️ **${userName}'s legendary blade cleaves through ${targetName} with earth-shaking force!**`);
        } else {
            messageCache.push(`🗡️ **${userName} unleashes the devastating Dragon Slash upon ${targetName}!**`);
        }
        
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);

        // Check for defeat
        if (target!.currentHP <= 0 && oldHP > 0) {
            if (isDragonLike) {
                messageCache.push(`🐉 **${targetName} falls to the legendary dragonslaying technique!**`);
            } else {
                messageCache.push(`💀 **${targetName} is overwhelmed by the mighty Dragon Slash!**`);
            }
        }
    }
});

export const BERSERKER_RAGE = new Technique({
    name: 'Berserker Rage',
    description: 'Enter a rage state to increase attack power',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 0,
    effects: [
        createStatBoostEffect('attack', 4, 1.0, EffectTarget.Self),
        createStatBoostEffect('defense', -2, 1.0, EffectTarget.Self)
    ],
    properties: { weaponBased: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`😡 **${userName} lets out a battle cry!**`);
        user.consumeMana(20);
        messageCache.pushManaChange(userName, -20, user.currentMana);
        messageCache.push(`🔥 **${userName} enters a berserker rage!**`);
        messageCache.push(`⚔️ **${userName}'s attack power surges, but defenses weaken!**`);
    }
});

export const GUARD_BREAKER = new Technique({
    name: 'Guard Breaker',
    description: 'Strike that penetrates enemy defenses',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 80,
    precision: 0.9,
    manaCost: 18,
    initiative: 0,
    effects: [],
    properties: { weaponBased: true, armorPiercing: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`⚔️ **${userName} focuses on breaking through defenses!**`);
        user.consumeMana(18);
        messageCache.pushManaChange(userName, -18, user.currentMana);
        const stats = user.getEffectiveStats();
        let damage = Math.floor(stats.attack * 0.8);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`💥 **${userName} strikes through ${targetName}'s guard!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} falls to the devastating strike!**`);
        }
    }
});

export const HOLY_STRIKE = new Technique({
    name: 'Holy Strike',
    description: 'Divine-blessed attack effective against demons',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 85,
    precision: 0.92,
    manaCost: 22,
    initiative: 0,
    effects: [],
    properties: { weaponBased: true, holyDamage: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`✨ **${userName}'s weapon glows with divine light!**`);
        user.consumeMana(22);
        messageCache.pushManaChange(userName, -22, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.attack - targetStats.defense) * 0.85);
        const isDemon = target!.races.some(race => race.toLowerCase().includes('demon'));
        if (isDemon) {
            damage = Math.floor(damage * 1.5);
            messageCache.push(`🔥 **The holy power burns against demonic essence!**`);
        }
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`⛨ **${userName} strikes with divine fury!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} is purified by the holy strike!**`);
        }
    }
});

// ============== SUPPORT TECHNIQUES ==============

export const COURAGE_BOOST = new Technique({
    name: 'Courage Boost',
    description: 'Inspire courage to boost all combat stats',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 25,
    initiative: 2,
    effects: [
        createStatBoostEffect('attack', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('defense', 2, 1.0, EffectTarget.Self),
        createStatBoostEffect('speed', 1, 1.0, EffectTarget.Self)
    ],
    properties: { inspirational: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`👊 **${userName} summons inner courage!**`);
        user.consumeMana(25);
        messageCache.pushManaChange(userName, -25, user.currentMana);
        messageCache.push(`✨ **${userName} feels inspired and empowered!**`);
        messageCache.push(`💪 **${userName}'s combat abilities are enhanced!**`);
    }
});

export const SHIELD_WALL = new Technique({
    name: 'Shield Wall',
    description: 'Create an impenetrable defensive barrier',
    affinity: Affinity.Defense,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 30,
    initiative: 3,
    effects: [
        createStatBoostEffect('defense', 5, 1.0, EffectTarget.Self)
    ],
    properties: { defensive: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`🛡️ **${userName} raises a massive defensive barrier!**`);
        user.consumeMana(30);
        messageCache.pushManaChange(userName, -30, user.currentMana);
        messageCache.push(`🏰 **An impenetrable shield wall protects ${userName}!**`);
    }
});

export const SPEED_BOOST = new Technique({
    name: 'Speed Boost',
    description: 'Enhance movement and reaction speed',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 15,
    initiative: 2,
    effects: [
        createStatBoostEffect('speed', 3, 1.0, EffectTarget.Self)
    ],
    properties: { enhancement: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = target ? session.interface.formatCharacterWithPlayer(target, session) : userName;

        // Magical enhancement sequence
        messageCache.push(`✨ **${userName} weaves threads of enhancement magic!**`);
        messageCache.push(`💨 Wind magic swirls around ${targetName}, lightening their steps!`);

        // Consume mana
        user.consumeMana(15);
        messageCache.pushManaChange(userName, -15, user.currentMana);

        // Apply speed enhancement effect
        messageCache.push(`🌪️ **${targetName} feels incredibly swift and agile!**`);
        messageCache.push(`⚡ **${targetName}'s reflexes are dramatically enhanced!**`);
        
        // Note: The actual stat boost would be handled by the effects system
        // This is just the flavor text for the technique usage
        
        messageCache.push(`💫 **${targetName} is now enhanced with magical swiftness!**`);
    }
});

// ============== DEMON/DARK TECHNIQUES ==============

export const SHADOW_BLAST = new Technique({
    name: 'Shadow Blast',
    description: 'Dark energy attack that drains the soul',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 85,
    precision: 0.9,
    manaCost: 28,
    initiative: 0,
    effects: [
        createConditionEffect(CombatCondition.Fear, 0.4, EffectTarget.Opponent)
    ],
    properties: { magicBased: true, darkMagic: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🌑 **${userName} gathers dark energy!**`);
        user.consumeMana(28);
        messageCache.pushManaChange(userName, -28, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.magicAttack - targetStats.magicDefense) * 0.85);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`🖤 **Shadows engulf ${targetName} with malevolent energy!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} is consumed by the darkness!**`);
        }
    }
});

export const LIFE_DRAIN = new Technique({
    name: 'Life Drain',
    description: 'Steal life force from the enemy',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 60,
    precision: 0.92,
    manaCost: 25,
    initiative: 0,
    effects: [
        createHealEffect(30, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true, darkMagic: true, lifeDrain: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`🧿 **${userName} extends a shadowy tendril toward ${targetName}!**`);
        user.consumeMana(25);
        messageCache.pushManaChange(userName, -25, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.magicAttack - targetStats.magicDefense) * 0.6);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        const healing = Math.min(damage, user.maxHP - user.currentHP);
        user.currentHP += healing;
        messageCache.push(`🩸 **${userName} drains life force from ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (healing > 0) {
            messageCache.pushHealing(userName, healing, user.currentHP);
        }
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName}'s life force is completely drained!**`);
        }
    }
});

export const DEMONIC_AURA = new Technique({
    name: 'Demonic Aura',
    description: 'Intimidating presence that weakens enemies',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 20,
    initiative: 1,
    effects: [
        createStatBoostEffect('attack', -2, 0.8, EffectTarget.Opponent),
        createConditionEffect(CombatCondition.Fear, 0.6, EffectTarget.Opponent)
    ],
    properties: { aura: true, darkMagic: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`😈 **${userName} emanates a terrifying demonic presence!**`);
        user.consumeMana(20);
        messageCache.pushManaChange(userName, -20, user.currentMana);
        messageCache.push(`🌑 **Dark energy radiates from ${userName}, striking fear!**`);
        messageCache.push(`😨 **${targetName} feels their resolve weakening!**`);
    }
});

// ============== SPECIAL CHARACTER TECHNIQUES ==============

export const GODDESS_BLESSING = new Technique({
    name: 'Goddess Blessing',
    description: 'Divine magic that heals and purifies',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 35,
    initiative: 2,
    effects: [
        createHealEffect(60, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true, divine: true, removesCurses: true },
    onUsed: ({ user, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        messageCache.push(`✨ **${userName} calls upon divine power!**`);
        user.consumeMana(35);
        messageCache.pushManaChange(userName, -35, user.currentMana);
        const healingPower = Math.floor(user.getEffectiveStats().magicAttack * 0.8);
        const actualHealing = Math.min(healingPower, user.maxHP - user.currentHP);
        if (actualHealing > 0) {
            user.currentHP += actualHealing;
            messageCache.push(`👼 **Golden light descends, blessing ${userName}!**`);
            messageCache.pushHealing(userName, actualHealing, user.currentHP);
        } else {
            messageCache.push(`👼 **Divine light surrounds ${userName}, though they need no healing!**`);
        }
    }
});

export const MAGE_KILLER = new Technique({
    name: 'Mage Killer',
    description: 'Anti-magic technique that disrupts spellcasters',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Physical,
    power: 70,
    precision: 0.95,
    manaCost: 20,
    initiative: 1,
    effects: [
        createConditionEffect(CombatCondition.MagicSeal, 0.7, EffectTarget.Opponent)
    ],
    properties: { antiMagic: true, weaponBased: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`⚔️ **${userName} strikes with anti-magic precision!**`);
        user.consumeMana(20);
        messageCache.pushManaChange(userName, -20, user.currentMana);
        const stats = user.getEffectiveStats();
        const targetStats = target!.getEffectiveStats();
        let damage = Math.floor((stats.attack - targetStats.defense) * 0.7);
        const isMage = target!.techniques.some(tech => tech.properties?.magicBased);
        if (isMage) {
            damage = Math.floor(damage * 1.3);
            messageCache.push(`⚡ **The anti-magic strike disrupts ${targetName}'s magical abilities!**`);
        }
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`💥 **${userName}'s anti-magic technique hits ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} falls to the mage-killing strike!**`);
        }
    }
});

export const CUTTING_MAGIC = new Technique({
    name: 'Cutting Magic',
    description: 'Slicing spell that cuts through anything',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 95,
    precision: 0.88,
    manaCost: 32,
    initiative: 0,
    effects: [],
    properties: { magicBased: true, armorPiercing: true, slashing: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = session.interface.formatCharacterWithPlayer(target!, session);
        messageCache.push(`✂️ **${userName} weaves slicing magic through the air!**`);
        user.consumeMana(32);
        messageCache.pushManaChange(userName, -32, user.currentMana);
        const stats = user.getEffectiveStats();
        let damage = Math.floor(stats.magicAttack * 0.95);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        const oldHP = target!.currentHP;
        target!.takeDamage(damage);
        messageCache.push(`🔪 **Magical blades slice through ${targetName}!**`);
        messageCache.pushDamage(userName, targetName, damage, target!.currentHP);
        if (target!.currentHP <= 0 && oldHP > 0) {
            messageCache.push(`💀 **${targetName} is cut down by the slicing magic!**`);
        }
    }
});

export const FOLK_MAGIC = new Technique({
    name: 'Folk Magic',
    description: 'Simple but effective everyday magic',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 35,
    precision: 0.98,
    manaCost: 8,
    initiative: 1,
    effects: [],
    properties: { magicBased: true, reliable: true },
    onUsed: ({ user, target, messageCache, session }) => {
        const userName = session.interface.formatCharacterWithPlayer(user, session);
        const targetName = target ? session.interface.formatCharacterWithPlayer(target, session) : userName;
        messageCache.push(`✨ **${userName} casts simple but reliable folk magic!**`);
        user.consumeMana(8);
        messageCache.pushManaChange(userName, -8, user.currentMana);
        if (target && target !== user) {
            const stats = user.getEffectiveStats();
            const targetStats = target.getEffectiveStats();
            let damage = Math.floor((stats.magicAttack - targetStats.magicDefense) * 0.35);
            damage = Math.floor(damage * (0.95 + Math.random() * 0.1));
            damage = Math.max(1, damage);
            const oldHP = target.currentHP;
            target.takeDamage(damage);
            messageCache.push(`🌟 **Simple magic affects ${targetName}!**`);
            messageCache.pushDamage(userName, targetName, damage, target.currentHP);
            if (target.currentHP <= 0 && oldHP > 0) {
                messageCache.push(`💀 **${targetName} falls to the reliable folk magic!**`);
            }
        } else {
            const healing = Math.floor(user.maxHP * 0.1);
            const actualHealing = Math.min(healing, user.maxHP - user.currentHP);
            if (actualHealing > 0) {
                user.currentHP += actualHealing;
                messageCache.pushHealing(userName, actualHealing, user.currentHP);
            }
            messageCache.push(`🌿 **Folk magic provides comfort and minor restoration!**`);
        }
    }
});

// ============== TECHNIQUE COLLECTIONS BY CHARACTER TYPE ==============

export const BASIC_MAGE_TECHNIQUES = [
    ZOLTRAAK,
    HEALING_MAGIC,
    MANA_SHIELD,
    ANALYSIS
];

export const ADVANCED_MAGE_TECHNIQUES = [
    JUDRADJIM,
    VOLLZANBEL,
    GRAUSAMKEIT,
    SORGANEIL
];

export const WARRIOR_TECHNIQUES = [
    DRAGON_SLASH,
    BERSERKER_RAGE,
    GUARD_BREAKER,
    HOLY_STRIKE
];

export const SUPPORT_TECHNIQUES = [
    COURAGE_BOOST,
    SHIELD_WALL,
    SPEED_BOOST,
    DEFENSIVE_MAGIC
];

export const DEMON_TECHNIQUES = [
    SHADOW_BLAST,
    LIFE_DRAIN,
    DEMONIC_AURA
];

export const PRIEST_TECHNIQUES = [
    GODDESS_BLESSING,
    HEALING_MAGIC,
    HOLY_STRIKE
];

// ============== EXPORT ALL TECHNIQUES ==============

export const ALL_TECHNIQUES = [
    // Basic
    ZOLTRAAK,
    HEALING_MAGIC,
    MANA_SHIELD,
    DEFENSIVE_MAGIC,
    
    // Binding
    SORGANEIL,
    BINDING_SPELL,
    
    // Advanced Destruction
    JUDRADJIM,
    VOLLZANBEL,
    GRAUSAMKEIT,
    
    // Analysis
    ANALYSIS,
    DETECT_MAGIC,
    
    // Physical
    DRAGON_SLASH,
    BERSERKER_RAGE,
    GUARD_BREAKER,
    HOLY_STRIKE,
    
    // Support
    COURAGE_BOOST,
    SHIELD_WALL,
    SPEED_BOOST,
    
    // Dark/Demon
    SHADOW_BLAST,
    LIFE_DRAIN,
    DEMONIC_AURA,
    
    // Special
    GODDESS_BLESSING,
    MAGE_KILLER,
    CUTTING_MAGIC,
    FOLK_MAGIC
];

export function getTechniqueByName(name: string): Technique | undefined {
    return ALL_TECHNIQUES.find(tech => tech.name.toLowerCase() === name.toLowerCase());
}

export function getTechniquesByType(type: 'mage' | 'warrior' | 'support' | 'demon' | 'priest'): Technique[] {
    switch (type) {
        case 'mage':
            return [...BASIC_MAGE_TECHNIQUES, ...ADVANCED_MAGE_TECHNIQUES];
        case 'warrior':
            return WARRIOR_TECHNIQUES;
        case 'support':
            return SUPPORT_TECHNIQUES;
        case 'demon':
            return DEMON_TECHNIQUES;
        case 'priest':
            return PRIEST_TECHNIQUES;
        default:
            return [];
    }
}