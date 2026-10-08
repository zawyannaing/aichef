// Browser Web Audio API synthesizer for timer alerts and notifications
export function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a friendly 3-tone chime (E5 -> G5 -> C6)
    const tones = [659.25, 783.99, 1046.5];
    const startTime = ctx.currentTime;

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.18);

      gain.gain.setValueAtTime(0, startTime + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.3, startTime + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.18 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.18);
      osc.stop(startTime + idx * 0.18 + 0.5);
    });
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
}

export function playTickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Ignore audio restrictions
  }
}
