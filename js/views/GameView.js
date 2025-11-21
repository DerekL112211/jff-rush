export class GameView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.c = this.canvas.getContext('2d');
        this.canvas.width = 1024;
        this.canvas.height = 576;
    }

    clear() {
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.c.fillStyle = '#87CEEB';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.c.fillStyle = '#505050';
        this.c.fillRect(0, this.canvas.height - 96, this.canvas.width, 96);
    }

    updateHealth(playerHealth, enemyHealth) {
        document.querySelector('#player-health').style.width = playerHealth + '%';
        document.querySelector('#enemy-health').style.width = enemyHealth + '%';
    }

    updateTimer(time) {
        document.querySelector('#timer').innerHTML = time;
    }

    showResult(text) {
        document.querySelector('#result-display').style.display = 'block';
        document.querySelector('#result-display').innerHTML = text;
    }
}
