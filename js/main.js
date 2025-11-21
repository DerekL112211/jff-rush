import { GameView } from './views/GameView.js';
import { GameController } from './controllers/GameController.js';

// Get character selections from URL parameters or use defaults
const urlParams = new URLSearchParams(window.location.search);
const player1Character = urlParams.get('p1') || 'ryu';
const player2Character = urlParams.get('p2') || 'ryu';

console.log(`Starting game: P1=${player1Character}, P2=${player2Character}`);

const view = new GameView('gameCanvas');
const controller = new GameController(view, {
    player1Character: player1Character,
    player2Character: player2Character
});
