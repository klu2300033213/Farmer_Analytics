let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function tone({ frequency, type = "sine", duration = 0.08, volume = 0.03, start = 0, attack = 0.004, release = 0.05 }) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime + start;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + release + 0.01);
}

function roboticSweep({ fromFreq, toFreq, duration = 0.24, volume = 0.035 }) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(fromFreq, now);
  oscillator.frequency.exponentialRampToValueAtTime(toFreq, now + duration);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.value = 1.8;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.08);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.12);
}

export function playSelectSound() {
  tone({ frequency: 880, type: "triangle", duration: 0.04, volume: 0.018 });
  tone({ frequency: 1140, type: "triangle", duration: 0.03, volume: 0.014, start: 0.03 });
}

export function playAnalyzeStartSound() {
  roboticSweep({ fromFreq: 330, toFreq: 920, duration: 0.22, volume: 0.026 });
  tone({ frequency: 760, type: "square", duration: 0.06, volume: 0.018, start: 0.1 });
}

export function playAnalyzeSuccessSound() {
  tone({ frequency: 660, type: "sine", duration: 0.06, volume: 0.026 });
  tone({ frequency: 880, type: "sine", duration: 0.07, volume: 0.028, start: 0.06 });
  tone({ frequency: 1180, type: "sine", duration: 0.09, volume: 0.03, start: 0.12 });
}

export function playAnalyzeErrorSound() {
  tone({ frequency: 340, type: "square", duration: 0.07, volume: 0.025 });
  tone({ frequency: 210, type: "sawtooth", duration: 0.11, volume: 0.018, start: 0.06 });
}
