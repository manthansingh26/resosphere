// Generative ambient soundscape using Web Audio API
class AuraAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentMood = 0.5;

  initialize() {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.15; // Subtle volume
    this.masterGain.connect(this.audioContext.destination);
  }

  start(mood: number = 0.5) {
    if (this.isPlaying) return;
    
    this.initialize();
    if (!this.audioContext || !this.masterGain) return;

    this.isPlaying = true;
    this.currentMood = mood;

    // Create multiple oscillators for rich ambient sound
    this.createAmbientLayer(mood);
  }

  private createAmbientLayer(mood: number) {
    if (!this.audioContext || !this.masterGain) return;

    // Base frequencies that sound good together (pentatonic-ish)
    const baseFrequencies = [
      65.41,  // C2
      98.00,  // G2
      130.81, // C3
      196.00, // G3
      261.63, // C4
    ];

    // Create 3-5 oscillators based on mood
    const oscCount = Math.floor(3 + mood * 2);

    for (let i = 0; i < oscCount; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      // Choose frequency based on mood
      const freqIndex = Math.floor(Math.random() * baseFrequencies.length);
      let frequency = baseFrequencies[freqIndex];
      
      // High creative/energy = higher frequencies (sparkly)
      if (mood > 0.7) {
        frequency *= (1 + Math.random() * 0.5);
      }
      
      // High calm = lower frequencies (deep pads)
      if (mood < 0.4) {
        frequency *= (0.7 + Math.random() * 0.3);
      }

      osc.frequency.value = frequency;
      
      // Wave type based on mood
      if (mood > 0.7) {
        osc.type = 'sine'; // Sparkly for creative/energetic
      } else if (mood > 0.4) {
        osc.type = 'triangle'; // Balanced
      } else {
        osc.type = 'sine'; // Soft pads for calm
      }

      // Individual gain for each oscillator
      gain.gain.value = 0.1 + Math.random() * 0.1;
      
      // Add subtle LFO (Low Frequency Oscillator) for movement
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      lfo.frequency.value = 0.1 + Math.random() * 0.3; // Slow modulation
      lfoGain.gain.value = 2 + mood * 3; // Modulation depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      // Connect everything
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      // Start
      osc.start();
      lfo.start();
      
      this.oscillators.push(osc);
    }
  }

  updateMood(mood: number) {
    if (!this.isPlaying || !this.audioContext) return;
    
    this.currentMood = mood;
    
    // Smoothly adjust frequencies based on new mood
    this.oscillators.forEach((osc, i) => {
      const currentFreq = osc.frequency.value;
      let targetFreq = currentFreq;
      
      // High mood = higher pitch
      if (mood > 0.7) {
        targetFreq = currentFreq * (1 + (mood - 0.7) * 0.3);
      } else if (mood < 0.4) {
        targetFreq = currentFreq * (0.8 + mood * 0.5);
      }
      
      // Smooth transition
      osc.frequency.exponentialRampToValueAtTime(
        targetFreq,
        this.audioContext!.currentTime + 1
      );
    });
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    // Fade out
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.5
      );
    }
    
    // Stop all oscillators after fade
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.oscillators = [];
    }, 600);
  }

  toggle(mood: number = 0.5): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(mood);
      return true;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
export const auraAudio = new AuraAudioEngine();

// Helper to get/set audio preference
export function getAudioPreference(): boolean {
  return localStorage.getItem('aura-audio-enabled') === 'true';
}

export function setAudioPreference(enabled: boolean) {
  localStorage.setItem('aura-audio-enabled', enabled ? 'true' : 'false');
}
