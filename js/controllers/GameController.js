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
        
        if (
            rectangularCollision({ rectangle1: this.player, rectangle2: this.enemy }) &&
            this.player.isAttacking &&
            this.player.framesCurrent === playerAttackFrame
        ) {
            this.player.isAttacking = false;
            this.enemy.health -= this.player.attackDamage;
            this.enemy.switchSprite('takeHit');
            this.view.updateHealth(this.player.health, this.enemy.health);
        }

        // if player misses
        if (this.player.isAttacking && this.player.framesCurrent === playerAttackFrame) {
            this.player.isAttacking = false;
        }

        if (
            rectangularCollision({ rectangle1: this.enemy, rectangle2: this.player }) &&
            this.enemy.isAttacking &&
            this.enemy.framesCurrent === enemyAttackFrame
        ) {
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
        if (this.player.health <= 0 || this.enemy.health <= 0) {
            this.determineWinner();
            this.player.dead = true;
            this.enemy.dead = true;
            if (this.player.health <= 0) this.player.switchSprite('death');
            if (this.enemy.health <= 0) this.enemy.switchSprite('death');
        }
    }
}
