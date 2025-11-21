import { Fighter } from '../models/Fighter.js';
import { Player1, Player2 } from '../models/Player.js';
import { rectangularCollision } from '../utils/utils.js';
import { getCharacter } from '../config/characters.js';
import { DEBUG_CONFIG, drawDebugInfo, debugLog } from '../utils/DebugConfig.js';

export class GameController {
    constructor(view, { player1Character = 'gli', player2Character = 'gli', audioManager = null } = {}) {
        this.view = view;
        this.gravity = 0.4;  // 降低重力 (原本 0.7，越小越慢)
        this.timer = 60;
        this.timerId = null;
        this.gameOver = false;
        this.audioManager = audioManager;
        
        // Store character selections
        this.player1Character = player1Character;
        this.player2Character = player2Character;

        this.keys = {
            a: { pressed: false },
            d: { pressed: false },
            s: { pressed: false },  // Block key for player 1
            ArrowRight: { pressed: false },
            ArrowLeft: { pressed: false },
            ArrowDown: { pressed: false }  // Block key for player 2
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

        // Create Player 1 with their selected character using Player1 class
        this.player = new Player1({
            position: { x: 200, y: 0 },
            velocity: { x: 0, y: 0 },
            audioManager: this.audioManager,  // Pass audio manager
            ...p1Config  // Spread character config (scale, offset, jumpVelocity, sprites, etc.)
        });

        // Create Player 2 with their selected character using Player2 class
        this.enemy = new Player2({
            position: { x: 750, y: 0 },
            velocity: { x: 0, y: 0 },
            audioManager: this.audioManager,  // Pass audio manager
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
                case 's':
                    this.keys.s.pressed = true;
                    this.player.block();
                    break;
                case 'w':
                    if (this.player.isGrounded) {
                        debugLog('Player JUMP triggered!');
                        this.player.velocity.y = this.player.jumpVelocity;
                        this.player.isGrounded = false;
                        this.player.switchSprite('jump');
                    }
                    break;
                case ' ':
                    if (!this.player.isBlocking) {
                        this.player.attack();
                    }
                    break;

                case 'ArrowRight':
                    this.keys.ArrowRight.pressed = true;
                    this.enemy.lastKey = 'ArrowRight';
                    break;
                case 'ArrowLeft':
                    this.keys.ArrowLeft.pressed = true;
                    this.enemy.lastKey = 'ArrowLeft';
                    break;
                case 'ArrowDown':
                    this.keys.ArrowDown.pressed = true;
                    this.enemy.block();
                    break;
                case 'ArrowUp':
                    if (this.enemy.isGrounded) {
                        debugLog('Enemy JUMP triggered!');
                        this.enemy.velocity.y = this.enemy.jumpVelocity;
                        this.enemy.isGrounded = false;
                        this.enemy.switchSprite('jump');
                    }
                    break;
                case 'Enter':
                    if (!this.enemy.isBlocking) {
                        this.enemy.attack();
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'd': this.keys.d.pressed = false; break;
                case 'a': this.keys.a.pressed = false; break;
                case 's': 
                    this.keys.s.pressed = false;
                    this.player.stopBlock();
                    break;
                case 'ArrowRight': this.keys.ArrowRight.pressed = false; break;
                case 'ArrowLeft': this.keys.ArrowLeft.pressed = false; break;
                case 'ArrowDown':
                    this.keys.ArrowDown.pressed = false;
                    this.enemy.stopBlock();
                    break;
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

    handleCharacterCollision() {
        // Get actual hitboxes (with offsets applied)
        const playerHitbox = this.player.getHitbox();
        const enemyHitbox = this.enemy.getHitbox();
        
        // Check if characters are overlapping using their hitboxes
        if (
            playerHitbox.x + playerHitbox.width >= enemyHitbox.x &&
            playerHitbox.x <= enemyHitbox.x + enemyHitbox.width &&
            playerHitbox.y + playerHitbox.height >= enemyHitbox.y &&
            playerHitbox.y <= enemyHitbox.y + enemyHitbox.height
        ) {
            // Characters are colliding, push them apart
            const playerCenter = playerHitbox.x + playerHitbox.width / 2;
            const enemyCenter = enemyHitbox.x + enemyHitbox.width / 2;
            
            // Calculate overlap
            const overlap = (playerHitbox.width / 2 + enemyHitbox.width / 2) - Math.abs(playerCenter - enemyCenter);
            
            if (overlap > 0) {
                if (playerCenter < enemyCenter) {
                    // Player is on the left, push them apart
                    this.player.position.x -= overlap / 2;
                    this.enemy.position.x += overlap / 2;
                } else {
                    // Player is on the right, push them apart
                    this.player.position.x += overlap / 2;
                    this.enemy.position.x -= overlap / 2;
                }
                
                // Keep characters within canvas bounds after pushing
                const canvasWidth = this.view.canvas.width;
                if (this.player.position.x < 0) {
                    this.player.position.x = 0;
                    this.enemy.position.x = this.player.width;
                }
                if (this.enemy.position.x < 0) {
                    this.enemy.position.x = 0;
                    this.player.position.x = this.enemy.width;
                }
                if (this.player.position.x + this.player.width > canvasWidth) {
                    this.player.position.x = canvasWidth - this.player.width;
                    this.enemy.position.x = this.player.position.x - this.enemy.width;
                }
                if (this.enemy.position.x + this.enemy.width > canvasWidth) {
                    this.enemy.position.x = canvasWidth - this.enemy.width;
                    this.player.position.x = this.enemy.position.x - this.player.width;
                }
            }
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
            s: { pressed: false },
            ArrowRight: { pressed: false },
            ArrowLeft: { pressed: false },
            ArrowDown: { pressed: false }
        };
        
        // Reset health display
        this.view.updateHealth(100, 100);
        this.view.updateTimer(60);
        
        // Restart timer
        this.decreaseTimer();
        
        // Restart background music
        // if (this.audioManager) {
        //     this.audioManager.restart();
        // }
    }

    animate() {
        window.requestAnimationFrame(() => this.animate());
        this.view.clear();
        this.view.drawBackground();

        this.player.update(this.view.c, this.view.canvas.width, this.view.canvas.height, this.gravity);
        this.enemy.update(this.view.c, this.view.canvas.width, this.view.canvas.height, this.gravity);

        // Draw debug info if enabled
        if (DEBUG_CONFIG.ENABLED) {
            drawDebugInfo(this.view.c, this.player, 'P1');
            drawDebugInfo(this.view.c, this.enemy, 'P2');
        }

        // Skip movement logic if dead
        if (!this.player.dead) {
            // Player Movement
            this.player.velocity.x = 0;
            
            // Check if player is blocking
            if (this.keys.s.pressed) {
                this.player.isBlocking = true;  // Set blocking state
                this.player.switchSprite('block');
                this.player.velocity.x = 0; // Can't move while blocking
            } else {
                this.player.isBlocking = false;  // Clear blocking state when not pressing block
                if (this.keys.a.pressed && this.player.lastKey === 'a') {
                    this.player.velocity.x = -this.player.moveSpeed;
                    this.player.switchSprite('run');
                } else if (this.keys.d.pressed && this.player.lastKey === 'd') {
                    this.player.velocity.x = this.player.moveSpeed;
                    this.player.switchSprite('run');
                } else {
                    this.player.switchSprite('idle');
                }
            }

            // Player Jump (can't jump while blocking)
            if (!this.player.isBlocking) {
                if (this.player.velocity.y < 0) {
                    this.player.switchSprite('jump');
                } else if (this.player.velocity.y > 0) {
                    this.player.switchSprite('fall');
                }
            }
        }

        // Skip movement logic if dead
        if (!this.enemy.dead) {
            // Enemy Movement
            this.enemy.velocity.x = 0;
            
            // Check if enemy is blocking
            if (this.keys.ArrowDown.pressed) {
                this.enemy.isBlocking = true;  // Set blocking state
                this.enemy.switchSprite('block');
                this.enemy.velocity.x = 0; // Can't move while blocking
            } else {
                this.enemy.isBlocking = false;  // Clear blocking state when not pressing block
                if (this.keys.ArrowLeft.pressed && this.enemy.lastKey === 'ArrowLeft') {
                    this.enemy.velocity.x = -this.enemy.moveSpeed;
                    this.enemy.switchSprite('run');
                } else if (this.keys.ArrowRight.pressed && this.enemy.lastKey === 'ArrowRight') {
                    this.enemy.velocity.x = this.enemy.moveSpeed;
                    this.enemy.switchSprite('run');
                } else {
                    this.enemy.switchSprite('idle');
                }
            }

            // Enemy Jump (can't jump while blocking)
            if (!this.enemy.isBlocking) {
                if (this.enemy.velocity.y < 0) {
                    this.enemy.switchSprite('jump');
                } else if (this.enemy.velocity.y > 0) {
                    this.enemy.switchSprite('fall');
                }
            }
        }

        // Character Collision Detection - Prevent characters from overlapping
        this.handleCharacterCollision();

        // Collision Detection
        const playerAttackFrame = this.player.sprites.attack1.attackFrame || Math.floor(this.player.sprites.attack1.framesMax / 2);
        const enemyAttackFrame = this.enemy.sprites.attack1.attackFrame || Math.floor(this.enemy.sprites.attack1.framesMax / 2);
        
        // Check if both players are attacking at the same frame (clash detection)
        const playerAttackActive = this.player.isAttacking && this.player.framesCurrent === playerAttackFrame;
        const enemyAttackActive = this.enemy.isAttacking && this.enemy.framesCurrent === enemyAttackFrame;
        
        // Attack Clash - Both attacks cancel each other out
        if (playerAttackActive && enemyAttackActive) {
            debugLog('⚔️ ATTACK CLASH! Both attacks cancelled!');
            this.player.isAttacking = false;
            this.enemy.isAttacking = false;
            // Optional: Add visual feedback or sound effect here
            // Both players pushed back slightly
            this.player.velocity.x = -3;
            this.enemy.velocity.x = 3;
            return; // Skip normal attack processing
        }
        
        // Debug player attack
        if (this.player.isAttacking) {
            const collision = rectangularCollision({ rectangle1: this.player, rectangle2: this.enemy });
            debugLog(`Player attacking - frame: ${this.player.framesCurrent}/${playerAttackFrame}`);
            debugLog(`  Player attackBox: x=${this.player.attackBox.position.x.toFixed(0)}, y=${this.player.attackBox.position.y.toFixed(0)}, w=${this.player.attackBox.width}, h=${this.player.attackBox.height}`);
            debugLog(`  Enemy hitbox: x=${this.enemy.position.x.toFixed(0)}, y=${this.enemy.position.y.toFixed(0)}, w=${this.enemy.width}, h=${this.enemy.height}`);
            debugLog(`  Collision: ${collision}`);
        }
        
        // Player attack
        if (
            rectangularCollision({ rectangle1: this.player, rectangle2: this.enemy }) &&
            playerAttackActive
        ) {
            debugLog('Player HIT successful!');
            this.player.isAttacking = false;
            
            // Check if enemy is blocking
            if (this.enemy.isBlocking) {
                const blockReduction = this.enemy.blockReduction || 0.5;
                const reducedDamage = Math.max(1, Math.floor(this.player.attackDamage * (1 - blockReduction)));
                this.enemy.health -= reducedDamage;
                this.enemy.health = Math.max(0, this.enemy.health);  // Ensure health doesn't go below 0
                debugLog(`🛡️ Enemy BLOCKED! Block reduction: ${(blockReduction * 100)}%, Damage taken: ${reducedDamage}/${this.player.attackDamage}, Health: ${this.enemy.health}`);
                // Play defense sound when blocking
                if (this.audioManager) {
                    this.audioManager.playDefenseSound();
                }
                // No hit animation when blocking
            } else {
                this.enemy.health -= this.player.attackDamage;
                this.enemy.health = Math.max(0, this.enemy.health);  // Ensure health doesn't go below 0
                // Only play takeHit animation if not dead
                if (!this.enemy.dead) {
                    this.enemy.switchSprite('takeHit');
                    // Play normal hit sound
                    if (this.audioManager) {
                        this.audioManager.playHitSound();
                    }
                }
                debugLog(`💥 Enemy took full damage: ${this.player.attackDamage}, Health: ${this.enemy.health}`);
            }
            this.view.updateHealth(this.player.health, this.enemy.health);
        }

        // if player misses
        if (playerAttackActive) {
            this.player.isAttacking = false;
        }

        // Debug enemy attack
        if (this.enemy.isAttacking) {
            debugLog(`Enemy attacking - frame: ${this.enemy.framesCurrent}, attackFrame: ${enemyAttackFrame}, collision: ${rectangularCollision({ rectangle1: this.enemy, rectangle2: this.player })}`);
        }
        
        // Enemy attack
        if (
            rectangularCollision({ rectangle1: this.enemy, rectangle2: this.player }) &&
            enemyAttackActive
        ) {
            debugLog('Enemy HIT successful!');
            this.enemy.isAttacking = false;
            
            // Check if player is blocking
            if (this.player.isBlocking) {
                const blockReduction = this.player.blockReduction || 0.5;
                const reducedDamage = Math.max(1, Math.floor(this.enemy.attackDamage * (1 - blockReduction)));
                this.player.health -= reducedDamage;
                this.player.health = Math.max(0, this.player.health);  // Ensure health doesn't go below 0
                debugLog(`🛡️ Player BLOCKED! Block reduction: ${(blockReduction * 100)}%, Damage taken: ${reducedDamage}/${this.enemy.attackDamage}, Health: ${this.player.health}`);
                // Play defense sound when blocking
                if (this.audioManager) {
                    this.audioManager.playDefenseSound();
                }
                // No hit animation when blocking
            } else {
                this.player.health -= this.enemy.attackDamage;
                this.player.health = Math.max(0, this.player.health);  // Ensure health doesn't go below 0
                // Only play takeHit animation if not dead
                if (!this.player.dead) {
                    this.player.switchSprite('takeHit');
                    // Play normal hit sound
                    if (this.audioManager) {
                        this.audioManager.playHitSound();
                    }
                }
                debugLog(`💥 Player took full damage: ${this.enemy.attackDamage}, Health: ${this.player.health}`);
            }
            this.view.updateHealth(this.player.health, this.enemy.health);
        }

        // if enemy misses
        if (enemyAttackActive) {
            this.enemy.isAttacking = false;
        }

        // Check for death based on health only
        if (this.player.health <= 0 && !this.player.dead) {
            debugLog('💀 Player DEATH triggered! Health:', this.player.health);
            this.player.switchSprite('death');
            this.player.dead = true;
        }
        
        if (this.enemy.health <= 0 && !this.enemy.dead) {
            debugLog('💀 Enemy DEATH triggered! Health:', this.enemy.health);
            this.enemy.switchSprite('death');
            this.enemy.dead = true;
        }

        // End Game when someone dies
        if (!this.gameOver && (this.player.dead || this.enemy.dead)) {
            this.determineWinner();
        }
    }
}
