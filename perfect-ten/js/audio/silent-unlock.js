export function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

const SOUND_PREF_KEY = "perfect-ten-sound-enabled";

/** 이전에 🔊 켠 적 있으면 true, 🔇 저장했으면 false */
export function readSoundEnabledPref() {
  try {
    const pref = localStorage.getItem(SOUND_PREF_KEY);
    if (pref === "0") return false;
    if (pref === "1") return true;
  } catch (_e) {}
  return null;
}

export function saveSoundEnabledPref(enabled) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
  } catch (_e) {}
}

/** 기본 🔊 ON. 사용자가 🔇 눌러 저장한 경우만 음소거 */
export function defaultMutedOnLoad() {
  const pref = readSoundEnabledPref();
  if (pref === false) return true;
  return false;
}
