import {
  BASS_PATTERN,
  FEVER_BASS_PATTERN,
  BONUS_BASS_PATTERN,
  FEVER_BGM_BPM,
  FEVER_BGM_BPM_STEP,
  BONUS_BGM_BPM,
  MAX_TIME,
  BGM_URGENT_TIME,
  BGM_PANIC_TIME,
} from "./config.js";

/**
 * Chain 10 전용 BGM (시간 압박 / TIME BONUS / PERFECT TEN FEVER 모드)
 * @param {ReturnType<typeof import('./audio/engine.js').createAudioEngine>} audio
 * @param {{
 *   getGameActive: () => boolean,
 *   getTimeLeft: () => number,
 *   getFeverActive?: () => boolean,
 *   getFeverTier?: () => number,
 *   getTimeBonusActive?: () => boolean,
 * }} state
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

  function playFeverBass(frequency, duration, volume = 0.17) {
    if (!shouldPlay()) return;

    const audioCtx = audio.getContext();
    if (!audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(audioCtx.destination);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    gainNode.connect(filter);

    const osc1 = audioCtx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(frequency, now);
    osc1.detune.setValueAtTime(-5, now);
    osc1.connect(gainNode);

    const harmGain = audioCtx.createGain();
    harmGain.gain.setValueAtTime(volume * 0.22, now);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
    harmGain.connect(filter);

    const osc2 = audioCtx.createOscillator();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(frequency * 2, now);
    osc2.detune.setValueAtTime(4, now);
    osc2.connect(harmGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    audio.scheduleCleanup(
      [osc1, osc2, gainNode, harmGain, filter],
      (duration + 0.2) * 1000,
    );
  }

  function playFeverStab(volume = 0.11) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];

      freqs.forEach((f, i) => {
        const t = now + i * 0.018;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
        audio.scheduleCleanup([osc, gain], 300);
      });
    } catch (_e) {}
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

  function playFeverKick(volume = 0.3) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain).connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
      audio.scheduleCleanup([osc, gain], 300);
    } catch (_e) {}
  }

  function playFeverClap(volume = 0.15) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const length = Math.floor(audioCtx.sampleRate * 0.06);
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const env = 1 - i / length;
        data[i] = (Math.random() * 2 - 1) * env * env;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(0.8, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      source.connect(filter).connect(gain).connect(audioCtx.destination);
      source.start(now);
      source.stop(now + 0.08);
      audio.scheduleCleanup([source, filter, gain], 150);
    } catch (_e) {}
  }

  function playFeverSnare(volume = 0.12) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const length = Math.floor(audioCtx.sampleRate * 0.08);
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const env = 1 - i / length;
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      const tone = audioCtx.createOscillator();
      const toneGain = audioCtx.createGain();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(180, now);
      toneGain.gain.setValueAtTime(volume * 0.5, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      tone.connect(toneGain).connect(audioCtx.destination);
      tone.start(now);
      tone.stop(now + 0.06);

      source.connect(filter).connect(gain).connect(audioCtx.destination);
      source.start(now);
      source.stop(now + 0.1);
      audio.scheduleCleanup([source, filter, gain, tone, toneGain], 200);
    } catch (_e) {}
  }

  function getFeverBpm() {
    const tier = Math.max(1, state.getFeverTier?.() ?? 1);
    return FEVER_BGM_BPM + (tier - 1) * FEVER_BGM_BPM_STEP;
  }

  function runFeverLoop(stepDuration) {
    const note =
      FEVER_BASS_PATTERN[currentStep % FEVER_BASS_PATTERN.length];
    playFeverBass(note, stepDuration * 0.88, 0.2);

    playTickingHat(10000 + (currentStep % 3) * 900, 0.028, 0.09);
    if (currentStep % 2 !== 0) {
      playTickingHat(13000, 0.02, 0.06);
    }

    playFeverKick(currentStep % 2 === 0 ? 0.34 : 0.26);

    if (currentStep % 2 === 0) {
      playFeverStab(0.13);
    }

    if (currentStep % 4 === 2) {
      playFeverClap(0.16);
    }

    if (currentStep % 4 === 0) {
      playFeverSnare(0.11);
    }

    if (currentStep % 8 === 0) {
      playFeverStab(0.15);
      playTickingHat(14000, 0.015, 0.1);
    }

    currentStep++;
    bgmTimeout = setTimeout(runLoop, stepDuration * 1000);
  }

  function playBonusMelody(frequency, duration, volume = 0.11) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(0.6, now);
      filter.connect(audioCtx.destination);

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gainNode.connect(filter);

      const osc = audioCtx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, now);
      osc.detune.setValueAtTime(6, now);
      osc.connect(gainNode);

      const shimmer = audioCtx.createOscillator();
      const shimmerGain = audioCtx.createGain();
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(frequency * 2, now);
      shimmerGain.gain.setValueAtTime(volume * 0.18, now);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.55);
      shimmer.connect(shimmerGain).connect(filter);

      osc.start(now);
      shimmer.start(now);
      osc.stop(now + duration);
      shimmer.stop(now + duration);
      audio.scheduleCleanup(
        [osc, shimmer, gainNode, shimmerGain, filter],
        (duration + 0.2) * 1000,
      );
    } catch (_e) {}
  }

  function playBonusBounce(volume = 0.14) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain).connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(72, now + 0.1);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
      audio.scheduleCleanup([osc, gain], 250);
    } catch (_e) {}
  }

  function playBonusTwinkle(frequency, volume = 0.06) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      audio.scheduleCleanup([osc, gain], 300);
    } catch (_e) {}
  }

  function playBonusShaker(volume = 0.035) {
    if (!shouldPlay()) return;

    try {
      const audioCtx = audio.getContext();
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const length = Math.floor(audioCtx.sampleRate * 0.05);
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const env = 1 - i / length;
        data[i] = (Math.random() * 2 - 1) * env * env;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(5000, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      source.connect(filter).connect(gain).connect(audioCtx.destination);
      source.start(now);
      source.stop(now + 0.06);
      audio.scheduleCleanup([source, filter, gain], 120);
    } catch (_e) {}
  }

  function runBonusLoop(stepDuration) {
    const note =
      BONUS_BASS_PATTERN[currentStep % BONUS_BASS_PATTERN.length];
    playBonusMelody(note, stepDuration * 0.92, 0.1);

    if (currentStep % 2 === 0) {
      playBonusBounce(0.12);
    }

    if (currentStep % 4 === 1) {
      playBonusShaker(0.03);
    }

    if (currentStep % 4 === 3) {
      playBonusTwinkle(note * 2, 0.055);
    }

    if (currentStep % 8 === 0) {
      playBonusTwinkle(1318.51, 0.07);
      playBonusTwinkle(1567.98, 0.05);
    }

    currentStep++;
    bgmTimeout = setTimeout(runLoop, stepDuration * 1000);
  }

  function runNormalLoop(stepDuration) {
    const timeRatio = Math.max(
      0,
      Math.min(1, (MAX_TIME - state.getTimeLeft()) / MAX_TIME),
    );

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

    if (state.getFeverActive?.()) {
      const bpm = getFeverBpm();
      const stepDuration = 60 / bpm / 2;
      runFeverLoop(stepDuration);
      return;
    }

    if (state.getTimeBonusActive?.()) {
      const stepDuration = 60 / BONUS_BGM_BPM / 2;
      runBonusLoop(stepDuration);
      return;
    }

    const timeRatio = Math.max(
      0,
      Math.min(1, (MAX_TIME - state.getTimeLeft()) / MAX_TIME),
    );
    const bpm = 120 + timeRatio * 65;
    const stepDuration = 60 / bpm / 2;
    runNormalLoop(stepDuration);
  }

  function start() {
    if (bgmTimeout) clearTimeout(bgmTimeout);
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
