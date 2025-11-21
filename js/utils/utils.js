export function rectangularCollision({ rectangle1, rectangle2 }) {
    // Get the hitbox for rectangle2 (defender)
    const rect2Hitbox = rectangle2.getHitbox ? rectangle2.getHitbox() : {
        x: rectangle2.position.x,
        y: rectangle2.position.y,
        width: rectangle2.width,
        height: rectangle2.height
    };
    
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rect2Hitbox.x &&
        rectangle1.attackBox.position.x <= rect2Hitbox.x + rect2Hitbox.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rect2Hitbox.y &&
        rectangle1.attackBox.position.y <= rect2Hitbox.y + rect2Hitbox.height
    )
}
