import { isIOSDevice } from "./silent-unlock.js";

const SILENT_MP3_URL = new URL("../../assets/audio/silent.mp3", import.meta.url);

/**
 * iOS 무음 스위치 우회 (unmute 패턴)
 * - 포그라운드 + Web Audio 재생 중: silent mp3 루프로 미디어 채널 활성화
 * - 백그라운드/화면 이탈: audio 요소 제거 → 알림 미디어 UI·끊김 방지
 * @see https://github.com/swevans/unmute
 */
export function createIOSSilentChannel() {
  /** @type {HTMLAudioElement|null} */
  let channelTag = null;

  function destroyChannel() {
    if (!channelTag) return;

    try {
      channelTag.pause();
      channelTag.removeAttribute("src");
      channelTag.load();
      channelTag.remove();
    } catch (_e) {}

    channelTag = null;
  }

  function ensureElement() {
    if (channelTag) return channelTag;

    channelTag = document.createElement("audio");
    channelTag.src = SILENT_MP3_URL.href;
    channelTag.loop = true;
    channelTag.preload = "auto";
    channelTag.volume = 1;
    channelTag.setAttribute("playsinline", "");
    channelTag.setAttribute("webkit-playsinline", "");
    channelTag.hidden = true;
    document.body.appendChild(channelTag);
    return channelTag;
  }

  /** 사용자 제스처 핸들러 안에서 동기 호출 */
  function startFromGesture() {
    if (!isIOSDevice() || document.hidden) return;

    const el = ensureElement();
    if (!el.paused) return;

    void el.play().catch(() => {
      destroyChannel();
    });
  }

  function stopForBackground() {
    destroyChannel();
  }

  return { startFromGesture, stopForBackground };
}
