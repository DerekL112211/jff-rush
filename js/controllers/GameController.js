import { Fighter } from '../models/Fighter.js';
import { rectangularCollision } from '../utils/utils.js';
import { getCharacter } from '../config/characters.js';

export class GameController {
    constructor(view, { player1Character = 'ryu', player2Character = 'ryu' } = {}) {
        this.view = view;
        this.gravity = 0.7;
        this.timer = 60;
        this.timerId = null;
        this.gameOver = false;
        
        // Store character selections
        this.player1Character = player1Character;
        this.player2Character = player2Character;

        this.keys = {
            a: { pressed: false },
            d: { pressed: false },
            ArrowRight: { pressed: false },
            ArrowLeft: { pressed: false }
        };

        this.init();
        this.addEventListeners();
        this.decreaseTimer();
        this.animate();
        
        // Add restart button listener
        document.querySelector('#restart-button').addEventListener('click', () => {
            this.restart();
        });
    }

    init() {
        // Load character configurations
        const p1Config = getCharacter(this.player1Character);
        const p2Config = getCharacter(this.player2Character);

        // Create Player 1 with their selected character
        this.player = new Fighter({
            position: { x: 200, y: 0 },
            velocity: { x: 0, y: 0 },
            isPlayer: true,
            ...p1Config  // Spread character config (scale, offset, jumpVelocity, sprites, etc.)
        });

        // Create Player 2 with their selected character
        this.enemy = new Fighter({
            position: { x: 750, y: 0 },
            velocity: { x: 0, y: 0 },
            isPlayer: false,
            ...p2Config  // Spread character config
        });
    }

    addEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (this.player.dead || this.enemy.dead) return;

            switch (event.key) {
                case 'd':
                    this.keys.d.pressed = true;
                    this.player.lastKey = 'd';
                    break;
                case 'a':
                    this.keys.a.pressed = true;
                    this.player.lastKey = 'a';
                    break;
                case 'w':
                    if (this.player.isGrounded) {
                        console.log('Player JUMP triggered!');
                        this.player.velocity.y = this.player.jumpVelocity;
                        this.player.isGrounded = false;
                        this.player.switchSprite('jump');
                    }
                    break;
                case ' ':
                    this.player.attack();
                    break;

                case 'ArrowRight':
                    this.keys.ArrowRight.pressed = true;
                    this.enemy.lastKey = 'ArrowRight';
                    break;
                case 'ArrowLeft':
                    this.keys.ArrowLeft.pressed = true;
                    this.enemy.lastKey = 'ArrowLeft';
                    break;
                case 'ArrowUp':
                    if (this.enemy.isGrounded) {
                        console.log('Enemy JUMP triggered!');
                        this.enemy.velocity.y = this.enemy.jumpVelocity;
                        this.enemy.isGrounded = false;
                        this.enemy.switchSprite('jump');
                    }
                    break;
                case 'Enter':
                    this.enemy.attack();
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'd': this.keys.d.pressed = false; break;
                case 'a': this.keys.a.pressed = false; break;
                case 'ArrowRight': this.keys.ArrowRight.pressed = false; break;
                case 'ArrowLeft': this.keys.ArrowLeft.pressed = false; break;
            }
        });
    }

    decreaseTimer() {
        if (this.timer > 0) {
            this.timerId = setTimeout(() => this.decreaseTimer(), 1000);
            this.timer--;
            this.view.updateTimer(this.timer);
        }
        if (this.timer === 0) {
            this.determineWinner();
        }
    }

    determineWinner() {
        clearTimeout(this.timerId);
        this.gameOver = true;
        
        if (this.player.health === this.enemy.health) {
            this.view.showResult('Draw');
        } else if (this.player.health > this.enemy.health) {
            this.view.showResult('P1 Wins');
        } else if (this.player.health < this.enemy.health) {
            this.view.showResult('P2 Wins');
        }
    }

    restart() {
        // Reset game state
        this.gameOver = false;
        this.timer = 60;
        clearTimeout(this.timerId);
        
        // Hide result display
        this.view.hideResult();
        
        // Reinitialize players
        this.init();
        
        // Reset keys
        this.keys = {
            a: { pressed: false },
            d: { pressed: false },
            ArrowRight: { pressed: false },
            ArrowLeft: { pressed: false }
        };
        
        // Reset health display
        this.view.updateHealth(100, 100);
        this.view.updateTimer(60);
        
        // Restart timer
        this.decreaseTimer();
    }

    animate() {
        window.requestAnimationFrame(() => this.animate());
        this.view.clear();
        this.view.drawBackground();

        this.player.update(this.view.c, this.view.canvas.width, this.view.canvas.height, this.gravity);
        this.enemy.update(this.view.c, this.view.canvas.width, this.view.canvas.height, this.gravity);

        // Player Movement
        this.player.velocity.x = 0;
        if (this.keys.a.pressed && this.player.lastKey === 'a') {
            this.player.velocity.x = -this.player.moveSpeed;
            this.player.switchSprite('run');
        } else if (this.keys.d.pressed && this.player.lastKey === 'd') {
            this.player.velocity.x = this.player.moveSpeed;
            this.player.switchSprite('run');
        } else {
            this.player.switchSprite('idle');
        }

        // Player Jump
        if (this.player.velocity.y < 0) {
            this.player.switchSprite('jump');
        } else if (this.player.velocity.y > 0) {
            this.player.switchSprite('fall');
        }

        // Enemy Movement
        this.enemy.velocity.x = 0;
        if (this.keys.ArrowLeft.pressed && this.enemy.lastKey === 'ArrowLeft') {
            this.enemy.velocity.x = -this.enemy.moveSpeed;
            this.enemy.switchSprite('run');
        } else if (this.keys.ArrowRight.pressed && this.enemy.lastKey === 'ArrowRight') {
            this.enemy.velocity.x = this.enemy.moveSpeed;
            this.enemy.switchSprite('run');
        } else {
            this.enemy.switchSprite('idle');
        }

        // Enemy Jump
        if (this.enemy.velocity.y < 0) {
            this.enemy.switchSprite('jump');
        } else if (this.enemy.velocity.y > 0) {
            this.enemy.switchSprite('fall');
        }

        // Collision Detection
        const playerAttackFrame = this.player.sprites.attack1.attackFrame || Math.floor(this.player.sprites.attack1.framesMax / 2);
        const enemyAttackFrame = this.enemy.sprites.attack1.attackFrame || Math.floor(this.enemy.sprites.attack1.framesMax / 2);
        
        // Debug player attack
        if (this.player.isAttacking) {
            const collision = rectangularCollision({ rectangle1: this.player, rectangle2: this.enemy });
            console.log(`Player attacking - frame: ${this.player.framesCurrent}/${playerAttackFrame}`);
            console.log(`  Player attackBox: x=${this.player.attackBox.position.x.toFixed(0)}, y=${this.player.attackBox.position.y.toFixed(0)}, w=${this.player.attackBox.width}, h=${this.player.attackBox.height}`);
            console.log(`  Enemy hitbox: x=${this.enemy.position.x.toFixed(0)}, y=${this.enemy.position.y.toFixed(0)}, w=${this.enemy.width}, h=${this.enemy.height}`);
            console.log(`  Collision: ${collision}`);
        }
        
        if (
            rectangularCollision({ rectangle1: this.player, rectangle2: this.enemy }) &&
            this.player.isAttacking &&
            this.player.framesCurrent === playerAttackFrame
        ) {
            console.log('Player HIT successful!');
            this.player.isAttacking = false;
            this.enemy.health -= this.player.attackDamage;
            this.enemy.switchSprite('takeHit');
            this.view.updateHealth(this.player.health, this.enemy.health);
        }

        // if player misses
        if (this.player.isAttacking && this.player.framesCurrent === playerAttackFrame) {
            this.player.isAttacking = false;
        }

        // Debug enemy attack
        if (this.enemy.isAttacking) {
            console.log(`Enemy attacking - frame: ${this.enemy.framesCurrent}, attackFrame: ${enemyAttackFrame}, collision: ${rectangularCollision({ rectangle1: this.enemy, rectangle2: this.player })}`);
        }
        
        if (
            rectangularCollision({ rectangle1: this.enemy, rectangle2: this.player }) &&
            this.enemy.isAttacking &&
            this.enemy.framesCurrent === enemyAttackFrame
        ) {
            console.log('Enemy HIT successful!');
            this.enemy.isAttacking = false;
            this.player.health -= this.enemy.attackDamage;
            this.player.switchSprite('takeHit');
            this.view.updateHealth(this.player.health, this.enemy.health);
        }

        // if enemy misses
        if (this.enemy.isAttacking && this.enemy.framesCurrent === enemyAttackFrame) {
            this.enemy.isAttacking = false;
        }

        // End Game
        if (!this.gameOver && (this.player.health <= 0 || this.enemy.health <= 0)) {
            this.determineWinner();
            this.player.dead = true;
            this.enemy.dead = true;
            if (this.player.health <= 0) this.player.switchSprite('death');
            if (this.enemy.health <= 0) this.enemy.switchSprite('death');
        }
    }
}
