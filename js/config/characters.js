// Character configurations
// Import individual character configs
import ryu from './characters/ryu.js';
import ken from './characters/ken.js';
import chun from './characters/chun.js';

// Export all characters in a centralized object
export const characters = {
    ryu,
    ken,
    chun
};

// Get character config by ID
export function getCharacter(characterId) {
    const char = characters[characterId];
    if (!char) {
        console.warn(`Character "${characterId}" not found, using default (ryu)`);
        return characters.ryu;
    }
    // Return a deep copy to avoid mutation
    return JSON.parse(JSON.stringify(char));
}

// Get list of all available characters
export function getAvailableCharacters() {
    return Object.keys(characters);
}
