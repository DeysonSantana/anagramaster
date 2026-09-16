/**
 * AUDIO.JS - Sintetizador Sonoro Nativo (Web Audio API)
 * Efeitos sonoros procedurais sintetizados em runtime. Zero dependência de arquivos MP3/OGG.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('anagram_sound_enabled') !== 'false';
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('anagram_sound_enabled', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      this.playTileClick();
    }
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  /**
   * Som de clique curto de letra selecionada
   */
  playTileClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Falha no sintetizador de áudio:', e);
    }
  }

  /**
   * Som ao devolver uma letra ao rack
   */
  playTileReturn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Falha no sintetizador de áudio:', e);
    }
  }

  /**
   * Som de acerto da palavra (Arpejo maior de vitória)
   */
  playSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.32);
      });
    } catch (e) {
      console.warn('Falha no sintetizador de áudio:', e);
    }
  }

  /**
   * Som de erro/tentativa incorreta (Bip suave de advertência)
   */
  playError() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.setValueAtTime(140, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('Falha no sintetizador de áudio:', e);
    }
  }

  /**
   * Fanfarra triunfal ao finalizar o desafio com alta pontuação
   */
  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const sequence = [
        { f: 440.0, d: 0.12 }, // A4
        { f: 554.37, d: 0.12 }, // C#5
        { f: 659.25, d: 0.12 }, // E5
        { f: 880.0, d: 0.35 }  // A5
      ];

      let t = this.ctx.currentTime;
      sequence.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, t);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + item.d + 0.05);

        t += item.d * 0.9;
      });
    } catch (e) {
      console.warn('Falha no sintetizador de áudio:', e);
    }
  }
}

export const audio = new SoundEngine();
