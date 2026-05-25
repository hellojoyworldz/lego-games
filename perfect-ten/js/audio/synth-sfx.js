/**
 * Web Audio 합성 기반 범용 효과음 + 콤보 샘플
 * @param {ReturnType<typeof import('./engine.js').createAudioEngine>} audio
 */
export function createSynthSfx(audio) {
  const COMBO_SAMPLE_URL = new URL(
    "../../assets/audio/combo.mp3",
    import.meta.url,
  );

  /** @type {AudioBuffer|null} */
  let comboBuffer = null;
  /** @type {Promise<AudioBuffer|null>|null} */
  let comboLoadPromise = null;

  async function loadComboBuffer(audioCtx) {
    if (comboBuffer) return comboBuffer;
    if (!comboLoadPromise) {
      comboLoadPromise = (async () => {
        try {
          const response = await fetch(COMBO_SAMPLE_URL.href);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.arrayBuffer();
          comboBuffer = await audioCtx.decodeAudioData(data.slice(0));
          return comboBuffer;
        } catch (e) {
          comboLoadPromise = null;
          console.warn("콤보 샘플 로드 실패:", e);
          return null;
        }
      })();
    }
    return comboLoadPromise;
  }

  async function preloadCombo() {
    const audioCtx = await audio.ensureRunning();
    if (!audioCtx) return;
    await loadComboBuffer(audioCtx);
  }

  /**
   * @param {AudioContext} audioCtx
   * @param {number} pitchUp
   * @param {number} now
   */
  function playComboSynthLayers(audioCtx, pitchUp, now) {
    // 통통 튀는 보잉 (구슬 튕김 느낌)
    const boing = audioCtx.createOscillator();
    const boingGain = audioCtx.createGain();
    boing.type = "sine";
    boing.frequency.setValueAtTime(620 * pitchUp, now);
    boing.frequency.exponentialRampToValueAtTime(320 * pitchUp, now + 0.07);
    boing.frequency.exponentialRampToValueAtTime(540 * pitchUp, now + 0.16);
    boingGain.gain.setValueAtTime(0, now);
    boingGain.gain.linearRampToValueAtTime(0.3, now + 0.012);
    boingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    boing.connect(boingGain).connect(audioCtx.destination);
    boing.start(now);
    boing.stop(now + 0.22);
    audio.scheduleCleanup([boing, boingGain], 350);

    // 마림바 아르페지오 (tap/pop과 같은 sine 계열)
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, idx) => {
      const t = now + idx * 0.05;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * pitchUp, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
      audio.scheduleCleanup([osc, gain], 400);
    });

    // 짧은 팝 글로시 (sparkle)
    [1567.98, 1975.53].forEach((f, idx) => {
      const t = now + 0.14 + idx * 0.04;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f * pitchUp, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
      audio.scheduleCleanup([osc, gain], 300);
    });
  }

  /**
   * @param {AudioContext} audioCtx
   * @param {number} pitchUp
   * @param {number} now
   */
  async function playComboSample(audioCtx, pitchUp) {
    const buffer = await loadComboBuffer(audioCtx);
    if (!buffer) return;

    const now = audioCtx.currentTime;
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = pitchUp;
    gain.gain.setValueAtTime(0.9, now);
    source.connect(gain).connect(audioCtx.destination);
    source.start(now);
    audio.scheduleCleanup(
      [source, gain],
      Math.ceil((buffer.duration / pitchUp) * 1000) + 100,
    );
  }

  /** @param {string} type @param {number} [selectCount] @param {number} [pitchUpOverride] */
  async function play(type, selectCount = 1, pitchUpOverride) {
    try {
      if (audio.isMuted() || document.hidden) return;

      const audioCtx = await audio.ensureRunning();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      if (type === "tap") {
        const scale = [
          261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99,
        ];
        const freq = scale[Math.min(selectCount - 1, scale.length - 1)];

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain).connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, now);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);
        osc.start();
        osc.stop(now + 0.13);
        audio.scheduleCleanup([osc, gain], 300);
      } else if (type === "pop") {
        const freqs = [392.0, 493.88, 587.33, 783.99];
        freqs.forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain).connect(audioCtx.destination);
          osc.frequency.setValueAtTime(f, now + i * 0.03);
          osc.type = "triangle";
          gain.gain.setValueAtTime(0.22, now + i * 0.03);
          gain.gain.linearRampToValueAtTime(0, now + 0.25 + i * 0.03);
          osc.start(now + i * 0.03);
          osc.stop(now + 0.35);
          audio.scheduleCleanup([osc, gain], 600);
        });
      } else if (type === "combo") {
        const pitchUp = pitchUpOverride ?? 1;
        playComboSynthLayers(audioCtx, pitchUp, now);
        await playComboSample(audioCtx, pitchUp);
      } else if (type === "fail") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain).connect(audioCtx.destination);
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.25);
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start();
        osc.stop(now + 0.3);
        audio.scheduleCleanup([osc, gain], 500);
      } else if (type === "perfect") {
        const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        melody.forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain).connect(audioCtx.destination);
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.18, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0, now + 0.4 + i * 0.08);
          osc.start(now + i * 0.08);
          osc.stop(now + 0.8);
          audio.scheduleCleanup([osc, gain], 1200);
        });
      } else if (type === "tapestop") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain).connect(audioCtx.destination);
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(50, now + 1.2);
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.2);
        osc.start();
        osc.stop(now + 1.3);
        audio.scheduleCleanup([osc, gain], 1500);
      }
    } catch (e) {
      console.warn("사운드 연주 장애:", e);
    }
  }

  return { play, preloadCombo };
}
