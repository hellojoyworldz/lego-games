const RESET_KEYS = ["perfect-ten-best-record", "perfect-ten-play-history"];

/** 플레이 기록·최고 기록 localStorage 삭제 */
export function clearAllGameStorage() {
  try {
    for (const key of RESET_KEYS) localStorage.removeItem(key);
  } catch (_e) {}
}
