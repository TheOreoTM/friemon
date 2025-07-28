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

export function getCharacterTier(level: number): CharacterTier {
    if (level >= 70) return CharacterTier.Legendary;
    if (level >= 50) return CharacterTier.Epic;
    if (level >= 35) return CharacterTier.Rare;
    if (level >= 20) return CharacterTier.Uncommon;
    return CharacterTier.Common;
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