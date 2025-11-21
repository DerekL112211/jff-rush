// Chun-Li - Fastest fighter with highest jump but lowest damage
export default {
    name: 'G-Li',
    scale: 0.4,
    offset: { x: 0, y: 0 },
    jumpVelocity: -13,  // Highest jump
    moveSpeed: 7,       // Fastest movement
    attackDamage: 7,    // Lowest damage
    attackBox: {
        offset: { x: 0, y: 0 },
        width: 100,
        height: 50
    },
    sprites: {
        idle: {
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './sprite/p1/run.png',
            framesMax: 4
        },
        jump: {
            imageSrc: './sprite/p1/jump.png',
            framesMax: 4,
            loop: false
        },
        fall: {
            imageSrc: './sprite/p1/fall.png',
            framesMax: 4,
            loop: false
        },
        attack1: {
            imageSrc: './sprite/p1/attack.png',
            framesMax: 4,
            attackFrame: 2,
            loop: false  // Don't loop attack animation
        },
        takeHit: {
            imageSrc: './sprite/p1/takehit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './sprite/p1/death.png',
            framesMax: 4
        }
    }
};
