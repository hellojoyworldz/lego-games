import { defaultMutedOnLoad, saveSoundEnabledPref } from "./silent-unlock.js";
import { createIOSSilentChannel } from "./ios-silent-channel.js";

const AudioCtx = window.AudioContext || window.webkitAudioContext;

function clearSystemMediaUI() {
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  } catch (_e) {}
}

export function createAudioEngine() {
  /** @type {AudioContext|null} */
  let audioCtx = null;
  let isMuted = defaultMutedOnLoad();
  let isUnlocked = false;
  const iosSilent = createIOSSilentChannel();

  function canPlay() {
    return !isMuted && !document.hidden;
  }

  function playSilentUnlock() {
    if (isUnlocked || !audioCtx || audioCtx.state !== "running") return;

    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.onended = () => source.disconnect();
    source.start(0);
    isUnlocked = true;
  }

  function startIOSSilentChannel() {
    if (isMuted || document.hidden) return;
    iosSilent.startFromGesture();
  }

  function stopIOSSilentChannel() {
    iosSilent.stopForBackground();
    clearSystemMediaUI();
  }

  /**
   * 사용자 제스처 핸들러 안에서 동기 호출 — resume() 시작만 (게임 시작 막지 않음)
   */
  function primeFromGesture() {
    if (isMuted) return;

    startIOSSilentChannel();

    try {
      if (!AudioCtx) return;

      if (!audioCtx) {
        audioCtx = new AudioCtx();
      }

      if (audioCtx.state === "suspended") {
        void audioCtx.resume().then(() => {
          if (audioCtx?.state === "running") {
            playSilentUnlock();
            startIOSSilentChannel();
          }
        });
      } else if (audioCtx.state === "running") {
        playSilentUnlock();
      }
    } catch (e) {
      console.warn("오디오 priming 실패:", e);
    }
  }

  /**
   * 제스처 후 오디오 완료 대기 (재개 버튼 등 — 게임 시작에는 사용하지 않음)
   * @returns {Promise<AudioContext|null>}
   */
  async function unlockFromGesture() {
    primeFromGesture();
    if (isMuted || !audioCtx) return audioCtx;
    if (audioCtx.state === "running") return audioCtx;

    try {
      await Promise.race([
        audioCtx.resume(),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);
      if (audioCtx.state === "running") {
        playSilentUnlock();
        startIOSSilentChannel();
      }
    } catch (e) {
      console.warn("오디오 unlock 실패:", e);
    }

    return audioCtx;
  }

  async function ensureRunning() {
    if (isMuted) return audioCtx;
    if (document.hidden) return audioCtx;

    try {
      if (!AudioCtx) return null;

      if (!audioCtx) {
        audioCtx = new AudioCtx();
      }

      if (audioCtx.state === "running") {
        playSilentUnlock();
        startIOSSilentChannel();
        return audioCtx;
      }

      await audioCtx.resume();

      if (audioCtx.state === "running") {
        playSilentUnlock();
        startIOSSilentChannel();
      }
    } catch (e) {
      console.warn("오디오 resume 실패:", e);
    }

    return audioCtx;
  }

  function suspend() {
    stopIOSSilentChannel();
    if (audioCtx?.state === "running") {
      void audioCtx.suspend();
    }
  }

  /** @param {{ onSuspend?: () => void, onHidden?: () => void, onVisible?: () => void }} [handlers] */
  function bindLifecycle(handlers = {}) {
    let suspendTimer = null;

    const runSuspend = () => {
      suspend();
      handlers.onSuspend?.();
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearTimeout(suspendTimer);
        suspendTimer = setTimeout(runSuspend, 250);
        return;
      }

      clearTimeout(suspendTimer);
      handlers.onVisible?.();
    });

    window.addEventListener("pagehide", () => {
      clearTimeout(suspendTimer);
      runSuspend();
      handlers.onHidden?.();
    });
  }

  function init() {
    clearSystemMediaUI();
    return ensureRunning();
  }

  function resumeIfNeeded() {
    if (canPlay() && audioCtx?.state === "suspended") {
      void ensureRunning();
    }
  }

  function getContext() {
    return audioCtx;
  }

  function isContextRunning() {
    return audioCtx?.state === "running";
  }

  function setMuted(muted) {
    isMuted = muted;
    saveSoundEnabledPref(!muted);
    if (muted) {
      stopIOSSilentChannel();
    }
  }

  function toggleMute() {
    setMuted(!isMuted);
    return isMuted;
  }

  function syncMuteButton(btn) {
    btn.innerText = isMuted ? "🔇" : "🔊";
    syncMuteTooltip();
  }

  function syncMuteTooltip() {
    const tooltip = document.getElementById("tooltip-mute");
    if (!tooltip) return;
    tooltip.textContent = isMuted ? "Sound OFF!" : "Sound ON!";
  }

  /** @param {string} buttonId */
  function bindMuteButton(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    syncMuteButton(btn);

    const onToggle = async () => {
      const willUnmute = isMuted;
      toggleMute();
      syncMuteButton(btn);
      if (willUnmute) {
        await unlockFromGesture();
      }
    };

    btn.addEventListener("click", () => void onToggle());
  }

  /** @param {AudioNode[]} nodes @param {number} delayMs */
  function scheduleCleanup(nodes, delayMs) {
    setTimeout(() => {
      nodes.forEach((node) => {
        try {
          node.disconnect();
        } catch (_e) {}
      });
    }, delayMs);
  }

  clearSystemMediaUI();

  return {
    init,
    unlockFromGesture,
    primeFromGesture,
    ensureRunning,
    suspend,
    bindLifecycle,
    resumeIfNeeded,
    getContext,
    isContextRunning,
    canPlay,
    isMuted: () => isMuted,
    setMuted,
    toggleMute,
    bindMuteButton,
    scheduleCleanup,
  };
}
