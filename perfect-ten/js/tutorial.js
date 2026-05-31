import {
  TARGET_FPS,
  MATCH,
  COMBO,
  FEVER,
  TIME_BONUS,
  STACK,
  FIELD,
} from "./config.js";
import { createScopedT, getLocale } from "./i18n/index.js";

const tt = createScopedT("tutorial");

/** @param {number} frames */
function secLabel(frames) {
  const s = frames / TARGET_FPS;
  return Number.isInteger(s) ? String(s) : s.toFixed(1).replace(/\.0$/, "");
}

/** @param {number} n */
function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const mod10 = n % 10;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

/** @param {number} n @returns {string} 콤보 시작 n (3 → "3rd" / "3번째") */
function comboStartLabel(n) {
  if (getLocale() === "ko") return `${n}번째`;
  return ordinal(n);
}

/** @param {number} streak @returns {string} */
function streakLabelForExample(streak) {
  if (getLocale() === "ko") return `${streak}연속`;
  return `${ordinal(streak)} consecutive 10`;
}

/** 콤보 팝업이 뜨는 연속 성공 번호 (startAfter=2 → 3번째) */
const comboPopupAtSuccess = COMBO.startAfter + 1;

/** @returns {Record<string, string | number>} */
function popRewardTableParams() {
  const r = MATCH.popRewards;
  const fmt = (n) => n.toLocaleString();
  return {
    s2: fmt(r[2].score),
    t2: secLabel(r[2].time),
    s3: fmt(r[3].score),
    t3: secLabel(r[3].time),
    s4: fmt(r[4].score),
    t4: secLabel(r[4].time),
    s5: fmt(r[5].score),
    t5: secLabel(r[5].time),
  };
}

/** @returns {{ title: string, items: string[], compact?: boolean }[]} */
export function getTutorialSections() {
  const feverTier2Pts = FEVER.goldenScore * 2;
  const feverTier3Pts = FEVER.goldenScore * 3;
  const comboExampleBase = MATCH.popRewards[4].score;
  const comboExampleStreak = 5;
  const comboExampleTotal = comboExampleBase * comboExampleStreak;

  return [
    {
      title: tt("basicRules.title"),
      items: [
        tt("basicRules.item1"),
        tt("basicRules.item2"),
        tt("basicRules.item3"),
      ],
    },
    {
      title: tt("score.title"),
      items: [
        tt("score.item1"),
        tt("score.item2", popRewardTableParams()),
        tt("score.item3", {
          score: MATCH.perfectClear.score.toLocaleString(),
          sec: secLabel(MATCH.perfectClear.time),
        }),
      ],
    },
    {
      title: tt("combo.title"),
      items: [
        tt("combo.item1", {
          startLabel: comboStartLabel(comboPopupAtSuccess),
        }),
        tt("combo.item2", { sec: secLabel(COMBO.reset) }),
        tt("combo.item3"),
        tt("combo.item4", {
          marbles: comboExampleStreak,
          base: comboExampleBase.toLocaleString(),
          streakLabel: streakLabelForExample(comboExampleStreak),
          total: comboExampleTotal.toLocaleString(),
        }),
      ],
    },
    {
      title: tt("fever.title"),
      items: [
        tt("fever.item1", { interval: FEVER.comboInterval }),
        tt("fever.item2", { sec: FEVER.countdownSeconds }),
        tt("fever.item3"),
        tt("fever.item4", {
          golden: FEVER.goldenScore,
          interval: FEVER.comboInterval,
          tier2: feverTier2Pts,
          tier3: feverTier3Pts,
        }),
      ],
    },
    {
      title: tt("timeBonus.title"),
      items: [
        tt("timeBonus.item1", {
          sec: secLabel(TIME_BONUS.survivalInterval),
        }),
        tt("timeBonus.item2", {
          countdown: TIME_BONUS.countdownSeconds,
        }),
        tt("timeBonus.item3", { score: TIME_BONUS.matchScore }),
        tt("timeBonus.item4"),
      ],
    },
    {
      title: tt("gameOver.title"),
      items: [
        tt("gameOver.item1"),
        tt("gameOver.item2", { sec: secLabel(STACK.overLimit) }),
      ],
    },
    {
      title: tt("controls.title"),
      compact: true,
      items: [
        tt("controls.hint"),
        tt("controls.balls", { count: FIELD.addBall.count }),
        tt("controls.shuffle"),
        tt("controls.pause"),
      ],
    },
  ];
}

export function renderTutorial() {
  const body = document.getElementById("tutorial-modal__body");
  const title = document.getElementById("tutorial-title");
  const closeBtn = document.getElementById("btn-tutorial-close");
  if (title) title.textContent = tt("title");
  if (closeBtn) closeBtn.textContent = tt("ok");
  if (!body) return;

  body.innerHTML = getTutorialSections()
    .map(
      (section) => `
        <section class="tutorial-section">
          <h3 class="tutorial-section__title">${section.title}</h3>
          <ul class="tutorial-list${section.compact ? " tutorial-list--compact" : ""}">
            ${section.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      `,
    )
    .join("");
}
