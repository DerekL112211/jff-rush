import { Sprite } from './Sprite.js';

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
        isPlayer = true,
        jumpVelocity = -15,  // Default jump velocity
        moveSpeed = 5,       // Default move speed
        attackDamage = 10,   // Default attack damage
        name = 'Fighter'     // Character name
    }) {
        console.log('Fighter constructor - position:', position);
        
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
        this.width = 50;
        this.height = 150;
        
        this.lastKey;
        
        console.log('Fighter constructor - position param:', position);
        console.log('Fighter constructor - this.position:', this.position);
        console.log('Fighter constructor - attackBox param:', attackBox);
        
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
        
        console.log('AttackBox initialized:', this.attackBox);
        this.color = color;
        this.isAttacking = false;
        this.health = 100;
        this.isPlayer = isPlayer;
        this.sprites = sprites;
        this.jumpVelocity = jumpVelocity;
        this.moveSpeed = moveSpeed;
        this.attackDamage = attackDamage;
        this.name = name;
        this.dead = false;
        this.isGrounded = false;  // Initialize grounded state

        if (this.sprites) {
            for (const sprite in this.sprites) {
                this.sprites[sprite].image = new Image();
                this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
            }
        }
    }

    update(c, canvasWidth, canvasHeight, gravity) {
        this.draw(c);
        if (!this.dead) this.animateFrames();

        // update attack box
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // if enemy, adjust attack box to left
        if (!this.isPlayer) {
             this.attackBox.position.x = this.position.x - this.attackBox.width + this.width - this.attackBox.offset.x;
        }

        // Apply velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity
        this.velocity.y += gravity;

        // Ground collision
        const groundLevel = canvasHeight - 96;
        if (this.position.y + this.height >= groundLevel) {
            this.position.y = groundLevel - this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // boundaries
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > canvasWidth) this.position.x = canvasWidth - this.width;
    }

    attack() {
        console.log(`${this.name} attack triggered! isAttacking: ${this.isAttacking}`);
        this.switchSprite('attack1');
        this.isAttacking = true;
        // Don't use timeout - let the collision detection handle resetting isAttacking
        // The attack stays active until it hits or the animation completes
    }

    switchSprite(sprite) {
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;
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
                    this.animationLoop = true;  // Always loop
                }
                break;
            case 'run':
                if (this.image !== this.sprites.run.image) {
                    this.image = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.framesCurrent = 0;
                    this.animationLoop = true;  // Always loop
                }
                break;
            case 'jump':
                if (this.image !== this.sprites.jump.image) {
                    this.image = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.framesCurrent = 0;
                    this.animationLoop = this.sprites.jump.loop !== false;
                }
                break;
            case 'fall':
                if (this.image !== this.sprites.fall.image) {
                    this.image = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.framesCurrent = 0;
                    this.animationLoop = this.sprites.fall.loop !== false;
                }
                break;
            case 'attack1':
                if (this.image !== this.sprites.attack1.image) {
                    this.image = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'takeHit':
                if (this.image !== this.sprites.takeHit.image) {
                    this.image = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'death':
                if (this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.framesCurrent = 0;
                }
                break;
        }
    }
}
