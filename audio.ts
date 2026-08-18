// Web Speech synthesis helper for Prof IA Mali audio explanations

class VoiceTutorPlayer {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((isSpeaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(cb: (isSpeaking: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isSpeaking));
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    this.stop();

    // Clean text: strip markdown symbols and LaTeX backslashes for natural speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, ' ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divisé par $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'racine carrée de $1')
      .replace(/\^2/g, ' au carré')
      .replace(/\\cdot/g, ' fois ')
      .replace(/\\approx/g, ' environ égal à ')
      .replace(/\\Delta/g, 'Delta')
      .replace(/\\pi/g, 'pi')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best French voice if available
    const voices = this.synth.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr') && !v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('fr')) || null;
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notify();
  }

  public getStatus() {
    return this.isSpeaking;
  }
}

export const voiceTutor = new VoiceTutorPlayer();
