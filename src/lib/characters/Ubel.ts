import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    CUTTING_MAGIC, 
    MAGE_KILLER, 
    SPEED_BOOST
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory } from '../types/enums';

const REIGRAM = new Technique({
    name: 'Reigram',
    description: 'Slashing magic that cuts through anything by understanding it',
    affinity: Affinity.Destruction,
    category: TechniqueCategory.Magical,
    power: 100,
    precision: 0.7,
    manaCost: 25,
    initiative: 0,
    effects: [],
    properties: { magicBased: true, slashing: true, empathy: true }
});

const ubelStats = {
    hp: 70,
    attack: 60,
    defense: 55,
    magicAttack: 90,
    magicDefense: 60,
    speed: 80
}; // Total: 415

const ubelAbility: Ability = {
    abilityName: "Reckless Empathy",
    abilityEffectString: `Übel's slashing attacks ignore 100% of opponent's defense, but can be blocked by defensive techniques. Attack accuracy varies based on emotional understanding.`,
    
    damageOutputMultiplier: (_user: Character, _target: Character, technique: Technique) => {
        if (technique.properties?.slashing) {
            return 1.3; // 30% bonus for slashing attacks
        }
        return 1.0;
    }
};

const Ubel = new CharacterData({
    characterName: CharacterName.Ubel,
    cosmetic: {
        emoji: CharacterEmoji.UBEL,
        color: 0x3c5502,
        description: 'A dangerous mage who learns magic through empathy and emotion. Her cutting magic can slice through anything she understands.'
    },
    level: 45,
    races: [Race.Human],
    baseStats: ubelStats,
    techniques: [
        REIGRAM,
        CUTTING_MAGIC,
        MAGE_KILLER,
        SPEED_BOOST
    ],
    ability: ubelAbility,
    additionalMetadata: {
        empathyLearning: true,
        reckless: true
    }
});

export default Ubel;