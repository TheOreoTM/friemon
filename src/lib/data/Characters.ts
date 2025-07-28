// NEW CHARACTER SYSTEM
// This file now exports the new TCG-inspired character system
// The old legacy system has been completely replaced

import { CharacterRegistry } from '../characters/CharacterRegistry';
import { CharacterName } from '../metadata/CharacterName';

// Export the new character system
export { CharacterRegistry };

// For backward compatibility during transition, provide helper functions
export function getCharacterData(characterId: string) {
    // Convert old ID format to new CharacterName enum
    const characterName = convertIdToCharacterName(characterId);
    if (characterName) {
        const newCharacter = CharacterRegistry.getCharacter(characterName);
        if (newCharacter) {
            // Convert new format to legacy format for compatibility
            return {
                id: characterId,
                name: newCharacter.characterName,
                level: newCharacter.level,
                races: newCharacter.races,
                baseStats: newCharacter.baseStats,
                techniques: newCharacter.techniques.map(tech => tech.name.toLowerCase().replace(/\s+/g, ''))
            };
        }
    }
    return null;
}

export function createCharacterInstance(characterId: string) {
    const characterName = convertIdToCharacterName(characterId);
    if (characterName) {
        return CharacterRegistry.createCharacterInstance(characterName);
    }
    throw new Error(`Character ${characterId} not found in new system`);
}

export function getAllCharacterIds(): string[] {
    return CharacterRegistry.getCharacterNames().map(name => 
        name.toLowerCase().replace(/\s+/g, '_')
    );
}

// Helper function to convert old IDs to new CharacterName enum
function convertIdToCharacterName(characterId: string): CharacterName | undefined {
    const idMap: { [key: string]: CharacterName } = {
        'frieren': CharacterName.Frieren,
        'fern': CharacterName.Fern,
        'himmel': CharacterName.Himmel,
        'stark': CharacterName.Stark,
        'aura': CharacterName.Aura,
        'flamme': CharacterName.Flamme,
        'serie': CharacterName.Serie,
        'denken': CharacterName.Denken,
        'sein': CharacterName.Sein,
        'ubel': CharacterName.Ubel,
        'sense': CharacterName.Sense,
        'wirbel': CharacterName.Wirbel,
        'edel': CharacterName.Edel,
        'laufen': CharacterName.Laufen,
        'linie': CharacterName.Linie,
        'stille': CharacterName.Stille
    };
    
    return idMap[characterId.toLowerCase()];
}

// LEGACY COMPATIBILITY EXPORTS
// These are kept for backward compatibility but use the new system underneath

export const STARTER_CHARACTERS = {
    // Generate legacy format from new system for compatibility
    fern: getCharacterData('fern'),
    himmel: getCharacterData('himmel'),
    stark: getCharacterData('stark'),
    denken: getCharacterData('denken'),
    edel: getCharacterData('edel'),
    laufen: getCharacterData('laufen')
};

// Remove all the old character definitions - they're now in the new system

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

// Character tiers are now based on level in the new system
export enum CharacterTier {
    Common = 'Common',
    Uncommon = 'Uncommon', 
    Rare = 'Rare',
    Epic = 'Epic',
    Legendary = 'Legendary'
}

export const CHARACTER_TIERS: { [key: string]: CharacterTier } = {
    // Auto-generate tiers based on levels
    fern: CharacterTier.Common,
    stark: CharacterTier.Common,
    himmel: CharacterTier.Uncommon,
    denken: CharacterTier.Uncommon,
    edel: CharacterTier.Common,
    laufen: CharacterTier.Common,
    sein: CharacterTier.Uncommon,
    wirbel: CharacterTier.Uncommon,
    ubel: CharacterTier.Uncommon,
    sense: CharacterTier.Rare,
    linie: CharacterTier.Rare,
    stille: CharacterTier.Common,
    aura: CharacterTier.Epic,
    frieren: CharacterTier.Epic,
    flamme: CharacterTier.Legendary,
    serie: CharacterTier.Legendary
};