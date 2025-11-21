// Ryu - Balanced fighter
export default {
    name: 'Ryu',
    scale: 0.4,
    offset: { x: 0, y: 0 },
    jumpVelocity: -15,
    moveSpeed: 5,
    attackDamage: 10,
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
            imageSrc: './sprite/p1/idle.png',
            framesMax: 4,
            attackFrame: 3
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
