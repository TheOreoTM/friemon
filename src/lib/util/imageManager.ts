import { AttachmentBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { IMAGE_CONSTANTS } from './constants';

/**
 * Character Image Manager
 * Handles loading and serving character images
 */

export class ImageManager {
    private static readonly ASSETS_PATH = IMAGE_CONSTANTS.ASSETS_PATH;
    private static readonly DEFAULT_IMAGE = IMAGE_CONSTANTS.DEFAULT_IMAGE;
    
    /**
     * Get the file path for a character's image
     * @param characterName - The name of the character
     * @returns The full path to the character's image file
     */
    static getCharacterImagePath(characterName: string): string {
        // Normalize character name for filename (lowercase, replace spaces with underscores)
        const normalizedName = characterName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const imagePath = path.join(this.ASSETS_PATH, `${normalizedName}.png`);
        
        // Check if character-specific image exists, otherwise use default
        if (fs.existsSync(imagePath)) {
            return imagePath;
        }
        
        const defaultPath = path.join(this.ASSETS_PATH, this.DEFAULT_IMAGE);
        return fs.existsSync(defaultPath) ? defaultPath : '';
    }
    
    /**
     * Check if a character has a custom image
     * @param characterName - The name of the character
     * @returns True if character has a custom image
     */
    static hasCharacterImage(characterName: string): boolean {
        const normalizedName = characterName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const imagePath = path.join(this.ASSETS_PATH, `${normalizedName}.png`);
        return fs.existsSync(imagePath);
    }
    
    /**
     * Create a Discord attachment for a character image
     * @param characterName - The name of the character
     * @param attachmentName - Optional custom attachment name
     * @returns AttachmentBuilder or null if image doesn't exist
     */
    static createCharacterAttachment(characterName: string, attachmentName?: string): AttachmentBuilder | null {
        const imagePath = this.getCharacterImagePath(characterName);
        
        if (!imagePath || !fs.existsSync(imagePath)) {
            return null;
        }
        
        const filename = attachmentName || `${characterName.toLowerCase().replace(/\s+/g, '_')}.png`;
        return new AttachmentBuilder(imagePath, { name: filename });
    }
    
    /**
     * Get all available character images
     * @returns Array of character names that have images
     */
    static getAvailableCharacterImages(): string[] {
        if (!fs.existsSync(this.ASSETS_PATH)) {
            return [];
        }
        
        const files = fs.readdirSync(this.ASSETS_PATH);
        return files
            .filter(file => file.endsWith('.png') && file !== this.DEFAULT_IMAGE)
            .map(file => {
                // Convert filename back to character name
                const nameWithoutExt = file.replace('.png', '');
                return nameWithoutExt.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            });
    }
    
    /**
     * Initialize the image system - create directories if they don't exist
     */
    static initialize(): void {
        if (!fs.existsSync(this.ASSETS_PATH)) {
            fs.mkdirSync(this.ASSETS_PATH, { recursive: true });
            console.log(`Created character images directory: ${this.ASSETS_PATH}`);
        }
        
        // Create a default placeholder image info file
        const readmePath = path.join(this.ASSETS_PATH, 'README.md');
        if (!fs.existsSync(readmePath)) {
            const readmeContent = `# Character Images

Place character PNG files in this directory using the following naming convention:

## Naming Convention
- Use lowercase characters only
- Replace spaces with underscores
- Remove special characters except underscores
- Use .png extension

## Examples
- "Frieren" → \`frieren.png\`
- "Serie" → \`serie.png\`
- "Himmel the Hero" → \`himmel_the_hero.png\`
- "Fern" → \`fern.png\`

## Default Image
- Create \`default.png\` as fallback for characters without specific images

## Directory Structure
\`\`\`
assets/characters/
├── README.md (this file)
├── default.png (fallback image)
├── frieren.png
├── fern.png
├── himmel.png
├── serie.png
└── ... (other character images)
\`\`\`

The system will automatically use these images in character displays, battle interfaces, and other UI elements.
`;
            fs.writeFileSync(readmePath, readmeContent);
        }
    }
    
    /**
     * Get the URL for embedding an image in Discord
     * @param characterName - The name of the character
     * @returns attachment:// URL for Discord embeds or null
     */
    static getEmbedImageURL(characterName: string): string | null {
        if (!this.hasCharacterImage(characterName)) {
            return null;
        }
        
        const normalizedName = characterName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        return `attachment://${normalizedName}.png`;
    }
}

/**
 * Character image helper functions
 */
export const CharacterImages = {
    /**
     * Quick helper to get character attachment
     */
    get: (characterName: string) => ImageManager.createCharacterAttachment(characterName),
    
    /**
     * Quick helper to check if character has image
     */
    has: (characterName: string) => ImageManager.hasCharacterImage(characterName),
    
    /**
     * Quick helper to get embed URL
     */
    url: (characterName: string) => ImageManager.getEmbedImageURL(characterName),
    
    /**
     * Initialize the system
     */
    init: () => ImageManager.initialize()
};

// Auto-initialize when module is imported
ImageManager.initialize();