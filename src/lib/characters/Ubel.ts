import { CharacterData } from '../character/CharacterData';
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
import mediaLinks from '../formatting/mediaLinks';

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
    hp: 80,
    attack: 70,
    defense: 65,
    magicAttack: 110,
    magicDefense: 75,
    speed: 95
};

const ubelAbility = {
    abilityName: "Reckless Empathy",
    abilityEffectString: `Übel's slashing attacks ignore 100% of opponent's defense, but can be blocked by defensive techniques. Attack accuracy varies based on emotional understanding.`,
    
    damageOutputMultiplier: (_user: any, _target: any, technique: any) => {
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
        imageUrl: mediaLinks.ubelCard,
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