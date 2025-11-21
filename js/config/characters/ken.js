// Ken - Fast and agile fighter with lighter attacks
export default {
    name: 'Ken',
    scale: 0.4,
    offset: { x: 0, y: 0 },
    jumpVelocity: -18,  // Higher jump than Ryu
    moveSpeed: 6,       // Faster movement
    attackDamage: 8,    // Less damage than Ryu
    sprites: {
        idle: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4
        },
        jump: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4,
            loop: false
        },
        fall: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4,
            loop: false
        },
        attack1: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4,
            attackFrame: 2
        },
        takeHit: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4
        },
        death: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4
        }
    }
};
