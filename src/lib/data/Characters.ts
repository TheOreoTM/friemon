// NEW CHARACTER SYSTEM
// This file now exports the new TCG-inspired character system
// All legacy compatibility has been removed

import { CharacterRegistry } from '../characters/CharacterRegistry';

// Export the new character system
export { CharacterRegistry };

// Modern helper functions using the new system
export const getCharacterByName = (name: string) => {
    const characters = CharacterRegistry.getAllCharacters();
    return characters.find(char => char.characterName.toLowerCase() === name.toLowerCase()) || null;
};

export const getRandomCharacter = () => {
    return CharacterRegistry.getRandomCharacter();
};

export const getStarterTeam = () => {
    return CharacterRegistry.getRandomStarterTeam();
};

// Character tiers based on level ranges
export enum CharacterTier {
    Common = 'Common',
    Uncommon = 'Uncommon', 
    Rare = 'Rare',
    Epic = 'Epic',
    Legendary = 'Legendary'
}

export function getCharacterTier(characterName: string): CharacterTier {
    // Tiers now based on ability complexity and skill requirements, not power level
    const tierMap: { [key: string]: CharacterTier } = {
        // LEGENDARY - Master-level complexity, multiple interacting systems
        'Serie': CharacterTier.Legendary,     // Toying mechanics + complex timing
        'Flamme': CharacterTier.Legendary,    // Multiple Fire forms + mana management
        
        // EPIC - Advanced mechanics, high skill ceiling  
        'Frieren': CharacterTier.Epic,        // Analysis stacking system
        'Aura': CharacterTier.Epic,           // Army strength management
        'Denken': CharacterTier.Epic,         // Mental magic complexity
        'Sense': CharacterTier.Epic,          // Defensive counter-mechanics
        
        // RARE - Complex interactions, multiple stacking effects
        'Linie': CharacterTier.Rare,          // Chain stacking mechanics
        'Wirbel': CharacterTier.Rare,         // Lightning combo system
        'Ubel': CharacterTier.Rare,           // Empathy-based mechanics
        
        // UNCOMMON - Moderate complexity, 1-2 mechanics to track
        'Himmel': CharacterTier.Uncommon,     // Buff-based damage scaling
        'Laufen': CharacterTier.Uncommon,     // Speed-based evasion
        'Edel': CharacterTier.Uncommon,       // Balance and defensive stance
        
        // COMMON - Simple, straightforward abilities, good for beginners
        'Stark': CharacterTier.Common,        // Simple courage/coward mechanics
        'Fern': CharacterTier.Common,         // Fast magic casting
        'Sein': CharacterTier.Common,         // Healing and divine protection
        'Stille': CharacterTier.Common        // Pure speed-based gameplay
    };
    
    return tierMap[characterName] || CharacterTier.Common;
}

export function getTierColor(tier: CharacterTier): number {
    switch (tier) {
        case CharacterTier.Common: return 0x95a5a6;
        case CharacterTier.Uncommon: return 0x27ae60;
        case CharacterTier.Rare: return 0x3498db;
        case CharacterTier.Epic: return 0x9b59b6;
        case CharacterTier.Legendary: return 0xf39c12;
        default: return 0x95a5a6;
    }
}