// G-Li - Auto-generated hitbox configuration
export default {
    name: 'G-Li',
    iconSrc: './sprite/p1/icon.jpg',
    scale: 0.4,
    offset: { x: 0, y: 0 },
    jumpVelocity: -12,
    moveSpeed: 4,
    attackDamage: 7,
    blockReduction: 0.9,
    
    // 默認 Hitbox (基於 idle/run 平均值，用於沒有特定hitbox的動作)
    hitbox: {
        offset: { x: 59, y: 34 },
        width: 81,
        height: 132
    },
    
    // Attack box - 相對於角色身體（hitbox）位置
    attackBox: {
        offset: { x: 0, y: 50 },  // x: 從身體邊緣開始（0 = 緊貼身體）, y: 對齊拳頭高度
        width: 50,   // 攻擊距離
        height: 60   // 攻擊範圍高度
    },
    
    sprites: {
        idle: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4,
            framesHold: 20,
            hitbox: { offset: { x: 63, y: 32 }, width: 72, height: 135 }
        },
        run: {
            imageSrc: './sprite/p1/run.png',
            framesMax: 4,
            framesHold: 20,
            hitbox: { offset: { x: 54, y: 35 }, width: 90, height: 128 }
        },
        jump: {
            imageSrc: './sprite/p1/jump.png',
            framesMax: 4,
            framesHold: 30,
            loop: false,
            hitbox: { offset: { x: 55, y: 5 }, width: 85, height: 164 }
        },
        fall: {
            imageSrc: './sprite/p1/fall.png',
            framesMax: 4,
            framesHold: 30,
            loop: false,
            hitbox: { offset: { x: 36, y: 18 }, width: 127, height: 164 }
        },
        attack1: {
            imageSrc: './sprite/p1/attack.png',
            framesMax: 4,
            framesHold: 8,
            attackFrame: 2,
            loop: false,
            hitbox: { offset: { x: 17, y: 17 }, width: 90, height: 90 }
        },
        takeHit: {
            imageSrc: './sprite/p1/takehit.png',
            framesMax: 4,
            framesHold: 17,
            hitbox: { offset: { x: 48, y: 23 }, width: 101, height: 152 }
        },
        death: {
            imageSrc: './sprite/p1/death.png',
            framesMax: 4,
            framesHold: 8,
            loop: false,
            hitbox: { offset: { x: 32, y: 24 }, width: 104, height: 112 }
        },
        block: {
            imageSrc: './sprite/p1/defend.png',
            framesMax: 4,
            framesHold: 10,
            hitbox: { offset: { x: 48, y: 28 }, width: 102, height: 141 }
        }
    }
};

/*
每個動作的 Hitbox 說明：
idle: offset(63, 32), size(72x135)
run: offset(54, 35), size(90x128)
jump: offset(55, 5), size(85x164)
fall: offset(36, 18), size(127x164)
attack1: offset(17, 17), size(90x90)
takeHit: offset(48, 23), size(101x152)
death: offset(32, 24), size(104x112)
block: offset(48, 28), size(102x141)
*/