import { Fighter } from './Fighter.js';

/**
 * Player1 (P1) - Left side character, faces right
 */
export class Player1 extends Fighter {
    constructor(config) {
        super({
            ...config,
            isPlayer: true
        });
        
        // P1 specific attack box configuration
        // Override the default attackBox positioning for P1
        this.attackBoxOffsetMultiplier = 1; // P1 攻擊框在右側（正常方向）
    }
    
    /**
     * Update attack box position for P1 (faces right)
     */
    updateAttackBoxPosition() {
        // P1 faces right: attackBox extends to the right from character hitbox
        // Use hitbox position (body position) instead of sprite position
        const bodyX = this.position.x + this.hitboxOffset.x; // 角色身體的左邊緣
        this.attackBox.position.x = bodyX + this.width + this.attackBox.offset.x; // 從身體右邊緣開始
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    }
}

/**
 * Player2 (P2) - Right side character, faces left (mirrored)
 */
export class Player2 extends Fighter {
    constructor(config) {
        super({
            ...config,
            isPlayer: false
        });
        
        // P2 specific attack box configuration
        this.attackBoxOffsetMultiplier = -1; // P2 攻擊框在左側（鏡像）
    }
    
    /**
     * Update attack box position for P2 (faces left, mirrored)
     */
    updateAttackBoxPosition() {
        // P2 faces left: attackBox extends to the left from character hitbox
        // Use hitbox position (body position) instead of sprite position
        const bodyX = this.position.x + this.hitboxOffset.x; // 角色身體的左邊緣
        this.attackBox.position.x = bodyX - this.attackBox.width - this.attackBox.offset.x; // 從身體左邊緣向左延伸
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    }
}
