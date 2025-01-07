class AudioManager {
    constructor() {
        this.sounds = {
            move: new Audio('sounds/select-sound-121244.mp3'),
            merge: new Audio('sounds/select-sound-121244.mp3'),
            gameover: new Audio('sounds/videogame-death-sound-43894.mp3')
        };
        this.soundEnabled = true;
    }

    play(sound) {
        if (this.soundEnabled && this.sounds[sound]) {
            this.sounds[sound].play();
        }
    }

    toggleSound() { // Add this method
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}