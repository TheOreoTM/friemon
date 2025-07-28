import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { 
    SHADOW_BLAST, 
    LIFE_DRAIN, 
    DEMONIC_AURA,
    GRAUSAMKEIT
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect, createConditionEffect } from '../character/TechniqueEffect';
import mediaLinks from '../formatting/mediaLinks';

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
    effects: [
        createStatBoostEffect('attack', 1, 1.0, EffectTarget.Self)
    ],
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
    effects: [
        createConditionEffect(CombatCondition.Exhausted, 0.9, EffectTarget.Opponent)
    ],
    properties: { magicBased: true, darkMagic: true, overwhelming: true }
});

const auraStats = {
    hp: 75,
    attack: 60,
    defense: 70,
    magicAttack: 130,
    magicDefense: 90,
    speed: 85
};

const auraAbility = {
    abilityName: "Until the End of Time",
    abilityEffectString: `Aura controls an undead army. 50% of damage targeted towards her is transferred to the army instead. Start with 60 Army Strength. At end of turn, lose soldiers if Army Strength drops too low.`,
    
    subAbilities: [
        {
            name: "Demon Lord's Authority",
            description: "Immunity to fear and charm effects. Other demons deal reduced damage."
        },
        {
            name: "Undead Commander",
            description: "Summon and control undead minions to absorb damage."
        }
    ],

    abilityStartOfTurnEffect: (character: any, battle: any) => {
        // Initialize army on first turn
        if (battle.state.turn === 1) {
            character.armyStrength = 60;
            battle.logMessage(`${character.name} raises her undead army!`);
        }
    },

    abilityOnDamageReceived: (character: any, battle: any, damage: number) => {
        // Army absorbs 50% of damage
        const armyStrength = character.armyStrength || 0;
        if (armyStrength > 0) {
            const absorbedDamage = Math.floor(damage * 0.5);
            character.armyStrength = Math.max(0, armyStrength - absorbedDamage);
            battle.logMessage(`${character.name}'s army absorbs ${absorbedDamage} damage!`);
            return damage - absorbedDamage; // Return reduced damage
        }
        return damage;
    },

    abilityEndOfTurnEffect: (character: any, battle: any) => {
        // Army maintenance - lose soldiers if strength is too low
        const armyStrength = character.armyStrength || 0;
        if (armyStrength < 20 && armyStrength > 0) {
            character.armyStrength = Math.max(0, armyStrength - 5);
            battle.logMessage(`${character.name}'s army weakens as soldiers fall!`);
        }
    },

    preventCondition: (_character: any, condition: CombatCondition) => {
        // Demon lord immunity
        if (condition === CombatCondition.Fear || condition === CombatCondition.Charmed) {
            return true; // Complete immunity
        }
        return false;
    },

    damageInputMultiplier: (_user: any, target: any, _technique: any) => {
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
        imageUrl: mediaLinks.auraCard,
        description: 'A powerful demon who commands vast armies of the undead. One of the Seven Sages of Destruction with overwhelming magical power.'
    },
    level: 75,
    races: [Race.Demon],
    baseStats: auraStats,
    techniques: [
        UNDEAD_ARMY,
        SCALES_OF_OBEDIENCE,
        SHADOW_BLAST,
        LIFE_DRAIN,
        DEMONIC_AURA,
        GRAUSAMKEIT
    ],
    ability: auraAbility,
    additionalMetadata: {
        armyStrength: 0,
        demonLordAuthority: true,
        undeadCommander: true
    }
});

export default Aura;