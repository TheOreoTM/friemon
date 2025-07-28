import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race, CombatCondition } from '../types/enums';
import { 
    ZOLTRAAK, 
    ANALYSIS, 
    VOLLZANBEL, 
    MANA_SHIELD, 
    GRAUSAMKEIT,
    DETECT_MAGIC 
} from '../techniques/SharedTechniques';
import mediaLinks from '../formatting/mediaLinks';

const frierenStats = {
    hp: 85,
    attack: 50,
    defense: 70,
    magicAttack: 120,
    magicDefense: 95,
    speed: 80
};

const frierenAbility = {
    abilityName: "Analysis",
    abilityEffectString: `At the end of every turn, gain 1 Analysis stack. When an Analysis technique is used, gain 2 Analysis stacks. Attack damage is increased by 7% per Analysis stack (max 10 stacks). After attacking, reset Analysis stacks to 0.`,
    
    subAbilities: [
        {
            name: "Mana Suppression",
            description: "Hide the amount of HP this character has."
        },
        {
            name: "Flamme's Teachings", 
            description: "See past the opponent's Mana Suppression."
        }
    ],

    abilityEndOfTurnEffect: (character: any, battle: any) => {
        // Gain 1 analysis stack at end of turn (max 10)
        const currentStacks = character.analysisStacks || 0;
        if (currentStacks < 10) {
            character.analysisStacks = currentStacks + 1;
            battle.logMessage(`${character.name} gains 1 Analysis stack (total: ${character.analysisStacks})`);
        }
    },

    abilityAfterOwnTechniqueUse: (character: any, battle: any, technique: any) => {
        // Analysis techniques give extra stacks
        if (technique.name === 'Analysis' || technique.name === 'Detect Magic') {
            const currentStacks = character.analysisStacks || 0;
            const newStacks = Math.min(10, currentStacks + 2);
            character.analysisStacks = newStacks;
            battle.logMessage(`${character.name} gains 2 Analysis stacks from ${technique.name} (total: ${newStacks})`);
        }
    },

    damageOutputMultiplier: (user: any, _target: any, technique: any) => {
        const stacks = user.analysisStacks || 0;
        const multiplier = 1 + (stacks * 0.07);
        
        // Reset stacks after attacking
        if (technique.power > 0) {
            user.analysisStacks = 0;
        }
        
        return multiplier;
    },

    preventCondition: (_character: any, condition: CombatCondition) => {
        // Analysis provides some resistance to mental effects
        if (condition === CombatCondition.Confused) {
            return Math.random() < 0.3; // 30% chance to resist confusion
        }
        return false;
    }
};

const Frieren = new CharacterData({
    characterName: CharacterName.Frieren,
    cosmetic: {
        emoji: CharacterEmoji.FRIEREN,
        color: 0xc5c3cc,
        imageUrl: mediaLinks.frierenCard,
        description: 'An ancient elf mage with over 1000 years of experience. Master of analysis and powerful destruction magic.'
    },
    level: 80,
    races: [Race.Elf],
    baseStats: frierenStats,
    techniques: [
        ZOLTRAAK,
        ANALYSIS,
        VOLLZANBEL,
        MANA_SHIELD,
        GRAUSAMKEIT,
        DETECT_MAGIC
    ],
    ability: frierenAbility,
    additionalMetadata: {
        analysisStacks: 0,
        manaSuppressed: true,
        ignoreManaSuppressed: true
    }
});

export default Frieren;