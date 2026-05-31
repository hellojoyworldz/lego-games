const BEST_RECORD_KEY = "perfect-ten-best-record";

/** @returns {{ score: number, maxComboLevel: number, survivalFrames: number }} */
export function loadBestRecord() {
  try {
    const raw = localStorage.getItem(BEST_RECORD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const score =
        typeof parsed?.score === "number" && parsed.score >= 0
          ? parsed.score
          : 0;
      const maxComboLevel =
        typeof parsed?.maxComboLevel === "number" && parsed.maxComboLevel >= 0
          ? parsed.maxComboLevel
          : 0;
      const survivalFrames =
        typeof parsed?.survivalFrames === "number" && parsed.survivalFrames >= 0
          ? parsed.survivalFrames
          : 0;
      return { score, maxComboLevel, survivalFrames };
    }
  } catch (_e) {}
  return { score: 0, maxComboLevel: 0, survivalFrames: 0 };
}

/**
 * 이번 판 기록과 비교해 더 높은 항목만 localStorage에 반영.
 * @param {{ score: number, maxComboLevel: number, survivalFrames: number }} run
 * @returns {{
 *   isNewBestScore: boolean,
 *   isNewBestCombo: boolean,
 *   isNewBestTime: boolean,
 *   bestScore: number,
 *   bestMaxCombo: number,
 *   bestSurvivalFrames: number,
 * }}
 */
export function updateBestRecord(run) {
  const previous = loadBestRecord();
  const isNewBestScore = run.score > previous.score;
  const isNewBestCombo = run.maxComboLevel > previous.maxComboLevel;
  const isNewBestTime = run.survivalFrames > previous.survivalFrames;
  const next = {
    score: isNewBestScore ? run.score : previous.score,
    maxComboLevel: isNewBestCombo ? run.maxComboLevel : previous.maxComboLevel,
    survivalFrames: isNewBestTime
      ? run.survivalFrames
      : previous.survivalFrames,
    updatedAt: Date.now(),
  };

  if (isNewBestScore || isNewBestCombo || isNewBestTime) {
    try {
      localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(next));
    } catch (_e) {}
  }

  return {
    isNewBestScore,
    isNewBestCombo,
    isNewBestTime,
    bestScore: next.score,
    bestMaxCombo: next.maxComboLevel,
    bestSurvivalFrames: next.survivalFrames,
  };
}
