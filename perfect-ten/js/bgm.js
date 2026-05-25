import {
  BASS_PATTERN,
  MAX_TIME,
  BGM_URGENT_TIME,
  BGM_PANIC_TIME,
} from "./config.js";

/**
 * Chain 10 전용 BGM (시간 압박에 따라 BPM·필터 가변)
 * @param {ReturnType<typeof import('./audio/engine.js').createAudioEngine>} audio
 * @param {{ getGameActive: () => boolean, getTimeLeft: () => number }} state
 */
export function createChain10Bgm(audio, state) {
  let bgmTimeout = null;
  let currentStep = 0;

  function shouldPlay() {
    return !audio.isMuted() && state.getGameActive();
  }

  function playDetunedBass(frequency, duration, volume = 0.15) {
    if (!shouldPlay()) return;

    const audioCtx = audio.getContext();
    if (!audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";

    const timeRatio = Math.max(
      0,
      Math.min(1, (MAX_TIME - state.getTimeLeft()) / MAX_TIME),
    );
    filter.frequency.setValueAtTime(320 + timeRatio * 450, now);
    filter.Q.setValueAtTime(3.5, now);
    filter.connect(audioCtx.destination);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    gainNode.connect(filter);

    const osc1 = audioCtx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(frequency, now);
    osc1.detune.setValueAtTime(-8, now);
    osc1.connect(gainNode);

    const osc2 = audioCtx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(frequency, now);
    osc2.detune.setValueAtTime(8, now);
    osc2.connect(gainNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    audio.scheduleCleanup(
      [osc1, osc2, gainNode, filter],
      (duration + 0.2) * 1000,
    );
  }

  function playTickingHat(pitch, duration, volume = 0.03) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(pitch, now);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(8000, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);
      osc.start(now);
      osc.stop(now + duration);
      audio.scheduleCleanup([osc, gain, filter], (duration + 0.2) * 1000);
    } catch (_e) {}
  }

  function playTritoneAlarm(volume = 0.08) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.38);
      gain.connect(audioCtx.destination);

      const osc1 = audioCtx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.connect(gain);

      const osc2 = audioCtx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(739.99, now);
      osc2.connect(gain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.38);
      osc2.stop(now + 0.38);
      audio.scheduleCleanup([osc1, osc2, gain], 600);
    } catch (_e) {}
  }

  function playSubKick(volume = 0.22) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain).connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(10, now + 0.18);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
      audio.scheduleCleanup([osc, gain], 400);
    } catch (_e) {}
  }

  function start() {
    if (bgmTimeout) clearTimeout(bgmTimeout);

    function runLoop() {
      if (!state.getGameActive()) {
        stop();
        return;
      }

      if (audio.isMuted()) {
        bgmTimeout = setTimeout(runLoop, 300);
        return;
      }

      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") {
        bgmTimeout = setTimeout(runLoop, 200);
        return;
      }

      const timeRatio = Math.max(
        0,
        Math.min(1, (MAX_TIME - state.getTimeLeft()) / MAX_TIME),
      );
      const bpm = 120 + timeRatio * 65;
      const stepDuration = 60 / bpm / 2;

      let note = BASS_PATTERN[currentStep % BASS_PATTERN.length];
      if (state.getTimeLeft() < BGM_URGENT_TIME) {
        note *= 0.75;
      }

      playDetunedBass(note, stepDuration * 0.95, 0.14);

      const isOffbeat = currentStep % 2 !== 0;
      const hatVol = 0.02 + timeRatio * 0.05;
      playTickingHat(
        isOffbeat ? 9000 : 7000,
        0.04,
        isOffbeat ? hatVol * 1.6 : hatVol,
      );

      if (state.getTimeLeft() < BGM_URGENT_TIME && currentStep % 8 === 0) {
        playTritoneAlarm(0.09);
      }

      if (state.getTimeLeft() < BGM_PANIC_TIME && currentStep % 4 === 0) {
        playSubKick(0.25);
      }

      currentStep++;
      bgmTimeout = setTimeout(runLoop, stepDuration * 1000);
    }

    runLoop();
  }

  function stop() {
    if (bgmTimeout) {
      clearTimeout(bgmTimeout);
      bgmTimeout = null;
    }
  }

  function resetStep() {
    currentStep = 0;
  }

  return { start, stop, resetStep };
}
