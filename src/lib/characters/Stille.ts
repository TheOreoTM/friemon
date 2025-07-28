import { CharacterData } from '../character/CharacterData';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    SPEED_BOOST
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory } from '../types/enums';
import mediaLinks from '../formatting/mediaLinks';

const ESCAPE = new Technique({
    name: 'High-Speed Escape',
    description: 'Attempts to avoid all attacks this turn',
    affinity: Affinity.Support,
    category: TechniqueCategory.Support,
    power: 0,
    precision: 1.0,
    manaCost: 10,
    initiative: 3,
    effects: [],
    properties: { evasion: true }
});

const stilleStats = {
    hp: 45,
    attack: 35,
    defense: 30,
    magicAttack: 40,
    magicDefense: 35,
    speed: 150
};

const stilleAbility = {
    abilityName: "High-speed Escape",
    abilityEffectString: `When opponent attacks, roll D100. If result is less than speed difference, ignore the attack and counter with 80% of opponent's attack damage.`,
    
    abilityOnDamageReceived: (character: any, battle: any, damage: number) => {
        // High speed evasion - simplified without attacker access
        const speedStat = character.getEffectiveStats().speed;
        const roll = Math.floor(Math.random() * 100) + 1;
        
        battle.logMessage(`Speed: ${speedStat}, Roll: ${roll}`);
        
        if (roll < speedStat / 2) { // Evasion based on speed
            battle.logMessage(`${character.name} evaded the attack with high speed!`);
            return 0; // No damage taken
        } else {
            battle.logMessage(`${character.name} failed to evade!`);
            return damage;
        }
    }
};

const Stille = new CharacterData({
    characterName: CharacterName.Stille,
    cosmetic: {
        emoji: CharacterEmoji.STILLE,
        color: 0xe74c3c,
        imageUrl: mediaLinks.stilleCard,
        description: 'An extremely fast scout who specializes in high-speed evasion and counter-attacks.'
    },
    level: 30,
    races: [Race.Human],
    baseStats: stilleStats,
    techniques: [
        ESCAPE,
        SPEED_BOOST
    ],
    ability: stilleAbility,
    additionalMetadata: {
        highSpeedEscape: true
    }
});

export default Stille;