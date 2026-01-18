/**
 * Audio Manager
 * Handles all game sounds using Web Audio API
 */
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.musicSource = null;
    this.musicStartTime = 0;
    this.musicLoopTimeout = null;
    this.musicPlaying = false;
    this.activeOscillators = [];

    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.3; // Music at 30% volume
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.5; // SFX at 50% volume
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // Play a simple tone
  playTone(frequency, duration, type = 'sine', gain = 0.3) {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Collision sound (explosion)
  playCollision() {
    if (!this.audioContext || this.muted) return;

    const now = this.audioContext.currentTime;

    // Low frequency rumble
    this.playTone(50, 0.5, 'sawtooth', 0.5);

    // High frequency crack
    setTimeout(() => this.playTone(800, 0.1, 'square', 0.3), 50);
  }

  // Power-up collection sound (positive chime)
  playPowerUp() {
    if (!this.audioContext || this.muted) return;

    this.playTone(523, 0.1, 'sine', 0.3); // C
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100); // E
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G
  }

  // Near miss sound (alert)
  playNearMiss() {
    if (!this.audioContext || this.muted) return;

    this.playTone(440, 0.05, 'square', 0.2);
    setTimeout(() => this.playTone(880, 0.05, 'square', 0.2), 50);
  }

  // Shield hit sound (deflection)
  playShieldHit() {
    if (!this.audioContext || this.muted) return;

    this.playTone(600, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(400, 0.1, 'sine', 0.2), 80);
  }

  // Score increase sound
  playScore() {
    if (!this.audioContext || this.muted) return;

    this.playTone(700, 0.08, 'sine', 0.15);
  }

  // Simple background music loop
  startBackgroundMusic() {
    if (!this.audioContext) return;

    this.stopBackgroundMusic();
    this.musicPlaying = true;

    // Track next loop start time in audio timeline
    let nextLoopTime = this.audioContext.currentTime;

    // Dark, fast techno loop - aggressive and driving with verse/chorus structure
    const notes = [
      // VERSE - Dark synth melody
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 277, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // C#4
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 311, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Eb4
      { freq: 277, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // C#4
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3

      { freq: 196, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // G3
      { freq: 196, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // G3
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 196, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // G3
      { freq: 277, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // C#4
      { freq: 233, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // Bb3
      { freq: 196, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // G3
      { freq: 196, duration: 0.15, type: 'sawtooth', gain: 0.10 }, // G3

      // CHORUS - Completely different pattern (stabbing synth riff)
      { freq: 311, duration: 0.3, type: 'square', gain: 0.13 }, // Eb4 (longer stabs)
      { freq: 277, duration: 0.15, type: 'square', gain: 0.11 }, // C#4
      { freq: 233, duration: 0.15, type: 'square', gain: 0.11 }, // Bb3
      { freq: 349, duration: 0.3, type: 'square', gain: 0.13 }, // F4
      { freq: 311, duration: 0.15, type: 'square', gain: 0.11 }, // Eb4
      { freq: 277, duration: 0.15, type: 'square', gain: 0.11 }, // C#4

      { freq: 277, duration: 0.3, type: 'square', gain: 0.13 }, // C#4
      { freq: 233, duration: 0.15, type: 'square', gain: 0.11 }, // Bb3
      { freq: 196, duration: 0.15, type: 'square', gain: 0.11 }, // G3
      { freq: 311, duration: 0.3, type: 'square', gain: 0.13 }, // Eb4
      { freq: 277, duration: 0.15, type: 'square', gain: 0.11 }, // C#4
      { freq: 233, duration: 0.15, type: 'square', gain: 0.11 }, // Bb3
    ];

    // Harmony layer for chorus effect (detuned slightly for richness)
    const harmony = [
      // VERSE - Fifth harmony (quieter)
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 }, // F4 (fifth above Bb3)
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 415, duration: 0.15, type: 'sawtooth', gain: 0.06 }, // G#4
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 466, duration: 0.15, type: 'sawtooth', gain: 0.06 }, // Bb4
      { freq: 415, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },

      { freq: 294, duration: 0.15, type: 'sawtooth', gain: 0.06 }, // D4
      { freq: 294, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 294, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 415, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 349, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 294, duration: 0.15, type: 'sawtooth', gain: 0.06 },
      { freq: 294, duration: 0.15, type: 'sawtooth', gain: 0.06 },

      // CHORUS - Different harmony matching stabbing riff
      { freq: 466, duration: 0.3, type: 'square', gain: 0.08 }, // Bb4 (fifth above)
      { freq: 415, duration: 0.15, type: 'square', gain: 0.06 }, // G#4
      { freq: 349, duration: 0.15, type: 'square', gain: 0.06 }, // F4
      { freq: 523, duration: 0.3, type: 'square', gain: 0.08 }, // C5
      { freq: 466, duration: 0.15, type: 'square', gain: 0.06 }, // Bb4
      { freq: 415, duration: 0.15, type: 'square', gain: 0.06 }, // G#4

      { freq: 415, duration: 0.3, type: 'square', gain: 0.08 }, // G#4
      { freq: 349, duration: 0.15, type: 'square', gain: 0.06 }, // F4
      { freq: 294, duration: 0.15, type: 'square', gain: 0.06 }, // D4
      { freq: 466, duration: 0.3, type: 'square', gain: 0.08 }, // Bb4
      { freq: 415, duration: 0.15, type: 'square', gain: 0.06 }, // G#4
      { freq: 349, duration: 0.15, type: 'square', gain: 0.06 }, // F4
    ];

    // Deep, pounding bassline - dark and aggressive (doubled length)
    const bassline = [
      // VERSE
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // Bb1
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // Bb1
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // C2
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // C2
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // Bb1
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // Bb1
      { freq: 49, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // G1
      { freq: 49, duration: 0.3, type: 'sawtooth', gain: 0.20 }, // G1

      // CHORUS - More driving
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // C2
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // C2
      { freq: 73, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // D2
      { freq: 73, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // D2
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // Bb1
      { freq: 58, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // Bb1
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // C2
      { freq: 65, duration: 0.3, type: 'sawtooth', gain: 0.22 }, // C2
    ];

    const loopDuration = notes.reduce((sum, note) => sum + note.duration, 0);

    const playLoop = () => {
      if (!this.musicPlaying) {
        return;
      }

      if (this.muted) {
        this.musicLoopTimeout = setTimeout(playLoop, 100);
        return;
      }

      const now = this.audioContext.currentTime;

      // If nextLoopTime is in the past, schedule immediately
      if (nextLoopTime < now) {
        nextLoopTime = now;
      }

      // Play melody
      let melodyTime = 0;
      notes.forEach((note, i) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.frequency.value = note.freq;
        oscillator.type = note.type || 'triangle';

        const startTime = nextLoopTime + melodyTime;
        const endTime = startTime + note.duration * 0.9;

        const noteGain = note.gain || 0.15;
        gainNode.gain.setValueAtTime(noteGain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);

        // Track active oscillators so we can stop them immediately if needed
        this.activeOscillators.push(oscillator);

        // Remove from tracking when it naturally ends
        oscillator.onended = () => {
          const index = this.activeOscillators.indexOf(oscillator);
          if (index > -1) {
            this.activeOscillators.splice(index, 1);
          }
        };

        melodyTime += note.duration;
      });

      // Play bassline
      let bassTime = 0;
      bassline.forEach((note, i) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.frequency.value = note.freq;
        oscillator.type = note.type || 'triangle';

        const startTime = nextLoopTime + bassTime;
        const endTime = startTime + note.duration * 0.95;

        const noteGain = note.gain || 0.15;
        gainNode.gain.setValueAtTime(noteGain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);

        // Track active oscillators
        this.activeOscillators.push(oscillator);

        oscillator.onended = () => {
          const index = this.activeOscillators.indexOf(oscillator);
          if (index > -1) {
            this.activeOscillators.splice(index, 1);
          }
        };

        bassTime += note.duration;
      });

      // Play harmony (chorus effect)
      let harmonyTime = 0;
      harmony.forEach((note, i) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.frequency.value = note.freq;
        oscillator.type = note.type || 'triangle';

        const startTime = nextLoopTime + harmonyTime;
        const endTime = startTime + note.duration * 0.9;

        const noteGain = note.gain || 0.15;
        gainNode.gain.setValueAtTime(noteGain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);

        // Track active oscillators
        this.activeOscillators.push(oscillator);

        oscillator.onended = () => {
          const index = this.activeOscillators.indexOf(oscillator);
          if (index > -1) {
            this.activeOscillators.splice(index, 1);
          }
        };

        harmonyTime += note.duration;
      });

      // Schedule next loop at exact end time of this loop
      nextLoopTime += loopDuration;

      // Calculate wait time based on audio timeline, not wall clock
      const waitTime = (nextLoopTime - this.audioContext.currentTime) * 1000;
      this.musicLoopTimeout = setTimeout(playLoop, Math.max(0, waitTime - 100));
    };

    playLoop();
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;

    if (this.musicLoopTimeout) {
      clearTimeout(this.musicLoopTimeout);
      this.musicLoopTimeout = null;
    }

    // Stop all active oscillators immediately
    this.activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        // Already stopped or disconnected
      }
    });
    this.activeOscillators = [];

    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.musicSource = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;

    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }

    return this.muted;
  }

  setMusicVolume(volume) {
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  setSFXVolume(volume) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = volume;
    }
  }
}
