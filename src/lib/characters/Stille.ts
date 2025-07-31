import { CharacterData, type Ability } from '../character/CharacterData';
import { Character } from '../character/Character';
import { CharacterName } from '../metadata/CharacterName';
import { CharacterEmoji } from '../metadata/CharacterEmoji';
import { Race } from '../types/enums';
import { 
    SPEED_BOOST
} from '../techniques/SharedTechniques';
import { Technique } from '../character/Technique';
import { Affinity, TechniqueCategory } from '../types/enums';
import type { Battle } from '../battle/Battle';

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
    hp: 60,
    attack: 55,
    defense: 45,
    magicAttack: 50,
    magicDefense: 50,
    speed: 125
}; // Total: 385 (Glass cannon speedster)

const stilleAbility: Ability = {
    abilityName: "High-speed Escape",
    abilityEffectString: `When opponent attacks, roll D100. If result is less than speed difference, ignore the attack and counter with 80% of opponent's attack damage.`,
    
    abilityOnDamageReceived: (character: Character, battle: Battle, damage: number) => {
        // High speed evasion - simplified without attacker access
        const speedStat = character.getEffectiveStats().speed;
        const roll = Math.floor(Math.random() * 100) + 1;
        
        battle.addToBattleLog(`Speed: ${speedStat}, Roll: ${roll}`);
        
        if (roll < speedStat / 2) { // Evasion based on speed
            battle.addToBattleLog(`${character.name} evaded the attack with high speed!`);
            return 0; // No damage taken
        } else {
            battle.addToBattleLog(`${character.name} failed to evade!`);
            return damage;
        }
    }
};

const Stille = new CharacterData({
    characterName: CharacterName.Stille,
    cosmetic: {
        emoji: CharacterEmoji.STILLE,
        color: 0xe74c3c,
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