import { Sprite } from './Sprite.js';
import { debugLog } from '../utils/DebugConfig.js';

export class Fighter extends Sprite {
    constructor({
        position,
        velocity,
        color = 'red',
        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 0, y: 0 },
        sprites,
        attackBox = { offset: {}, width: undefined, height: undefined },
        hitbox = { offset: { x: 0, y: 0 }, width: 50, height: 150 },  // Customizable hitbox
        isPlayer = true,
        jumpVelocity = -15,  // Default jump velocity
        moveSpeed = 5,       // Default move speed
        attackDamage = 10,   // Default attack damage
        blockReduction = 0.5,  // Default block reduction (50%)
        name = 'Fighter',    // Character name
        audioManager = null  // Audio manager for sound effects
    }) {
        debugLog('Fighter constructor - position:', position);
        
        super({
            position,
            imageSrc: imageSrc || (sprites && sprites.idle ? sprites.idle.imageSrc : null),
            scale,
            framesMax: framesMax || (sprites && sprites.idle ? sprites.idle.framesMax : 1),
            offset,
            sprites,
            isPlayer
        });

        this.velocity = velocity;
        this.scale = scale;
        
        // Store default hitbox and current hitbox
        this.defaultHitbox = hitbox;
        this.hitboxOffset = hitbox.offset;
        this.width = hitbox.width;
        this.height = hitbox.height;
        
        // Store fixed dimensions for physics calculations (doesn't change with sprite)
        this.physicsWidth = hitbox.width;
        this.physicsHeight = hitbox.height;
        
        // Store per-sprite hitboxes if they exist
        this.spriteHitboxes = {};
        if (sprites) {
            for (const spriteName in sprites) {
                if (sprites[spriteName].hitbox) {
                    this.spriteHitboxes[spriteName] = sprites[spriteName].hitbox;
                }
            }
        }
        
        this.lastKey;
        
        debugLog('Fighter constructor - position param:', position);
        debugLog('Fighter constructor - this.position:', this.position);
        debugLog('Fighter constructor - attackBox param:', attackBox);
        
        // Ensure we have valid position values
        const validPosition = position || this.position || { x: 0, y: 0 };
        
        this.attackBox = {
            position: {
                x: validPosition.x,
                y: validPosition.y
            },
            offset: attackBox.offset || { x: 0, y: 0 },
            width: attackBox.width || 100,
            height: attackBox.height || 50
        };
        
        debugLog('AttackBox initialized:', this.attackBox);
        this.color = color;
        this.isAttacking = false;
        this.isBlocking = false;  // Blocking state
        this.health = 100;
        this.isPlayer = isPlayer;
        this.sprites = sprites;
        this.jumpVelocity = jumpVelocity;
        this.moveSpeed = moveSpeed;
        this.attackDamage = attackDamage;
        this.blockReduction = blockReduction;  // How much damage is reduced when blocking
        this.name = name;
        this.dead = false;
        this.isGrounded = false;  // Initialize grounded state
        this.audioManager = audioManager;  // Store audio manager reference

        if (this.sprites) {
            for (const sprite in this.sprites) {
                this.sprites[sprite].image = new Image();
                this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
            }
        }
    }

    update(c, canvasWidth, canvasHeight, gravity) {
        this.draw(c);
        // Always animate frames, even when dead (for death animation)
        this.animateFrames();

        // Skip physics updates when dead
        if (this.dead) return;

        // Update attack box position (can be overridden by subclasses)
        this.updateAttackBoxPosition();

        // Apply velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity
        this.velocity.y += gravity;

        // Ground collision - use fixed physics height
        const groundLevel = canvasHeight - 96;
        if (this.position.y + this.physicsHeight >= groundLevel) {
            this.position.y = groundLevel - this.physicsHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // boundaries - use fixed physics width
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.physicsWidth > canvasWidth) this.position.x = canvasWidth - this.physicsWidth;
    }

    /**
     * Update attack box position - can be overridden by subclasses (Player1, Player2)
     */
    updateAttackBoxPosition() {
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
        
        // Default behavior based on isPlayer flag
        if (this.isPlayer) {
            // P1 faces right: attackBox extends to the right
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        } else {
            // P2 faces left: attackBox extends to the left
            this.attackBox.position.x = this.position.x - this.attackBox.width - this.attackBox.offset.x;
        }
    }

    // Get the actual collision box position (position + offset)
    getHitbox() {
        return {
            x: this.position.x + this.hitboxOffset.x,
            y: this.position.y + this.hitboxOffset.y,
            width: this.width,
            height: this.height
        };
    }

    attack() {
        debugLog(`${this.name} attack triggered! isAttacking: ${this.isAttacking}`);
        this.switchSprite('attack1');
        this.isAttacking = true;
        // Don't use timeout - let the collision detection handle resetting isAttacking
        // The attack stays active until it hits or the animation completes
    }

    block() {
        debugLog(`${this.name} blocking!`);
        this.isBlocking = true;
        if (this.sprites.block) {
            this.switchSprite('block');
        }
    }

    stopBlock() {
        debugLog(`${this.name} stopped blocking`);
        this.isBlocking = false;
    }

    switchSprite(sprite) {
        // If already dead and playing death animation, don't switch to other sprites
        if (this.image === this.sprites.death.image && sprite !== 'death') {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) {
                this.dead = true;
            }
            debugLog(`🚫 ${this.name} is dead, ignoring sprite switch to: ${sprite}`);
            return;
        }
        
        // DEATH animation has HIGHEST priority - can interrupt anything
        if (sprite === 'death') {
            debugLog(`💀 ${this.name} switching to DEATH animation (interrupting current: ${this.currentSprite})`);
            // Force switch to death immediately
            this.image = this.sprites.death.image;
            this.framesMax = this.sprites.death.framesMax;
            this.framesCurrent = 0;
            this.framesHold = this.sprites.death.framesHold || 5;
            this.animationLoop = false;
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.updateHitbox('death');
            return;
        }

        // overriding all other animations with the attack animation
        if (
            this.image === this.sprites.attack1.image &&
            this.framesCurrent < this.sprites.attack1.framesMax - 1
        )
            return;

        // override when fighter gets hit
        if (
            this.image === this.sprites.takeHit.image &&
            this.framesCurrent < this.sprites.takeHit.framesMax - 1
        )
            return;

        switch (sprite) {
            case 'idle':
                if (this.image !== this.sprites.idle.image) {
                    this.image = this.sprites.idle.image;
                    this.framesMax = this.sprites.idle.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.idle.framesHold || 5;
                    this.animationLoop = true;  // Always loop
                    this.updateHitbox('idle');
                }
                break;
            case 'run':
                if (this.image !== this.sprites.run.image) {
                    this.image = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.run.framesHold || 5;
                    this.animationLoop = true;  // Always loop
                    this.updateHitbox('run');
                }
                break;
            case 'jump':
                if (this.image !== this.sprites.jump.image) {
                    this.image = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.jump.framesHold || 5;
                    this.animationLoop = this.sprites.jump.loop !== false;
                    this.updateHitbox('jump');
                }
                break;
            case 'fall':
                if (this.image !== this.sprites.fall.image) {
                    this.image = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.fall.framesHold || 5;
                    this.animationLoop = this.sprites.fall.loop !== false;
                    this.updateHitbox('fall');
                }
                break;
            case 'attack1':
                if (this.image !== this.sprites.attack1.image) {
                    this.image = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.attack1.framesHold || 5;
                    this.updateHitbox('attack1');
                }
                break;
            case 'takeHit':
                if (this.image !== this.sprites.takeHit.image) {
                    this.image = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.takeHit.framesHold || 5;
                    // Sound is now handled in GameController to differentiate hit vs defense
                    this.updateHitbox('takeHit');
                }
                break;
            case 'death':
                if (this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.framesCurrent = 0;
                    this.framesHold = this.sprites.death.framesHold || 5;
                    this.animationLoop = false;  // Don't loop death animation
                    // Stop all movement when dying
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.updateHitbox('death');
                }
                break;
            case 'block':
                if (this.sprites.block) {
                    if (this.image !== this.sprites.block.image) {
                        this.image = this.sprites.block.image;
                        this.framesMax = this.sprites.block.framesMax;
                        this.framesCurrent = 0;
                        this.framesHold = this.sprites.block.framesHold || 5;
                        this.animationLoop = true;
                        this.updateHitbox('block');
                    }
                }
                break;
        }
    }

    // Update hitbox based on current sprite
    updateHitbox(spriteName) {
        if (this.spriteHitboxes[spriteName]) {
            const hitbox = this.spriteHitboxes[spriteName];
            this.hitboxOffset = hitbox.offset;
            this.width = hitbox.width;
            this.height = hitbox.height;
        } else {
            // Use default hitbox if no specific hitbox is defined
            this.hitboxOffset = this.defaultHitbox.offset;
            this.width = this.defaultHitbox.width;
            this.height = this.defaultHitbox.height;
        }
    }
}
