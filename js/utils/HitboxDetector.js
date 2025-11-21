/**
 * HitboxDetector - Automatically detect hitbox dimensions from sprite images
 * by analyzing non-transparent pixels
 */

import { debugLog } from './DebugConfig.js';

export class HitboxDetector {
    /**
     * Analyze a sprite sheet with multiple frames and return the maximum bounding box
     * @param {HTMLImageElement} image - The sprite sheet image
     * @param {number} framesMax - Number of frames in the sprite sheet
     * @param {number} alphaThreshold - Alpha value threshold (0-255), default 50
     * @returns {Promise<{offset: {x, y}, width: number, height: number}>}
     */
    static async detectFromSpriteSheet(image, framesMax, alphaThreshold = 50) {
        return new Promise((resolve, reject) => {
            if (!image.complete) {
                image.onload = () => this.analyzeSpriteSheet(image, framesMax, alphaThreshold, resolve, reject);
                image.onerror = reject;
            } else {
                this.analyzeSpriteSheet(image, framesMax, alphaThreshold, resolve, reject);
            }
        });
    }

    static analyzeSpriteSheet(image, framesMax, alphaThreshold, resolve, reject) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw the entire sprite sheet
            ctx.drawImage(image, 0, 0);
            
            // Calculate frame width
            const frameWidth = image.width / framesMax;
            const frameHeight = image.height;
            
            // Store bounds for each frame
            const frameBounds = [];
            
            // Analyze each frame
            for (let frameIndex = 0; frameIndex < framesMax; frameIndex++) {
                const frameX = frameIndex * frameWidth;
                
                // Get image data for this frame
                const imageData = ctx.getImageData(frameX, 0, frameWidth, frameHeight);
                const pixels = imageData.data;
                
                let minX = frameWidth;
                let minY = frameHeight;
                let maxX = 0;
                let maxY = 0;
                let hasContent = false;
                
                // Scan this frame's pixels
                for (let y = 0; y < frameHeight; y++) {
                    for (let x = 0; x < frameWidth; x++) {
                        const index = (y * frameWidth + x) * 4;
                        const alpha = pixels[index + 3];
                        
                        if (alpha > alphaThreshold) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                            hasContent = true;
                        }
                    }
                }
                
                if (hasContent) {
                    frameBounds.push({
                        minX: minX,
                        minY: minY,
                        maxX: maxX,
                        maxY: maxY,
                        frameIndex: frameIndex
                    });
                }
            }
            
            if (frameBounds.length === 0) {
                reject(new Error('No non-transparent pixels found in any frame'));
                return;
            }
            
            // Find the maximum bounding box that covers all frames
            const globalMinX = Math.min(...frameBounds.map(b => b.minX));
            const globalMinY = Math.min(...frameBounds.map(b => b.minY));
            const globalMaxX = Math.max(...frameBounds.map(b => b.maxX));
            const globalMaxY = Math.max(...frameBounds.map(b => b.maxY));
            
            const width = globalMaxX - globalMinX + 1;
            const height = globalMaxY - globalMinY + 1;
            
            resolve({
                offset: { x: globalMinX, y: globalMinY },
                width: width,
                height: height,
                // Additional info
                bounds: { minX: globalMinX, minY: globalMinY, maxX: globalMaxX, maxY: globalMaxY },
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                framesMax: framesMax,
                frameBounds: frameBounds  // Individual frame bounds for reference
            });
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Analyze an image and return the bounding box of non-transparent pixels
     * @param {HTMLImageElement} image - The sprite image to analyze
     * @param {number} alphaThreshold - Alpha value threshold (0-255), default 50
     * @returns {Promise<{offset: {x, y}, width: number, height: number}>}
     */
    static async detectFromImage(image, alphaThreshold = 50) {
        return new Promise((resolve, reject) => {
            // Create a temporary canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Wait for image to load if not loaded yet
            if (!image.complete) {
                image.onload = () => this.analyze(image, canvas, ctx, alphaThreshold, resolve, reject);
                image.onerror = reject;
            } else {
                this.analyze(image, canvas, ctx, alphaThreshold, resolve, reject);
            }
        });
    }

    static analyze(image, canvas, ctx, alphaThreshold, resolve, reject) {
        try {
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw the image
            ctx.drawImage(image, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;
            
            // Scan all pixels to find non-transparent bounds
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const index = (y * canvas.width + x) * 4;
                    const alpha = pixels[index + 3];
                    
                    // If pixel is not transparent (alpha > threshold)
                    if (alpha > alphaThreshold) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            
            // Calculate dimensions
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            
            resolve({
                offset: { x: minX, y: minY },
                width: width,
                height: height,
                // Additional info
                bounds: { minX, minY, maxX, maxY },
                imageSize: { width: canvas.width, height: canvas.height }
            });
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Detect hitbox from image URL (supports sprite sheets)
     * @param {string} imageSrc - Path to the image
     * @param {number} framesMax - Number of frames in sprite sheet (default 1)
     * @param {number} alphaThreshold - Alpha value threshold (0-255)
     * @returns {Promise<{offset: {x, y}, width: number, height: number}>}
     */
    static async detectFromUrl(imageSrc, framesMax = 1, alphaThreshold = 50) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous'; // Handle CORS if needed
            image.onload = async () => {
                try {
                    let result;
                    if (framesMax > 1) {
                        // Multi-frame sprite sheet
                        result = await this.detectFromSpriteSheet(image, framesMax, alphaThreshold);
                    } else {
                        // Single frame
                        result = await this.detectFromImage(image, alphaThreshold);
                    }
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            image.onerror = () => reject(new Error(`Failed to load image: ${imageSrc}`));
            image.src = imageSrc;
        });
    }

    /**
     * Analyze all sprite frames in a character config
     * @param {Object} characterConfig - Character configuration object
     * @param {number} alphaThreshold - Alpha value threshold
     * @returns {Promise<Object>} - Object with hitbox info for each sprite
     */
    static async analyzeCharacter(characterConfig, alphaThreshold = 50) {
        const results = {};
        
        for (const [spriteName, spriteConfig] of Object.entries(characterConfig.sprites)) {
            try {
                debugLog(`Analyzing ${spriteName} (${spriteConfig.framesMax || 1} frames)...`);
                const hitbox = await this.detectFromUrl(
                    spriteConfig.imageSrc, 
                    spriteConfig.framesMax || 1, 
                    alphaThreshold
                );
                results[spriteName] = hitbox;
                
                // If character has scale, adjust the hitbox
                if (characterConfig.scale) {
                    results[spriteName].scaledOffset = {
                        x: Math.round(hitbox.offset.x * characterConfig.scale),
                        y: Math.round(hitbox.offset.y * characterConfig.scale)
                    };
                    results[spriteName].scaledWidth = Math.round(hitbox.width * characterConfig.scale);
                    results[spriteName].scaledHeight = Math.round(hitbox.height * characterConfig.scale);
                }
            } catch (error) {
                console.error(`Error analyzing ${spriteName}:`, error);
                results[spriteName] = { error: error.message };
            }
        }
        
        return results;
    }

    /**
     * Get average hitbox from multiple sprite analyses (useful for idle/run animations)
     * @param {Array} hitboxResults - Array of hitbox results
     * @returns {Object} - Average hitbox
     */
    static getAverageHitbox(hitboxResults) {
        const valid = hitboxResults.filter(r => !r.error);
        if (valid.length === 0) return null;
        
        const avg = {
            offset: { x: 0, y: 0 },
            width: 0,
            height: 0
        };
        
        valid.forEach(result => {
            avg.offset.x += result.offset.x;
            avg.offset.y += result.offset.y;
            avg.width += result.width;
            avg.height += result.height;
        });
        
        avg.offset.x = Math.round(avg.offset.x / valid.length);
        avg.offset.y = Math.round(avg.offset.y / valid.length);
        avg.width = Math.round(avg.width / valid.length);
        avg.height = Math.round(avg.height / valid.length);
        
        return avg;
    }

    /**
     * Generate character config code with detected hitbox
     * @param {string} characterName - Character name
     * @param {Object} hitbox - Detected hitbox
     * @returns {string} - JavaScript code snippet
     */
    static generateConfigCode(characterName, hitbox) {
        return `
// Auto-detected hitbox for ${characterName}
hitbox: {
    offset: { x: ${hitbox.offset.x}, y: ${hitbox.offset.y} },
    width: ${hitbox.width},
    height: ${hitbox.height}
},`;
    }

    /**
     * Visual debug - draw detected hitbox on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} hitbox - Hitbox object
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor
     */
    static drawDebugBox(ctx, hitbox, x, y, scale = 1) {
        ctx.save();
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x + hitbox.offset.x * scale,
            y + hitbox.offset.y * scale,
            hitbox.width * scale,
            hitbox.height * scale
        );
        ctx.restore();
    }
}

// Example usage in console:
// import { HitboxDetector } from './js/utils/HitboxDetector.js';
// const hitbox = await HitboxDetector.detectFromUrl('./sprite/p1/idle.png');
// console.log(hitbox);
