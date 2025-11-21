import { debugLog } from './DebugConfig.js';

export class AudioManager {
    constructor() {
        this.bgm = document.getElementById('bgm');
        this.toggleButton = document.getElementById('toggle-music');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeDisplay = document.getElementById('volume-display');
        
        this.isPlaying = false;
        this.isMuted = false;
        
        // Set initial volume (30%)
        this.bgm.volume = 0.3;
        
        // Sound effects
        this.sfxVolume = 0.5; // Default SFX volume (50%)
        this.hitSound = new Audio('music/hit_sound.mp3');  // Normal hit sound (without defense)
        this.hitSound.volume = this.sfxVolume;
        this.defenseSound = new Audio('music/defense_sound.mp3');  // Defense block sound
        this.defenseSound.volume = this.sfxVolume;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Toggle music on/off
        this.toggleButton.addEventListener('click', () => {
            this.toggleMusic();
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.setVolume(volume);
            this.volumeDisplay.textContent = `${e.target.value}%`;
        });
        
        // Try to auto-play music on any user interaction
        const startMusic = () => {
            if (!this.isPlaying && !this.isMuted) {
                this.play();
            }
        };
        
        // Listen for multiple types of user interaction
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
        
        // Also try to start immediately (some browsers allow this)
        setTimeout(() => {
            if (!this.isPlaying) {
                this.play();
            }
        }, 100);
    }
    
    play() {
        this.bgm.play().then(() => {
            this.isPlaying = true;
            this.isMuted = false;
            this.toggleButton.textContent = '🔊 音樂';
            this.toggleButton.classList.remove('muted');
            debugLog('Background music started');
        }).catch(err => {
            debugLog('Could not play audio:', err);
        });
    }
    
    pause() {
        this.bgm.pause();
        this.isPlaying = false;
        this.isMuted = true;
        this.toggleButton.textContent = '🔇 音樂';
        this.toggleButton.classList.add('muted');
    }
    
    toggleMusic() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    setVolume(volume) {
        // Volume should be between 0 and 1
        this.bgm.volume = Math.max(0, Math.min(1, volume));
    }
    
    restart() {
        this.bgm.currentTime = 0;
        if (this.isPlaying) {
            this.play();
        }
    }
    
    // Play hit sound effect (when fighter gets hit without blocking)
    playHitSound() {
        // Clone the audio to allow multiple simultaneous plays
        const sound = this.hitSound.cloneNode();
        sound.volume = this.sfxVolume;
        sound.play().catch(err => {
            debugLog('Could not play hit sound:', err);
        });
    }
    
    // Play defense sound effect (when fighter blocks an attack)
    playDefenseSound() {
        // Clone the audio to allow multiple simultaneous plays
        const sound = this.defenseSound.cloneNode();
        sound.volume = this.sfxVolume;
        sound.play().catch(err => {
            debugLog('Could not play defense sound:', err);
        });
    }
    
    // Backward compatibility - calls playHitSound
    playAttackSound() {
        this.playHitSound();
    }
    
    // Update SFX volume
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.hitSound.volume = this.sfxVolume;
        this.defenseSound.volume = this.sfxVolume;
    }
}
