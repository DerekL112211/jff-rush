/**
 * Debug Configuration
 * Set DEBUG_MODE = true to enable visual debugging
 */

export const DEBUG_CONFIG = {
    // Enable/disable debug mode
    ENABLED: true,  // 改成 true 來啟用調試模式和所有 console.log
    
    // Visual debugging options
    SHOW_HITBOX: true,        // 顯示角色碰撞箱 (綠色)
    SHOW_ATTACKBOX: true,     // 顯示攻擊範圍 (紅色)
    SHOW_POSITION: true,      // 顯示位置座標
    SHOW_STATE: true,         // 顯示當前狀態
    
    // Colors
    COLORS: {
        HITBOX: 'lime',          // 碰撞箱顏色
        ATTACKBOX: 'red',        // 攻擊箱顏色
        POSITION: 'yellow',      // 位置點顏色
        TEXT: 'white',           // 文字顏色
        TEXT_BG: 'rgba(0,0,0,0.5)' // 文字背景
    }
};

/**
 * Debug logging - only logs when DEBUG_CONFIG.ENABLED is true
 */
export function debugLog(...args) {
    if (DEBUG_CONFIG.ENABLED) {
        console.log(...args);
    }
}

/**
 * Draw debug information for a fighter
 */
export function drawDebugInfo(c, fighter, label = '') {
    if (!DEBUG_CONFIG.ENABLED) return;
    
    c.save();
    
    // Draw hitbox
    if (DEBUG_CONFIG.SHOW_HITBOX) {
        const hitbox = fighter.getHitbox();
        c.strokeStyle = DEBUG_CONFIG.COLORS.HITBOX;
        c.lineWidth = 2;
        c.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        
        // Label hitbox
        c.fillStyle = DEBUG_CONFIG.COLORS.TEXT;
        c.font = '12px Arial';
        c.fillText(`Hitbox: ${hitbox.width}x${hitbox.height}`, hitbox.x, hitbox.y - 5);
    }
    
    // Draw attack box
    if (DEBUG_CONFIG.SHOW_ATTACKBOX && fighter.attackBox) {
        c.strokeStyle = DEBUG_CONFIG.COLORS.ATTACKBOX;
        c.lineWidth = 2;
        c.strokeRect(
            fighter.attackBox.position.x,
            fighter.attackBox.position.y,
            fighter.attackBox.width,
            fighter.attackBox.height
        );
        
        // Label attack box
        c.fillStyle = DEBUG_CONFIG.COLORS.TEXT;
        c.font = '12px Arial';
        c.fillText(
            `AttackBox: ${fighter.attackBox.width}x${fighter.attackBox.height}`,
            fighter.attackBox.position.x,
            fighter.attackBox.position.y - 5
        );
    }
    
    // Draw position marker
    if (DEBUG_CONFIG.SHOW_POSITION) {
        c.fillStyle = DEBUG_CONFIG.COLORS.POSITION;
        c.beginPath();
        c.arc(fighter.position.x, fighter.position.y, 5, 0, Math.PI * 2);
        c.fill();
    }
    
    // Draw state information
    if (DEBUG_CONFIG.SHOW_STATE) {
        const info = [
            `${label}`,
            `Pos: (${Math.round(fighter.position.x)}, ${Math.round(fighter.position.y)})`,
            `Health: ${fighter.health}`,
            `Attacking: ${fighter.isAttacking}`,
            `Blocking: ${fighter.isBlocking}`,
            `Dead: ${fighter.dead}`
        ];
        
        // Draw background
        const textX = fighter.isPlayer ? 10 : 800;
        const textY = 50;
        c.fillStyle = DEBUG_CONFIG.COLORS.TEXT_BG;
        c.fillRect(textX - 5, textY - 15, 200, info.length * 18 + 10);
        
        // Draw text
        c.fillStyle = DEBUG_CONFIG.COLORS.TEXT;
        c.font = 'bold 14px Arial';
        info.forEach((line, index) => {
            c.fillText(line, textX, textY + index * 18);
        });
    }
    
    c.restore();
}
