// Character configurations
// Import individual character configs
import gli from './characters/gli.js';

// Export all characters in a centralized object
export const characters = {
    gli
};

// Get character config by ID
export function getCharacter(characterId) {
    const char = characters[characterId];
    if (!char) {
        console.warn(`Character "${characterId}" not found, using default (gli)`);
        return characters.gli;
    }
    // Return a deep copy to avoid mutation
    return JSON.parse(JSON.stringify(char));
}

// Get list of all available characters
export function getAvailableCharacters() {
    return Object.keys(characters);
}
