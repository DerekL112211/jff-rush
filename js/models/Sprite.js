export class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = {x: 0, y: 0}, sprites, isPlayer = true }) {
        this.position = position;
        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.offset = offset;
        this.isPlayer = isPlayer;
        this.fixedFrameWidth = null;
        this.fixedFrameHeight = null;
        this.isIdle = true; // Track if we're using idle animation
        
        // Calculate fixed frame dimensions based on idle sprite
        if (sprites && sprites.idle) {
            const idleImg = new Image();
            idleImg.src = sprites.idle.imageSrc;
            
            // Pre-calculate and set immediately (synchronously)
            idleImg.onload = () => {
                // Use idle's exact dimensions for all sprites
                this.fixedFrameWidth = (idleImg.width / sprites.idle.framesMax) * this.scale;
                this.fixedFrameHeight = idleImg.height * this.scale;
                
                // Hitbox based on idle dimensions
                this.width = this.fixedFrameWidth;
                this.height = this.fixedFrameHeight;
            };
        }
    }

    draw(c) {
        // Skip drawing until fixed dimensions are loaded
        if (!this.fixedFrameWidth || !this.fixedFrameHeight) {
            return;
        }
        
        // Always use fixed dimensions from idle sprite to ensure consistent size
        let targetWidth = this.fixedFrameWidth;
        let targetHeight = this.fixedFrameHeight;
        
        c.save();
        
        // Flip horizontally for player 2 (enemy)
        if (!this.isPlayer) {
            c.scale(-1, 1);
            c.drawImage(
                this.image,
                this.framesCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                -(this.position.x - this.offset.x + targetWidth),
                this.position.y - this.offset.y,
                targetWidth,
                targetHeight
            );
        } else {
            c.drawImage(
                this.image,
                this.framesCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                this.position.x - this.offset.x,
                this.position.y - this.offset.y,
                targetWidth,
                targetHeight
            );
        }
        
        c.restore();
    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                // Check if animation should loop (default true)
                const shouldLoop = this.animationLoop !== false;
                if (shouldLoop) {
                    this.framesCurrent = 0;
                }
                // If loop is false, stay on last frame
            }
        }
    }

    update(c) {
        this.draw(c);
        this.animateFrames();
    }
}
