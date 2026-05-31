import { TARGET_FPS } from "./config.js";
import { createScopedT, getLocale, t } from "./i18n/index.js";
import { loadBestRecord } from "./scores.js";

const PLAY_HISTORY_KEY = "perfect-ten-play-history";
const MAX_ENTRIES = 100;

const ht = createScopedT("history");

/**
 * @typedef {{
 *   playNumber: number,
 *   score: number,
 *   survivalFrames: number,
 *   maxComboLevel: number,
 *   perfectClearCount: number,
 *   reasonKey: string,
 *   playedAt: number,
 * }} PlayEntry
 */

/**
 * @typedef {{
 *   totalPlays: number,
 *   entries: PlayEntry[],
 * }} PlayHistoryStore
 */

/** @returns {PlayHistoryStore} */
function loadStore() {
  try {
    const raw = localStorage.getItem(PLAY_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const totalPlays =
        typeof parsed?.totalPlays === "number" && parsed.totalPlays >= 0
          ? parsed.totalPlays
          : 0;
      const entries = Array.isArray(parsed?.entries)
        ? parsed.entries.filter(isValidEntry)
        : [];
      return { totalPlays, entries };
    }
  } catch (_e) {}
  return { totalPlays: 0, entries: [] };
}

/** @param {unknown} entry @returns {entry is PlayEntry} */
function isValidEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  const e = /** @type {Record<string, unknown>} */ (entry);
  return (
    typeof e.playNumber === "number" &&
    e.playNumber > 0 &&
    typeof e.score === "number" &&
    e.score >= 0 &&
    typeof e.survivalFrames === "number" &&
    e.survivalFrames >= 0 &&
    typeof e.maxComboLevel === "number" &&
    e.maxComboLevel >= 0 &&
    typeof e.perfectClearCount === "number" &&
    e.perfectClearCount >= 0 &&
    typeof e.reasonKey === "string" &&
    typeof e.playedAt === "number"
  );
}

/** @param {PlayHistoryStore} store */
function saveStore(store) {
  try {
    localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(store));
  } catch (_e) {}
}

/** @param {number} frames */
export function formatSurvivalTime(frames) {
  const totalSeconds = Math.floor(frames / TARGET_FPS);
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** @param {number} level */
function formatComboLevel(level) {
  if (level <= 0) return "-";
  return String(level);
}

/** @param {number} ts */
function formatPlayedAt(ts) {
  const locale = getLocale() === "ko" ? "ko-KR" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

/**
 * @param {Omit<PlayEntry, "playNumber" | "playedAt">} run
 * @returns {PlayEntry}
 */
export function appendPlayRun(run) {
  const store = loadStore();
  const playNumber = store.totalPlays + 1;
  /** @type {PlayEntry} */
  const entry = {
    playNumber,
    playedAt: Date.now(),
    ...run,
  };

  store.totalPlays = playNumber;
  store.entries = [entry, ...store.entries].slice(0, MAX_ENTRIES);
  saveStore(store);
  return entry;
}

/** @returns {PlayEntry[]} */
export function loadPlayHistory() {
  return loadStore().entries;
}

/** @returns {number} */
export function getTotalPlayCount() {
  return loadStore().totalPlays;
}

/** @param {ReturnType<typeof loadBestRecord>} best @param {PlayEntry} entry */
function isCurrentBestScore(best, entry) {
  return best.score > 0 && entry.score === best.score;
}

/** @param {ReturnType<typeof loadBestRecord>} best @param {PlayEntry} entry */
function isCurrentBestCombo(best, entry) {
  return best.maxComboLevel > 0 && entry.maxComboLevel === best.maxComboLevel;
}

/** @param {ReturnType<typeof loadBestRecord>} best @param {PlayEntry} entry */
function isCurrentBestTime(best, entry) {
  return best.survivalFrames > 0 && entry.survivalFrames === best.survivalFrames;
}

/** @param {string} label @param {boolean} isNew @param {string} kind */
function renderStatLabel(label, isNew, kind) {
  if (!isNew) return `<dt>${label}</dt>`;
  return `<dt><span class="history-entry__badge history-entry__badge--${kind}">${label}</span></dt>`;
}

/** @param {PlayEntry} entry @param {ReturnType<typeof loadBestRecord>} best */
function renderEntry(entry, best) {
  const showBestScore = isCurrentBestScore(best, entry);
  const showBestCombo = isCurrentBestCombo(best, entry);
  const showBestTime = isCurrentBestTime(best, entry);

  return `
    <article class="history-entry">
      <header class="history-entry__head">
        <span class="history-entry__play">${ht("playNumber", { n: entry.playNumber })}</span>
        <time class="history-entry__date" datetime="${new Date(entry.playedAt).toISOString()}">${formatPlayedAt(entry.playedAt)}</time>
      </header>
      <dl class="history-entry__stats">
        <div class="history-entry__stat">
          ${renderStatLabel(
            showBestScore ? ht("newBestScore") : ht("colScore"),
            showBestScore,
            "score",
          )}
          <dd class="history-entry__value history-entry__value--score">${entry.score.toLocaleString()}</dd>
        </div>
        <div class="history-entry__stat">
          ${renderStatLabel(
            showBestCombo ? ht("newBestCombo") : ht("colCombo"),
            showBestCombo,
            "combo",
          )}
          <dd class="history-entry__value history-entry__value--combo">${formatComboLevel(entry.maxComboLevel)}</dd>
        </div>
        <div class="history-entry__stat">
          ${renderStatLabel(
            showBestTime ? ht("newBestTime") : ht("colTime"),
            showBestTime,
            "time",
          )}
          <dd class="history-entry__value history-entry__value--time">${formatSurvivalTime(entry.survivalFrames)}</dd>
        </div>
        <div class="history-entry__stat">
          <dt>${ht("colClear")}</dt>
          <dd class="history-entry__value history-entry__value--clear">${entry.perfectClearCount}</dd>
        </div>
      </dl>
    </article>
  `;
}

function renderBestRecords() {
  const best = loadBestRecord();

  return `
    <div class="history-best">
      <h3 class="history-best__title">${ht("bestRecords")}</h3>
      <div class="history-best__rows">
        <div class="history-best__row">
          <span class="history-best__label">${t("result.bestScore")}</span>
          <span class="history-best__value history-best__value--score">${best.score.toLocaleString()}</span>
        </div>
        <div class="history-best__row">
          <span class="history-best__label">${t("result.bestCombo")}</span>
          <span class="history-best__value history-best__value--combo">${formatComboLevel(best.maxComboLevel)}</span>
        </div>
        <div class="history-best__row">
          <span class="history-best__label">${t("result.bestTime")}</span>
          <span class="history-best__value history-best__value--time">${formatSurvivalTime(best.survivalFrames)}</span>
        </div>
      </div>
    </div>
  `.trim();
}

export function renderPlayHistory() {
  const body = document.getElementById("history-modal__body");
  const bestEl = document.getElementById("history-modal__best");
  if (!body || !bestEl) return;

  const entries = loadPlayHistory();
  const totalPlays = getTotalPlayCount();
  const summary = document.getElementById("history-modal__summary");
  const hasPlays = totalPlays > 0;

  if (summary) {
    summary.textContent =
      totalPlays > 0 ? ht("totalPlays", { count: totalPlays }) : "";
  }

  if (hasPlays) {
    bestEl.innerHTML = renderBestRecords();
    bestEl.classList.remove("hidden");
  } else {
    bestEl.innerHTML = "";
    bestEl.classList.add("hidden");
  }

  if (entries.length === 0) {
    body.innerHTML = hasPlays
      ? ""
      : `<p class="history-empty">${ht("empty")}</p>`;
    return;
  }

  const best = loadBestRecord();
  body.innerHTML = `<div class="history-list">${entries.map((entry) => renderEntry(entry, best)).join("")}</div>`;
}
