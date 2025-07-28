import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    VOLLZANBEL, 
    ANALYSIS, 
    ZOLTRAAK,
    DETECT_MAGIC
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory, EffectTarget } from '../types/enums';
import { createStatBoostEffect } from '../character/TechniqueEffect';
import mediaLinks from '../formatting/mediaLinks';

const THEORY_RESEARCH = new Technique({
    name: 'Theory Research',
    description: 'Advance magical theory through careful study',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 15,
    initiative: 0,
    effects: [
        createStatBoostEffect('magicAttack', 2, 1.0, EffectTarget.Self)
    ],
    properties: { magicBased: true, theory: true }
});

const flammeStats = {
    hp: 90,
    attack: 55,
    defense: 75,
    magicAttack: 140,
    magicDefense: 100,
    speed: 70
};

const flammeAbility = {
    abilityName: "Founder of Humanity's Magic",
    abilityEffectString: `The Foundation of Humanity's Magic develops for each Theory technique used. After using 4 Theory techniques, unlock a devastating ultimate attack.`,
    
    subAbilities: [
        {
            name: "All-Knowing",
            description: "See past opponent's Mana Suppression and hidden effects."
        },
        {
            name: "Magic Pioneer",
            description: "All magical techniques have increased power and precision."
        }
    ],

    abilityAfterOwnTechniqueUse: (character: any, battle: any, technique: any) => {
        if (technique.properties?.theory) {
            character.theoryCount = (character.theoryCount || 0) + 1;
            battle.logMessage(`${character.name} advances magical theory (${character.theoryCount}/4)`);
            
            if (character.theoryCount >= 4) {
                character.pinnacleUnlocked = true;
                battle.logMessage(`${character.name} has discovered the Pinnacle of Humanity's Magic!`);
            }
        }
    },

    damageOutputMultiplier: (_user: any, _target: any, technique: any) => {
        if (technique.properties?.magicBased) {
            return 1.25; // 25% bonus to all magic
        }
        return 1.0;
    }
};

const Flamme = new CharacterData({
    characterName: CharacterName.Flamme,
    cosmetic: {
        emoji: CharacterEmoji.FLAMME,
        color: 0xde8a54,
        imageUrl: mediaLinks.flammeCard,
        description: 'The legendary mage who founded modern human magic. Frieren\'s master and creator of countless magical techniques.'
    },
    level: 85,
    races: [Race.Human],
    baseStats: flammeStats,
    techniques: [
        THEORY_RESEARCH,
        VOLLZANBEL,
        ANALYSIS,
        ZOLTRAAK,
        DETECT_MAGIC
    ],
    ability: flammeAbility,
    additionalMetadata: {
        theoryCount: 0,
        pinnacleUnlocked: false,
        ignoreManaSuppressed: true
    }
});

export default Flamme;