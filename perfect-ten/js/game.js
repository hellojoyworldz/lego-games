import { setupCanvas } from "./canvas/setup.js";
import { createAudioEngine } from "./audio/engine.js";
import { createSynthSfx } from "./audio/synth-sfx.js";
import { triggerHaptic } from "./haptics.js";
import { createChain10Bgm } from "./bgm.js";
import {
  BALL_RADIUS,
  GRAVITY,
  FRICTION,
  RESTITUTION,
  DEADLINE_Y,
  COLOR_MAP,
  INITIAL_TIME,
  MAX_TIME,
  TARGET_FPS,
  POP_REWARDS,
  PERFECT_CLEAR_SCORE,
  PERFECT_CLEAR_TIME,
  COMBO_RESET,
  COMBO_START_AFTER,
  COMBO_DISPLAY_SUFFIX,
  COMBO_PITCH_START,
  COMBO_PITCH_STEP,
  COMBO_PITCH_MAX,
  PERFECT_PITCH_START,
  PERFECT_PITCH_STEP,
  PERFECT_PITCH_MAX,
  FEVER_COMBO_INTERVAL,
  FEVER_COUNTDOWN_SECONDS,
  FEVER_GOLDEN_SCORE,
  FEVER_SPAWN_INTERVAL,
  FEVER_METEOR_SPAWN_INTERVAL,
  GOLDEN_TEN_COLOR,
  GOLDEN_TEN_GLOW,
  BONUS_SURVIVAL_INTERVAL,
  BONUS_COUNTDOWN_SECONDS,
  BONUS_PITCH,
  PENALTY_DURATION,
  STACK_OVER_LIMIT,
  STACK_SETTLED_VELOCITY,
  DANGER_TIME_THRESHOLD,
  HURRY_UP_PITCH,
  HURRY_UP_PLAY_EVERY,
  TIME_DECAY_SCALE,
  ADD_BALL_COUNT,
  MATCH_SPAWN_COUNT,
  ADD_BALL_STAGGER,
  ADD_BALL_BLOCK_MARGIN,
  HINT_DURATION,
  HINT_COOLDOWN,
  HINT_IDLE_TIME,
} from "./config.js";

function bindAppHeight() {
  const update = () => {
    const h = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty(
      "--app-height",
      `${Math.round(h)}px`,
    );
  };
  update();
  window.addEventListener("resize", update);
  window.visualViewport?.addEventListener("resize", update);
  window.visualViewport?.addEventListener("scroll", update);
}
bindAppHeight();

const { canvas, ctx, getDisplaySize, resize } = setupCanvas(
  document.getElementById("gameCanvas"),
);

const screens = {
  intro: document.getElementById("screen-intro"),
  playing: document.getElementById("screen-playing"),
  result: document.getElementById("screen-result"),
};

const pauseOverlay = document.getElementById("pause-overlay");
const btnPause = document.getElementById("btn-pause");
const tutorialBtn = document.getElementById("btn-tutorial");
const tutorialModal = document.getElementById("tutorial-modal");
const gameContainer = document.getElementById("game-container");
const feverOverlay = document.getElementById("fever-overlay");
const feverTitle = document.getElementById("fever-title");
const feverCountdownEl = document.getElementById("fever-countdown");
const feverVignette = document.getElementById("fever-vignette");
const timeBonusOverlay = document.getElementById("time-bonus-overlay");
const timeBonusTitle = document.getElementById("time-bonus-title");
const timeBonusCountdownEl = document.getElementById("time-bonus-countdown");
const timerBar = document.getElementById("timer-bar");
const timerTrack = document.querySelector(".hud__timer-track");

const EQUATION_STATES = [
  "equation--idle",
  "equation--ready",
  "equation--success",
  "equation--over",
  "equation--hint",
  "equation--warning",
];

/** @param {HTMLElement} el @param {string} state */
function setEquationState(el, state) {
  el.classList.remove(...EQUATION_STATES);
  el.classList.add(`equation--${state}`);
}

/** @param {'intro'|'playing'|'result'} name */
function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle("hidden", key !== name);
  }
  tutorialBtn?.classList.toggle("hidden", name === "playing");
  gameContainer?.classList.toggle("game-container--intro", name === "intro");
  closeTutorialModal();
  if (name !== "playing") {
    hidePauseOverlay();
    gamePaused = false;
  }
  if (name === "playing") {
    resize();
  }
}

function openTutorialModal() {
  tutorialModal?.classList.remove("hidden");
}

function closeTutorialModal() {
  tutorialModal?.classList.add("hidden");
}

function showPauseOverlay() {
  pauseOverlay.classList.remove("hidden");
}

function hidePauseOverlay() {
  pauseOverlay.classList.add("hidden");
}

function pauseGame() {
  if (!gameActive || gamePaused || gameEndingState) return;

  gamePaused = true;
  showPauseOverlay();
  stopBgmEngine();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  balls.forEach((b) => {
    b.selected = false;
  });
  selectedBalls = [];
  updateEquation();
}

function resumeGame() {
  if (!gameActive || !gamePaused || gameEndingState) return;

  audio.primeFromGesture();
  gamePaused = false;
  hidePauseOverlay();
  lastTime = 0;
  startBgmEngine();
  animationFrameId = requestAnimationFrame(loop);
}

function quitGame() {
  if (!gameActive || gameEndingState) return;

  gamePaused = false;
  hidePauseOverlay();
  gameActive = false;
  gameEndingState = true;

  stopBgmEngine();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  showResultScreen("You quit the game.");
}

const audio = createAudioEngine();
const sfx = createSynthSfx(audio);
audio.bindMuteButton("btn-mute");

let balls = [];
let selectedBalls = [];
let particles = [];
let floatingTexts = [];

let score = 0;
let timeLeft = INITIAL_TIME;
let gameActive = false;
let gamePaused = false;
let gameEndingState = false;
let animationFrameId = null;
let playTime = 0;
let lastTime = 0;
let penaltyTime = 0;
let matchStreak = 0; // 연속 10 성공 횟수
let maxComboLevel = 0; // 달성한 최대 콤보 단계
let comboResetTimer = 0;
let stackOverTime = 0;
let hintCooldown = 0;
let idleSinceMatch = 0;
let hintedBalls = [];
let pendingAddSpawns = 0;
let feverActive = false;
/** @type {'play'|null} */
let feverPhase = null;
let feverTimer = 0;
let feverCountdownStep = FEVER_COUNTDOWN_SECONDS;
let feverTier = 1;
let feverSpawnCooldown = 0;
let feverMeteorCooldown = 0;
/** @type {MeteorStreak[]} */
let meteorStreaks = [];
let timeBonusActive = false;
let timeBonusTimer = 0;
let timeBonusCountdownStep = BONUS_COUNTDOWN_SECONDS;
let lastTimeBonusTier = 0;
let pendingTimeBonus = false;
let dangerZoneEnterCount = 0;
let wasInDangerTime = false;

const bgm = createChain10Bgm(audio, {
  getGameActive: () => gameActive && !gamePaused,
  getTimeLeft: () => timeLeft,
  getFeverActive: () => feverActive,
  getFeverTier: () => feverTier,
  getTimeBonusActive: () => timeBonusActive,
});

function playSfx(type, selectCount = 1) {
  if (type === "combo") {
    sfx.play(type, selectCount, getComboSfxPitchUp(selectCount));
    return;
  }
  if (type === "perfect") {
    sfx.play(type, selectCount, getPerfectSfxPitchUp(selectCount));
    return;
  }
  if (type === "hurryUp") {
    sfx.play(type, 1, HURRY_UP_PITCH);
    return;
  }
  if (type === "bonus") {
    sfx.play(type, 1, BONUS_PITCH);
    return;
  }
  sfx.play(type, selectCount);
}

function startBgmEngine() {
  bgm.start();
}

function stopBgmEngine() {
  bgm.stop();
}

function updateDangerVoice() {
  const inDangerTime =
    !feverActive && !timeBonusActive && timeLeft < DANGER_TIME_THRESHOLD;

  if (!inDangerTime) {
    wasInDangerTime = false;
    return;
  }

  if (wasInDangerTime) return;

  wasInDangerTime = true;
  dangerZoneEnterCount++;

  if (dangerZoneEnterCount % HURRY_UP_PLAY_EVERY === 1) {
    playSfx("hurryUp");
  }
}

// 폭죽 스파크 입자 모델
class PopParticle {
  constructor(x, y, color, isRainbow = false) {
    this.x = x;
    this.y = y;
    this.color = isRainbow ? `hsl(${Math.random() * 360}, 100%, 65%)` : color;
    const angle = Math.random() * Math.PI * 2;
    const speed = isRainbow ? 3 + Math.random() * 8 : 2 + Math.random() * 5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = isRainbow ? 2 + Math.random() * 5 : 1.5 + Math.random() * 3.5;
    this.alpha = 1.0;
    this.decay = 0.02 + Math.random() * 0.02;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // 중력 낙하
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// FEVER 유성우 스트릭
class MeteorStreak {
  constructor(displayWidth) {
    this.x = Math.random() * displayWidth * 1.15 - displayWidth * 0.08;
    this.y = -20 - Math.random() * 140;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = 11 + Math.random() * 16;
    this.width = 1.5 + Math.random() * 3;
    this.alpha = 0.75 + Math.random() * 0.25;
    this.decay = 0.003 + Math.random() * 0.004;
    this.color = Math.random() > 0.25 ? GOLDEN_TEN_GLOW : "#FFFFFF";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.lineCap = "round";

    const tailX = this.x - this.vx * 7;
    const tailY = this.y - this.vy * 3.5;
    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, "rgba(255, 215, 0, 0)");
    grad.addColorStop(0.45, this.color);
    grad.addColorStop(1, "#FFFFFF");

    ctx.strokeStyle = grad;
    ctx.lineWidth = this.width;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.shadowBlur = 20;
    ctx.shadowColor = GOLDEN_TEN_COLOR;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width + 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 부드럽게 둥둥 떠오르는 성과 수치 피드백 텍스트
class FloatingText {
  constructor(x, y, text, color, isBig = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -1.8;
    this.alpha = 1.0;
    this.isBig = isBig;
  }
  update() {
    this.y += this.vy;
    this.alpha -= 0.02;
  }
  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = this.isBig ? "900 28px sans-serif" : "bold 18px sans-serif";
    ctx.fillStyle = this.color;
    ctx.textAlign = "center";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#000000";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// 숫자 구슬 물리 모델
class Ball {
  constructor(x, y, number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -Math.random() * 1.5;
    this.radius = BALL_RADIUS;
    this.number = number;
    this.color = COLOR_MAP[number];
    this.selected = false;
    this.pulseTimer = 0;
    this.hintGlowTimer = 0;
    this.droppingFromAdd = false;
    this.isGoldenTen = false;
    this.isTimeBonusFive = false;
    this.timeBonusOriginalNumber = null;
    this.goldenPulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.vy += GRAVITY;
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    const { width: displayWidth, height: displayHeight } = getDisplaySize();

    // 좌우 벽 통통 바운드
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx * RESTITUTION;
    } else if (this.x + this.radius > displayWidth) {
      this.x = displayWidth - this.radius;
      this.vx = -this.vx * RESTITUTION;
    }

    // 바닥 밀착 반사 바운드
    if (this.y + this.radius > displayHeight) {
      this.y = displayHeight - this.radius;
      this.vy = -this.vy * RESTITUTION;
    }
  }

  draw() {
    ctx.save();
    ctx.beginPath();

    let visualRadius = this.radius;

    if (this.isGoldenTen) {
      this.goldenPulse += 0.14;
      const glow = 0.55 + Math.sin(this.goldenPulse) * 0.2;
      visualRadius *= 1.05 + Math.sin(this.goldenPulse) * 0.04;
      ctx.shadowBlur = 24;
      ctx.shadowColor = `rgba(255, 215, 0, ${glow})`;
      ctx.fillStyle = GOLDEN_TEN_COLOR;
    } else if (this.isTimeBonusFive) {
      this.goldenPulse += 0.12;
      const glow = 0.45 + Math.sin(this.goldenPulse) * 0.18;
      visualRadius *= 1.04 + Math.sin(this.goldenPulse) * 0.03;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(167, 139, 250, ${glow})`;
      ctx.fillStyle = COLOR_MAP[5];
    } else if (this.selected) {
      this.pulseTimer += 0.25;
      const scaleFactor = 1.12 + Math.sin(this.pulseTimer) * 0.05;
      visualRadius *= scaleFactor;

      ctx.shadowBlur = 22;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.color;
    }

    ctx.arc(this.x, this.y, visualRadius, 0, Math.PI * 2);
    ctx.fill();

    // 가벼운 캔디 하이라이트 (중앙 숫자 영역은 덜 덮음)
    const grad = ctx.createRadialGradient(
      this.x - visualRadius * 0.42,
      this.y - visualRadius * 0.42,
      visualRadius * 0.08,
      this.x,
      this.y,
      visualRadius,
    );
    if (this.isGoldenTen || this.isTimeBonusFive || this.selected) {
      grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    } else {
      grad.addColorStop(0, "rgba(255, 255, 255, 0.38)");
      grad.addColorStop(0.42, "rgba(255, 255, 255, 0.06)");
      grad.addColorStop(0.78, "rgba(255, 255, 255, 0)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, visualRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (this.hintGlowTimer > 0) {
      const pulse = 1 + Math.sin(this.hintGlowTimer * 0.22) * 0.08;
      const ringRadius = visualRadius * pulse + 8;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.55 + Math.sin(this.hintGlowTimer * 0.18) * 0.35})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#FBBF24";
      ctx.stroke();
      ctx.restore();
    }

    // 숫자 서체 렌더링 (구슬 반지름에 비례해 크기 조정)
    const fontSize = Math.round(visualRadius * 1.15);
    const label = String(this.number);
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;

    if (this.selected) {
      ctx.fillStyle = "#050508";
      ctx.fillText(label, this.x, this.y + 1);
    } else {
      ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.1));
      ctx.strokeStyle = "rgba(20, 20, 28, 0.42)";
      ctx.fillStyle = "#ffffff";
      ctx.strokeText(label, this.x, this.y + 1);
      ctx.fillText(label, this.x, this.y + 1);
    }

    if (this.isGoldenTen) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, visualRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.isTimeBonusFive) {
      ctx.strokeStyle = "rgba(196, 181, 253, 0.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, visualRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// 구슬 탄성체 격돌 처리 물리 분산 공식
function resolveCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];

      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = b1.radius + b2.radius;

      if (distance < minDist) {
        const overlap = minDist - distance;
        const nx = dx / (distance || 1);
        const ny = dy / (distance || 1);

        b1.x -= nx * overlap * 0.5;
        b1.y -= ny * overlap * 0.5;
        b2.x += nx * overlap * 0.5;
        b2.y += ny * overlap * 0.5;

        const kx = b1.vx - b2.vx;
        const ky = b1.vy - b2.vy;
        const p = (2 * (nx * kx + ny * ky)) / 2;

        b1.vx -= p * nx * RESTITUTION;
        b1.vy -= p * ny * RESTITUTION;
        b2.vx += p * nx * RESTITUTION;
        b2.vy += p * ny * RESTITUTION;
      }
    }
  }
}

// 특정 좌표 혹은 무작위 낙하선상에 구슬 생성
function spawnBall(customX = null, customY = null, { fromAdd = false } = {}) {
  const displayWidth = getDisplaySize().width;
  const margin = BALL_RADIUS * 2;
  const x =
    customX !== null
      ? customX
      : margin + Math.random() * (displayWidth - margin * 2);
  const y = customY !== null ? customY : -BALL_RADIUS * 2;
  const number = Math.floor(Math.random() * 9) + 1;
  const ball = new Ball(x, y, number);
  ball.droppingFromAdd = fromAdd;
  if (timeBonusActive) {
    convertBallToTimeBonusFive(ball);
  }
  balls.push(ball);
  if (fromAdd) {
    pendingAddSpawns = Math.max(0, pendingAddSpawns - 1);
  }
}

// 그리드형 예쁜 정렬 초기 셋업
function initField() {
  balls = [];
  selectedBalls = [];
  particles = [];
  floatingTexts = [];

  clearHint();
  hintCooldown = 0;
  idleSinceMatch = 0;
  pendingAddSpawns = 0;

  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;

  const cols = 5;
  const rows = 4;
  const startX = displayWidth / 2 - (cols - 1) * BALL_RADIUS * 1.1;
  const startY = displayHeight - 250;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = (r % 2) * BALL_RADIUS * 0.55;
      const x = startX + c * BALL_RADIUS * 2.2 + offset;
      const y = startY + r * BALL_RADIUS * 1.8;
      spawnBall(x, y);
    }
  }
}

// 합이 10이 되는 구슬 조합 탐색 (적은 개수 우선)
function findHintCombination() {
  const pool = balls.filter((b) => !b.selected);
  const maxSize = Math.min(5, pool.length);

  for (let size = 2; size <= maxSize; size++) {
    const combo = searchCombination(pool, size, 0, [], 0);
    if (combo) return combo;
  }
  return null;
}

function searchCombination(pool, targetSize, start, picked, sum) {
  if (picked.length === targetSize) {
    return sum === 10 ? picked : null;
  }
  if (sum >= 10) return null;

  for (let i = start; i <= pool.length - (targetSize - picked.length); i++) {
    const next = [...picked, pool[i]];
    const nextSum = sum + pool[i].number;
    if (nextSum > 10) continue;

    const found = searchCombination(pool, targetSize, i + 1, next, nextSum);
    if (found) return found;
  }
  return null;
}

function clearHint() {
  balls.forEach((b) => {
    b.hintGlowTimer = 0;
  });
  hintedBalls = [];
}

function updateHintButtonState() {
  const btn = document.getElementById("btn-hint");
  if (!btn) return;
  btn.disabled =
    !gameActive ||
    gamePaused ||
    feverActive ||
    timeBonusActive ||
    penaltyTime > 0 ||
    hintCooldown > 0 ||
    balls.length < 2;
}

function isAddBallDropping() {
  if (pendingAddSpawns > 0) return true;
  return balls.some((b) => b.droppingFromAdd);
}

function hasAddBallLanded(b) {
  const { height } = getDisplaySize();
  const onFloor = b.y + b.radius >= height - STACK_SETTLED_VELOCITY;
  const onPile =
    b.y > DEADLINE_Y + BALL_RADIUS &&
    Math.abs(b.vy) < STACK_SETTLED_VELOCITY &&
    Math.abs(b.vx) < STACK_SETTLED_VELOCITY;
  return onFloor || onPile;
}

function releaseAddBallDrops() {
  for (const b of balls) {
    if (b.droppingFromAdd && hasAddBallLanded(b)) {
      b.droppingFromAdd = false;
    }
  }
}

// 쌓인 더미 최상단 (낙하 중인 구슬·화면 밖 구슬 제외)
function getPileHeadTop() {
  let headTop = Infinity;
  for (const b of balls) {
    if (b.y + b.radius <= 0) continue;
    const top = b.y - b.radius;
    if (top < DEADLINE_Y && b.vy > STACK_SETTLED_VELOCITY) continue;
    headTop = Math.min(headTop, top);
  }
  return headTop;
}

function isPileNearLimit() {
  if (stackOverTime > 0) return true;

  const headTop = getPileHeadTop();
  if (!Number.isFinite(headTop)) return false;

  return headTop <= DEADLINE_Y + ADD_BALL_BLOCK_MARGIN;
}

function isStackTooFullForAddBall() {
  return isAddBallDropping() || isPileNearLimit();
}

function updateAddBallButtonState() {
  const btn = document.getElementById("btn-add-ball");
  if (!btn) return;

  const dropping = isAddBallDropping();
  const stackFull = isPileNearLimit();
  const blocked =
    !gameActive ||
    gamePaused ||
    gameEndingState ||
    feverActive ||
    timeBonusActive ||
    penaltyTime > 0 ||
    dropping ||
    stackFull;

  btn.disabled = blocked;
  if (dropping) {
    btn.title = "Marbles are dropping…";
  } else if (stackFull) {
    btn.title = "Too many marbles stacked";
  } else {
    btn.title = "Add marbles";
  }
}

function updatePlayDockButtons() {
  updateHintButtonState();
  updateAddBallButtonState();

  const shuffleBtn = document.getElementById("btn-shuffle");
  const pauseBtn = document.getElementById("btn-pause");
  const dockBlocked =
    feverActive ||
    timeBonusActive ||
    !gameActive ||
    gamePaused ||
    gameEndingState ||
    penaltyTime > 0;
  if (shuffleBtn) shuffleBtn.disabled = dockBlocked;
  if (pauseBtn) pauseBtn.disabled = dockBlocked;
}

function showHint(isAuto = false) {
  if (
    !gameActive ||
    gamePaused ||
    feverActive ||
    timeBonusActive ||
    penaltyTime > 0 ||
    hintCooldown > 0
  )
    return false;

  const combo = findHintCombination();
  if (!combo) {
    if (!isAuto) {
      const eqDiv = document.getElementById("equation");
      eqDiv.innerText = "No combo to 10 right now";
      setEquationState(eqDiv, "warning");
      setTimeout(updateEquation, 1500);
    }
    return false;
  }

  clearHint();
  hintedBalls = combo;
  combo.forEach((b) => {
    b.hintGlowTimer = HINT_DURATION;
  });

  hintCooldown = HINT_COOLDOWN;
  idleSinceMatch = 0;
  updatePlayDockButtons();

  const nums = combo.map((b) => b.number);
  const eqDiv = document.getElementById("equation");
  eqDiv.innerText = `💡 ${nums.join(" + ")} = 10`;
  setEquationState(eqDiv, "hint");

  const centroidX = combo.reduce((acc, b) => acc + b.x, 0) / combo.length;
  const centroidY = combo.reduce((acc, b) => acc + b.y, 0) / combo.length;
  floatingTexts.push(
    new FloatingText(
      centroidX,
      centroidY - 20,
      isAuto ? "Hint!" : "💡 HINT",
      "#FBBF24",
    ),
  );

  playSfx("tap", Math.min(nums.length, 5));
  triggerHaptic("tap");

  setTimeout(
    () => {
      if (selectedBalls.length === 0) updateEquation();
    },
    HINT_DURATION * (1000 / TARGET_FPS),
  );

  return true;
}

// 타격감 쉐이커 발동기
function triggerScreenShake(isHeavy = false) {
  const container = document.getElementById("game-container");
  container.classList.remove("shake");
  void container.offsetWidth; // 리플로우 가동
  container.classList.add("shake");

  setTimeout(
    () => {
      container.classList.remove("shake");
    },
    isHeavy ? 350 : 150,
  );
}

// 수식 및 계산 문자열 업데이트
function updateEquation() {
  const eqDiv = document.getElementById("equation");
  if (selectedBalls.length === 0) {
    if (timeBonusActive) {
      eqDiv.innerText = `TIME BONUS ${timeBonusCountdownStep}`;
      setEquationState(eqDiv, "hint");
      return;
    }
    eqDiv.innerHTML = "Waiting";
    setEquationState(eqDiv, "idle");
    return;
  }

  const nums = selectedBalls.map((b) => b.number);
  const sum = nums.reduce((a, b) => a + b, 0);
  const text = nums.join(" + ") + ` = [ ${sum} ]`;

  eqDiv.innerText = text;

  if (sum === 10) {
    setEquationState(eqDiv, "success");
  } else if (sum > 10) {
    setEquationState(eqDiv, "over");
  } else {
    setEquationState(eqDiv, "ready");
  }
}

// 영예로운 퍼펙트 클리어 시그널 작동기
function triggerPerfectClear() {
  playSfx("perfect");
  triggerHaptic("perfect");
  triggerScreenShake(true);

  score += PERFECT_CLEAR_SCORE;
  document.getElementById("score").innerText = score;

  timeLeft = Math.min(timeLeft + PERFECT_CLEAR_TIME, MAX_TIME);

  // 무지개 폭포 파티클 다발 생성
  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;
  for (let i = 0; i < 60; i++) {
    particles.push(
      new PopParticle(
        Math.random() * displayWidth,
        Math.random() * (displayHeight / 2),
        "#fff",
        true,
      ),
    );
  }

  // 빅 배너 화면 드롭인 노출 연출
  const banner = document.getElementById("perfect-banner");
  banner.classList.add("perfect-banner--show");
  setTimeout(() => {
    banner.classList.remove("perfect-banner--show");
  }, 2500);

  // 화면 중앙 정중앙 명예 점수판 비주얼 표기
  floatingTexts.push(
    new FloatingText(
      displayWidth / 2,
      displayHeight / 2,
      `PERFECT!!! +${PERFECT_CLEAR_SCORE.toLocaleString()}`,
      "#FBBF24",
      true,
    ),
  );
  floatingTexts.push(
    new FloatingText(
      displayWidth / 2,
      displayHeight / 2 + 35,
      `TIME +${PERFECT_CLEAR_TIME / TARGET_FPS}s`,
      "#34D399",
      true,
    ),
  );

  // 퍼펙트 클리어의 대쾌감 이후 새로운 구슬 정렬 세트를 산뜻하게 폭포 스폰
  setTimeout(() => {
    initField();
  }, 600);
}

function formatMaxComboDisplay(maxLevel) {
  if (maxLevel <= 0) return "-";
  return formatComboDisplay(maxLevel);
}

/** @param {number} streak 연속 10 성공 횟수 */
function getComboLevel(streak) {
  return streak > COMBO_START_AFTER ? streak - COMBO_START_AFTER : 0;
}

function showResultScreen(reason) {
  document.getElementById("gameover-reason").innerText = reason;
  document.getElementById("final-score").innerText = score;
  document.getElementById("final-max-combo").innerText =
    formatMaxComboDisplay(maxComboLevel);
  document.getElementById("final-time").innerText =
    document.getElementById("survival-time").innerText;
  showScreen("result");
}

function formatComboDisplay(comboLevel) {
  if (comboLevel <= 0) return COMBO_DISPLAY_SUFFIX;
  return `${comboLevel}${COMBO_DISPLAY_SUFFIX}`;
}

/** FEVER 구간마다 콤보 SFX pitch를 1부터 다시 올림 (7콤보→리셋→8콤보=1콤보 pitch) */
function getComboPitchLevel(comboLevel) {
  if (comboLevel <= 0) return 0;
  return ((comboLevel - 1) % FEVER_COMBO_INTERVAL) + 1;
}

function getComboPitchSteps(comboLevel) {
  return Math.max(getComboPitchLevel(comboLevel) - 1, 0);
}

function applyComboPitchCap(value) {
  return COMBO_PITCH_MAX == null ? value : Math.min(value, COMBO_PITCH_MAX);
}

function applyPerfectPitchCap(value) {
  return PERFECT_PITCH_MAX == null ? value : Math.min(value, PERFECT_PITCH_MAX);
}

function getComboSfxPitchUp(comboLevel) {
  const rate =
    COMBO_PITCH_START + getComboPitchSteps(comboLevel) * COMBO_PITCH_STEP;
  return applyComboPitchCap(Math.max(rate, 0.5));
}

/** @param {number} [tier] FEVER 단계 (1=10콤보, 2=20콤보…) */
function getPerfectSfxPitchUp(tier = 1) {
  const steps = Math.max(tier - 1, 0);
  const rate = PERFECT_PITCH_START + steps * PERFECT_PITCH_STEP;
  return applyPerfectPitchCap(Math.max(rate, 0.5));
}

function updateComboPopupText(comboLevel) {
  const text = formatComboDisplay(comboLevel);
  const popupText = document.getElementById("combo-popup-text");
  popupText.querySelector(".combo-popup-text__stroke").textContent = text;
  popupText.querySelector(".combo-popup-text__fill").textContent = text;
  popupText.classList.toggle("combo-popup-text--long", text.length > 6);
}

// 콤보 달성 시 축하 팝업 (2연속 이상)
function triggerComboCelebration(combo) {
  triggerHaptic("combo");
  playSfx("combo", combo);
  updateComboPopupText(combo);

  const popup = document.getElementById("combo-popup");
  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;

  popup.classList.remove("combo-popup--show");
  void popup.offsetWidth;
  popup.classList.add("combo-popup--show");

  for (let i = 0; i < 30; i++) {
    particles.push(
      new PopParticle(
        displayWidth / 2 + (Math.random() - 0.5) * 40,
        displayHeight / 2 - 50 + (Math.random() - 0.5) * 40,
        "#fff",
        true,
      ),
    );
  }

  setTimeout(() => {
    popup.classList.remove("combo-popup--show");
  }, 800);
}

function shouldTriggerFever(comboLevel) {
  return (
    comboLevel >= FEVER_COMBO_INTERVAL &&
    comboLevel % FEVER_COMBO_INTERVAL === 0
  );
}

function resetFeverState() {
  feverActive = false;
  feverPhase = null;
  feverTimer = 0;
  feverCountdownStep = FEVER_COUNTDOWN_SECONDS;
  feverTier = 1;
  feverSpawnCooldown = 0;
  feverMeteorCooldown = 0;
  meteorStreaks = [];
  feverOverlay?.classList.add("hidden");
  feverOverlay?.classList.remove("fever-overlay--play");
  feverVignette?.classList.remove("fever-vignette--active");
  gameContainer?.classList.remove("game-container--fever");
  timerBar?.classList.remove("timer-bar--frozen", "timer-bar--danger");
  timerTrack?.classList.remove("hud__timer-track--frozen");
}

function convertBallToGoldenTen(ball) {
  ball.number = 10;
  ball.isGoldenTen = true;
  ball.color = GOLDEN_TEN_COLOR;
  ball.selected = false;
  ball.hintGlowTimer = 0;
}

function convertAllBallsToGoldenTen() {
  balls.forEach(convertBallToGoldenTen);
}

function spawnGoldenTenBall() {
  const displayWidth = getDisplaySize().width;
  const margin = BALL_RADIUS * 2;
  const x = margin + Math.random() * (displayWidth - margin * 2);
  const ball = new Ball(x, -BALL_RADIUS * 2, 10);
  convertBallToGoldenTen(ball);
  ball.vy = 2.5 + Math.random() * 2;
  balls.push(ball);
}

function spawnMeteorStreaks(count = 1) {
  const displayWidth = getDisplaySize().width;
  for (let i = 0; i < count; i++) {
    meteorStreaks.push(new MeteorStreak(displayWidth));
  }
}

function burstFeverMeteors(count = 24) {
  spawnMeteorStreaks(count);
}

function syncFeverOverlay() {
  if (!feverOverlay) return;

  if (!feverActive) {
    feverOverlay.classList.add("hidden");
    feverOverlay.classList.remove("fever-overlay--play");
    return;
  }

  feverOverlay.classList.remove("hidden");
  feverOverlay.classList.add("fever-overlay--play");
  feverTitle?.classList.remove("hidden");
  if (feverTitle) feverTitle.textContent = "PERFECT TEN!";
  feverCountdownEl?.classList.remove("hidden");
  if (feverCountdownEl) {
    feverCountdownEl.textContent = String(feverCountdownStep);
    feverCountdownEl.classList.remove("fever-overlay__countdown--pop");
    void feverCountdownEl.offsetWidth;
    feverCountdownEl.classList.add("fever-overlay__countdown--pop");
  }
}

function updateFeverEquation() {
  const eqDiv = document.getElementById("equation");
  if (!eqDiv || feverPhase !== "play") return;

  eqDiv.innerText = `Tap golden 10! ${feverCountdownStep}`;
  setEquationState(eqDiv, "success");
}

function setTimerFrozenUI(frozen) {
  timerBar?.classList.toggle("timer-bar--frozen", frozen);
  timerTrack?.classList.toggle("hud__timer-track--frozen", frozen);
  if (frozen) {
    timerBar?.classList.remove("timer-bar--danger");
  }
}

function startPerfectTenFever(comboLevel) {
  feverActive = true;
  feverPhase = "play";
  feverCountdownStep = FEVER_COUNTDOWN_SECONDS;
  feverTimer = TARGET_FPS;
  feverTier = Math.max(1, Math.floor(comboLevel / FEVER_COMBO_INTERVAL));
  feverSpawnCooldown = 0;
  pendingAddSpawns = 0;
  selectedBalls = [];
  clearHint();

  convertAllBallsToGoldenTen();
  for (let i = 0; i < 3; i++) {
    spawnGoldenTenBall();
  }
  burstFeverMeteors(35);
  feverMeteorCooldown = 0;

  gameContainer?.classList.add("game-container--fever");
  feverVignette?.classList.add("fever-vignette--active");
  setTimerFrozenUI(true);
  bgm.resetStep();
  syncFeverOverlay();
  updateFeverEquation();
  playSfx("perfect", feverTier);
  triggerHaptic("perfect");
  triggerScreenShake(true);

  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;
  for (let i = 0; i < 40; i++) {
    particles.push(
      new PopParticle(
        Math.random() * displayWidth,
        Math.random() * displayHeight * 0.5,
        GOLDEN_TEN_GLOW,
        true,
      ),
    );
  }
  for (let i = 0; i < 25; i++) {
    particles.push(
      new PopParticle(
        displayWidth / 2 + (Math.random() - 0.5) * displayWidth,
        -20 + Math.random() * displayHeight * 0.3,
        "#FFFFFF",
        true,
      ),
    );
  }
}

function endPerfectTenFever() {
  balls.forEach((ball) => {
    if (!ball.isGoldenTen) return;
    ball.isGoldenTen = false;
    ball.number = Math.floor(Math.random() * 9) + 1;
    ball.color = COLOR_MAP[ball.number];
  });

  resetFeverState();
  updateEquation();

  if (pendingTimeBonus) {
    pendingTimeBonus = false;
    startTimeBonus();
  } else {
    updateTimeBonusTrigger();
  }
}

function resetTimeBonusState() {
  timeBonusActive = false;
  timeBonusTimer = 0;
  timeBonusCountdownStep = BONUS_COUNTDOWN_SECONDS;
  timeBonusOverlay?.classList.add("hidden");
  timeBonusOverlay?.classList.remove("time-bonus-overlay--play");
  gameContainer?.classList.remove("game-container--time-bonus");
  if (!feverActive) {
    timerBar?.classList.remove("timer-bar--frozen", "timer-bar--danger");
    timerTrack?.classList.remove("hud__timer-track--frozen");
  }
}

function convertBallToTimeBonusFive(ball) {
  if (ball.isGoldenTen) return;
  if (!ball.isTimeBonusFive) {
    ball.timeBonusOriginalNumber = ball.number;
  }
  ball.isTimeBonusFive = true;
  ball.number = 5;
  ball.color = COLOR_MAP[5];
  ball.selected = false;
  ball.hintGlowTimer = 0;
}

function convertAllBallsToTimeBonusFive() {
  balls.forEach(convertBallToTimeBonusFive);
}

function restoreTimeBonusBalls() {
  balls.forEach((ball) => {
    if (!ball.isTimeBonusFive) return;
    ball.isTimeBonusFive = false;
    ball.number =
      ball.timeBonusOriginalNumber ?? Math.floor(Math.random() * 9) + 1;
    ball.timeBonusOriginalNumber = null;
    ball.color = COLOR_MAP[ball.number];
  });
}

function cancelTimeBonus() {
  if (!timeBonusActive) return;
  restoreTimeBonusBalls();
  resetTimeBonusState();
}

function syncTimeBonusOverlay() {
  if (!timeBonusOverlay) return;

  if (!timeBonusActive) {
    timeBonusOverlay.classList.add("hidden");
    timeBonusOverlay.classList.remove("time-bonus-overlay--play");
    return;
  }

  timeBonusOverlay.classList.remove("hidden");
  timeBonusOverlay.classList.add("time-bonus-overlay--play");
  timeBonusTitle?.classList.remove("hidden");
  if (timeBonusTitle) timeBonusTitle.textContent = "TIME BONUS";
  timeBonusCountdownEl?.classList.remove("hidden");
  if (timeBonusCountdownEl) {
    timeBonusCountdownEl.textContent = String(timeBonusCountdownStep);
    timeBonusCountdownEl.classList.remove("time-bonus-overlay__countdown--pop");
    void timeBonusCountdownEl.offsetWidth;
    timeBonusCountdownEl.classList.add("time-bonus-overlay__countdown--pop");
  }
}

function updateTimeBonusEquation() {
  if (!timeBonusActive) return;
  updateEquation();
}

function updateTimeBonusTrigger() {
  if (timeBonusActive) return;
  const tier = Math.floor(playTime / BONUS_SURVIVAL_INTERVAL);
  if (tier <= lastTimeBonusTier) return;

  if (feverActive) {
    pendingTimeBonus = true;
    lastTimeBonusTier = tier;
    return;
  }

  lastTimeBonusTier = tier;
  startTimeBonus();
}

function startTimeBonus() {
  if (feverActive || timeBonusActive) return;

  timeBonusActive = true;
  timeBonusCountdownStep = BONUS_COUNTDOWN_SECONDS;
  timeBonusTimer = TARGET_FPS;
  pendingAddSpawns = 0;
  selectedBalls = [];
  clearHint();

  convertAllBallsToTimeBonusFive();

  gameContainer?.classList.add("game-container--time-bonus");
  setTimerFrozenUI(true);
  bgm.resetStep();
  syncTimeBonusOverlay();
  updateTimeBonusEquation();
  playSfx("bonus");
  triggerHaptic("combo");
  triggerScreenShake(false);

  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;
  for (let i = 0; i < 35; i++) {
    particles.push(
      new PopParticle(
        Math.random() * displayWidth,
        Math.random() * displayHeight * 0.55,
        i % 2 === 0 ? "#A78BFA" : COLOR_MAP[5],
        true,
      ),
    );
  }
}

function endTimeBonus() {
  restoreTimeBonusBalls();
  resetTimeBonusState();
  updateEquation();
}

function updateTimeBonusMode() {
  timeBonusTimer--;
  if (timeBonusTimer <= 0) {
    timeBonusCountdownStep--;
    if (timeBonusCountdownStep <= 0) {
      endTimeBonus();
    } else {
      timeBonusTimer = TARGET_FPS;
      syncTimeBonusOverlay();
      updateTimeBonusEquation();
    }
  }
}

function popGoldenTen(ball, index) {
  const points = FEVER_GOLDEN_SCORE * feverTier;
  score += points;
  document.getElementById("score").innerText = score;

  for (let p = 0; p < 18; p++) {
    particles.push(new PopParticle(ball.x, ball.y, GOLDEN_TEN_GLOW, p % 3 === 0));
  }
  spawnMeteorStreaks(2);
  floatingTexts.push(
    new FloatingText(ball.x, ball.y - 10, `+${points}`, "#FFD700"),
  );

  playSfx("tap");
  triggerHaptic("pop");
  balls.splice(index, 1);
}

function handleGoldenTenTap(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;
  const touchX = ((clientX - rect.left) / rect.width) * displayWidth;
  const touchY = ((clientY - rect.top) / rect.height) * displayHeight;

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    if (!b.isGoldenTen) continue;

    const dx = touchX - b.x;
    const dy = touchY - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < b.radius * 1.08) {
      popGoldenTen(b, i);
      break;
    }
  }
}

function updateFeverMode() {
  if (feverPhase !== "play") return;

  feverSpawnCooldown--;
  if (feverSpawnCooldown <= 0) {
    spawnGoldenTenBall();
    feverSpawnCooldown = FEVER_SPAWN_INTERVAL;
  }

  feverMeteorCooldown--;
  if (feverMeteorCooldown <= 0) {
    spawnMeteorStreaks(2 + Math.floor(Math.random() * 3));
    feverMeteorCooldown = FEVER_METEOR_SPAWN_INTERVAL;
  }

  feverTimer--;
  if (feverTimer <= 0) {
    feverCountdownStep--;
    if (feverCountdownStep <= 0) {
      endPerfectTenFever();
    } else {
      feverTimer = TARGET_FPS;
      syncFeverOverlay();
      updateFeverEquation();
    }
  }
}

// 정확한 10 합산 검사기
function checkSum() {
  const sum = selectedBalls.reduce((a, b) => a + b.number, 0);

  if (sum === 10) {
    const popCount = selectedBalls.length;
    matchStreak++;
    const comboLevel = getComboLevel(matchStreak);
    maxComboLevel = Math.max(maxComboLevel, comboLevel);
    comboResetTimer = COMBO_RESET;
    clearHint();
    idleSinceMatch = 0;

    // 10 맞춤 SFX (매치마다) / 콤보 SFX·팝업은 COMBO_START_AFTER 초과부터
    playSfx("pop", popCount);
    triggerHaptic("pop");
    if (comboLevel >= 1) {
      triggerComboCelebration(comboLevel);
    }

    const popReward = POP_REWARDS[popCount >= 5 ? 5 : popCount];
    const { time: rewardTime, score: baseScore } = popReward;

    const scoreMultiplier = comboLevel > 0 ? matchStreak : 1;
    const earnedScore = baseScore * scoreMultiplier;
    score += earnedScore;
    document.getElementById("score").innerText = score;

    // 타임 보너스 누적
    timeLeft = Math.min(timeLeft + rewardTime, MAX_TIME);

    // 스파크 폭발 연출 스폰
    selectedBalls.forEach((b) => {
      for (let p = 0; p < 15; p++) {
        particles.push(new PopParticle(b.x, b.y, b.color, false));
      }
    });

    // 플로팅 텍스트 띄우기
    const centroidX = selectedBalls.reduce((acc, b) => acc + b.x, 0) / popCount;
    const centroidY = selectedBalls.reduce((acc, b) => acc + b.y, 0) / popCount;

    floatingTexts.push(
      new FloatingText(centroidX, centroidY, `+${earnedScore}!`, "#FBBF24"),
    );
    floatingTexts.push(
      new FloatingText(
        centroidX,
        centroidY - 25,
        `+${(rewardTime / TARGET_FPS).toFixed(1)}s`,
        "#34D399",
      ),
    );

    // 물리 필드에서 제거
    balls = balls.filter((b) => !selectedBalls.includes(b));
    selectedBalls = [];

    if (shouldTriggerFever(comboLevel)) {
      if (timeBonusActive) {
        cancelTimeBonus();
      }
      startPerfectTenFever(comboLevel);
      updateEquation();
      return;
    }

    // 전멸 처리 되었는지 정밀 체크 -> 🌟 퍼펙트 클리어 보너스 시그널 개시!
    if (balls.length === 0) {
      triggerPerfectClear();
      updateEquation();
      return;
    }

    // 맞춤 보상: 고정 개수만큼 시차 간격으로 위에서 새로 보충
    const spawnCount = Math.max(1, Math.floor(MATCH_SPAWN_COUNT));
    for (let i = 0; i < spawnCount; i++) {
      setTimeout(() => {
        if (gameActive && !gamePaused) spawnBall();
      }, i * 160);
    }
    updateEquation();
  } else if (sum > 10) {
    // 초과 실패 처리
    triggerHaptic("fail");
    playSfx("fail");
    triggerScreenShake(false);

    selectedBalls.forEach((b) => {
      b.selected = false;
      for (let p = 0; p < 6; p++) {
        particles.push(new PopParticle(b.x, b.y, "#EF4444", false));
      }
    });

    const centroidX =
      selectedBalls.reduce((acc, b) => acc + b.x, 0) / selectedBalls.length;
    const centroidY =
      selectedBalls.reduce((acc, b) => acc + b.y, 0) / selectedBalls.length;
    floatingTexts.push(
      new FloatingText(centroidX, centroidY, `OVER 10! 💥`, "#EF4444"),
    );

    selectedBalls = [];
    matchStreak = 0; // 콤보 브레이크 리셋

    penaltyTime = PENALTY_DURATION;
  }
}

// 반응형 화면 좌표 오차 제로 보정 계산기
function handleTap(clientX, clientY) {
  if (!gameActive || gamePaused || penaltyTime > 0) return;

  if (feverActive) {
    if (feverPhase === "play") {
      handleGoldenTenTap(clientX, clientY);
    }
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;

  // 화면 물리 스냅샷 왜곡까지 완전 동화하는 소수점 절대 비율 매핑 공식
  const touchX = ((clientX - rect.left) / rect.width) * displayWidth;
  const touchY = ((clientY - rect.top) / rect.height) * displayHeight;

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    const dx = touchX - b.x;
    const dy = touchY - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < b.radius) {
      clearHint();
      if (!b.selected) {
        b.selected = true;
        b.pulseTimer = 0;
        selectedBalls.push(b);
        playSfx("tap", selectedBalls.length);
      } else {
        // 이미 누른 것 토글 취소
        b.selected = false;
        selectedBalls = selectedBalls.filter((sb) => sb !== b);
        playSfx("tap", Math.max(1, selectedBalls.length));
      }
      updateEquation();
      checkSum();
      break;
    }
  }
}

// 클릭 및 터치 이벤트 연결
canvas.addEventListener("mousedown", (e) => {
  handleTap(e.clientX, e.clientY);
});

// iOS: capture 단계에서 진동 (제스처 컨텍스트 유지)
canvas.addEventListener(
  "touchstart",
  () => {
    if (!gameActive || gamePaused || penaltyTime > 0) return;
    triggerHaptic("tap");
  },
  { capture: true, passive: true },
);

canvas.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.touches[0];
    handleTap(touch.clientX, touch.clientY);
    e.preventDefault();
  },
  { passive: false },
);

// 오버플로우 패배 선형 체크 (아래에서 쌓여 선을 넘은 구슬만 — 낙하 중인 새 구슬 제외)
function checkStackOver() {
  if (feverActive || timeBonusActive) {
    stackOverTime = 0;
    return;
  }

  const breached = balls.some((b) => {
    const top = b.y - b.radius;
    const stackedAtLine = b.y > DEADLINE_Y && top < DEADLINE_Y;
    const settled =
      Math.abs(b.vy) < STACK_SETTLED_VELOCITY &&
      Math.abs(b.vx) < STACK_SETTLED_VELOCITY;
    return stackedAtLine && settled;
  });

  if (breached) {
    stackOverTime += 1;
    if (stackOverTime > STACK_OVER_LIMIT) {
      endGame("Marbles collapsed past the limit line!");
    }
  } else {
    stackOverTime = 0;
  }
}

// 메인 프레임 렌더링 루프
function loop(timestamp) {
  if (!gameActive || gamePaused) return;

  const { width: displayWidth, height: displayHeight } = getDisplaySize();

  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // 1. 위기 상황에 따른 격렬한 쉐이킹 번역 처리
  const dangerActive =
    !feverActive && !timeBonusActive && timeLeft < DANGER_TIME_THRESHOLD;
  const dangerVignette = document.getElementById("danger-vignette");

  ctx.save();
  if (feverActive) {
    dangerVignette.style.opacity = "0";
    dangerVignette.classList.remove("pulse-danger-active");
    const pulse = 3.5 + Math.sin(timestamp / 55) * 2.5;
    ctx.translate(
      (Math.random() - 0.5) * pulse,
      (Math.random() - 0.5) * pulse,
    );
  } else if (timeBonusActive) {
    dangerVignette.style.opacity = "0";
    dangerVignette.classList.remove("pulse-danger-active");
    const pulse = 2.2 + Math.sin(timestamp / 70) * 1.6;
    ctx.translate(
      (Math.random() - 0.5) * pulse,
      (Math.random() - 0.5) * pulse,
    );
  } else if (dangerActive) {
    dangerVignette.style.opacity = "1";
    dangerVignette.classList.add("pulse-danger-active");

    // 렌더 컨텍스트 자체에 마이크로 흔들림 추가
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 2;
    ctx.translate(offsetX, offsetY);
  } else {
    dangerVignette.style.opacity = "0";
    dangerVignette.classList.remove("pulse-danger-active");
  }

  // 2. 위험 데드라인 붉은 장벽 그리기
  const warnAlpha =
    stackOverTime > 0 ? 0.4 + Math.sin(timestamp / 90) * 0.3 : 0.08;
  ctx.fillStyle = `rgba(239, 68, 68, ${warnAlpha * 0.5})`;
  ctx.fillRect(0, 0, displayWidth, DEADLINE_Y);

  ctx.strokeStyle =
    stackOverTime > 0
      ? `rgba(239, 68, 68, ${0.45 + Math.sin(timestamp / 100) * 0.35})`
      : "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, DEADLINE_Y);
  ctx.lineTo(displayWidth, DEADLINE_Y);
  ctx.stroke();
  ctx.setLineDash([]); // 원복

  if (stackOverTime > 0) {
    ctx.fillStyle = "#EF4444";
    ctx.font = "black 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WARNING! OVER THE LINE!", displayWidth / 2, DEADLINE_Y - 15);
  }

  if (feverActive) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 215, 0, 0.06)";
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.restore();
  } else if (timeBonusActive) {
    ctx.save();
    ctx.fillStyle = "rgba(167, 139, 250, 0.08)";
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.restore();
  }

  meteorStreaks.forEach((m, idx) => {
    m.update();
    m.draw();
    if (m.alpha <= 0) meteorStreaks.splice(idx, 1);
  });

  // 3. 구슬 상태 업데이트 및 전사 드로잉
  balls.forEach((b) => b.update());
  resolveCollisions();
  releaseAddBallDrops();
  balls.forEach((b) => {
    if (b.hintGlowTimer > 0) b.hintGlowTimer--;
  });
  balls.forEach((b) => b.draw());

  // 5. 부서지는 스파크 파티클 갱신
  particles.forEach((p, idx) => {
    p.update();
    p.draw();
    if (p.alpha <= 0) particles.splice(idx, 1);
  });

  // 6. 점수 피드백 텍스트 갱신
  floatingTexts.forEach((ft, idx) => {
    ft.update();
    ft.draw();
    if (ft.alpha <= 0) floatingTexts.splice(idx, 1);
  });

  // 7. 기절 패널티 프레임 차감
  if (penaltyTime > 0) penaltyTime--;

  // 7b. 힌트 쿨다운·유휴·자동 힌트
  if (hintCooldown > 0) hintCooldown--;
  if (!feverActive && !timeBonusActive && selectedBalls.length === 0 && penaltyTime === 0) {
    idleSinceMatch++;
    if (
      idleSinceMatch >= HINT_IDLE_TIME &&
      hintCooldown === 0 &&
      hintedBalls.every((b) => b.hintGlowTimer <= 0)
    ) {
      showHint(true);
    }
  }
  updatePlayDockButtons();

  // 8. 콤보 무효화 기한 차감
  if (!feverActive && comboResetTimer > 0) {
    comboResetTimer--;
    if (comboResetTimer <= 0) {
      matchStreak = 0;
    }
  }

  if (feverActive) {
    updateFeverMode();
  } else if (timeBonusActive) {
    updateTimeBonusMode();
  } else {
    const surviveInSeconds = playTime / TARGET_FPS;
    const decayScaling = 1.0 + surviveInSeconds * TIME_DECAY_SCALE;
    timeLeft -= decayScaling;
    playTime++;
    updateDangerVoice();
    updateTimeBonusTrigger();
  }

  // HUD 타이머 바 갱신
  const percent = (timeLeft / MAX_TIME) * 100;
  if (!feverActive && !timeBonusActive) {
    timerBar.style.width = `${Math.max(0, percent)}%`;
    document.getElementById("timer-text").innerText = Math.max(
      0,
      timeLeft / TARGET_FPS,
    ).toFixed(2);

    if (percent < 30) {
      timerBar.classList.add("timer-bar--danger");
    } else {
      timerBar.classList.remove("timer-bar--danger");
    }
  } else {
    setTimerFrozenUI(true);
  }

  const surviveInSeconds = playTime / TARGET_FPS;
  const m = Math.floor(surviveInSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(surviveInSeconds % 60)
    .toString()
    .padStart(2, "0");
  document.getElementById("survival-time").innerText = `${m}:${s}`;

  checkStackOver();

  ctx.restore(); // 진동 오프셋 해제 복구

  // 게임 패배 여부 체크 후 재순환
  if (!feverActive && !timeBonusActive && timeLeft <= 0) {
    endGame("Time ran out.");
  } else {
    animationFrameId = requestAnimationFrame(loop);
  }
}

// 시작 — 오디오와 무관하게 즉시 화면 전환
function startGame() {
  hidePauseOverlay();
  gamePaused = false;
  gameEndingState = false;

  showScreen("playing");

  score = 0;
  timeLeft = INITIAL_TIME;
  playTime = 0;
  gameActive = true;
  lastTime = 0;
  stackOverTime = 0;
  matchStreak = 0;
  maxComboLevel = 0;
  hintCooldown = 0;
  idleSinceMatch = 0;
  pendingAddSpawns = 0;
  dangerZoneEnterCount = 0;
  wasInDangerTime = false;
  lastTimeBonusTier = 0;
  pendingTimeBonus = false;
  resetFeverState();
  resetTimeBonusState();
  bgm.resetStep();

  document.getElementById("score").innerText = score;

  resize();
  initField();
  updateEquation();
  updatePlayDockButtons();

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(loop);
  startBgmEngine();

  queueMicrotask(() => {
    audio.primeFromGesture();
    void audio.ensureRunning().then(() => sfx.preloadVoiceSamples());
  });
}

// 게임 오버 마감 연출 (철통 보안 잠금 및 테이프 스톱 연동)
function endGame(reason) {
  if (gameEndingState) return;
  gamePaused = false;
  hidePauseOverlay();
  gameEndingState = true;
  gameActive = false;
  resetFeverState();
  resetTimeBonusState();

  stopBgmEngine();

  // 여운을 주는 마감 사운드 및 진동
  playSfx("tapestop");
  triggerHaptic("gameover");
  triggerScreenShake(true);

  const displayWidth = getDisplaySize().width;
  const displayHeight = getDisplaySize().height;

  // 남아있던 구슬들을 슬로우 모션 폭사 연출화하며 페이드아웃
  balls.forEach((b) => {
    b.vx = (Math.random() - 0.5) * 15;
    b.vy = -10 - Math.random() * 8;
  });

  let fadeAlpha = 0;
  const deathLoop = () => {
    ctx.save();
    ctx.fillStyle = `rgba(8, 8, 10, ${fadeAlpha})`;
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.restore();

    fadeAlpha += 0.015;
    if (fadeAlpha < 0.8) {
      requestAnimationFrame(deathLoop);
    } else {
      // 연출 완료 후 최종 정적 정산 창 부드럽게 표기
      showResultScreen(reason);
    }
  };
  requestAnimationFrame(deathLoop);
}

// 위에서 구슬 추가 (하단 +구슬 버튼, ADD_BALL_COUNT만큼)
function addBallFromTop() {
  if (
    !gameActive ||
    gamePaused ||
    gameEndingState ||
    penaltyTime > 0 ||
    isStackTooFullForAddBall()
  ) {
    return;
  }

  const count = Math.max(1, Math.floor(ADD_BALL_COUNT));
  const staggerMs =
    ADD_BALL_STAGGER > 0 ? (ADD_BALL_STAGGER / TARGET_FPS) * 1000 : 0;

  pendingAddSpawns += count;
  updatePlayDockButtons();

  for (let i = 0; i < count; i++) {
    if (staggerMs === 0) {
      spawnBall(null, null, { fromAdd: true });
    } else {
      setTimeout(() => {
        if (gameActive && !gamePaused) {
          spawnBall(null, null, { fromAdd: true });
        } else {
          pendingAddSpawns = Math.max(0, pendingAddSpawns - 1);
          updatePlayDockButtons();
        }
      }, i * staggerMs);
    }
  }

  playSfx("tap");
  triggerHaptic("tap");
  clearHint();
  idleSinceMatch = 0;
}

// 수동 셔플
function shuffleBalls() {
  if (!gameActive || gamePaused) return;
  playSfx("fail");
  clearHint();
  idleSinceMatch = 0;
  pendingAddSpawns = 0;
  balls.forEach((b) => {
    b.vx = (Math.random() - 0.5) * 16;
    b.vy = -8 - Math.random() * 8;
    b.selected = false;
  });
  selectedBalls = [];
  updateEquation();
}

// 스타터 바인딩 — touchstart + click (iOS/Android 공통)
function bindStartButton(id) {
  const btn = document.getElementById(id);
  if (!btn) return;

  let lastStartAt = 0;
  let touchStarted = false;

  const onStart = () => {
    const now = Date.now();
    if (now - lastStartAt < 250) return;
    lastStartAt = now;

    try {
      startGame();
    } catch (e) {
      console.error("게임 시작 실패:", e);
    }
  };

  btn.addEventListener(
    "touchstart",
    () => {
      touchStarted = true;
      onStart();
    },
    { passive: true },
  );

  btn.addEventListener("click", (e) => {
    if (touchStarted) {
      touchStarted = false;
      e.preventDefault();
      return;
    }
    onStart();
  });
}

bindStartButton("btn-start");
bindStartButton("btn-restart");

document.getElementById("btn-shuffle")?.addEventListener("click", shuffleBalls);
document
  .getElementById("btn-add-ball")
  ?.addEventListener("click", addBallFromTop);
document
  .getElementById("btn-hint")
  ?.addEventListener("click", () => showHint(false));
btnPause?.addEventListener("click", pauseGame);
document.getElementById("btn-resume")?.addEventListener("click", resumeGame);
document.getElementById("btn-quit")?.addEventListener("click", quitGame);

tutorialBtn?.addEventListener("click", () => {
  audio.primeFromGesture();
  openTutorialModal();
});
document
  .getElementById("btn-tutorial-close")
  ?.addEventListener("click", closeTutorialModal);
document
  .getElementById("tutorial-backdrop")
  ?.addEventListener("click", closeTutorialModal);

canvas.addEventListener("click", () => void audio.ensureRunning());
canvas.addEventListener("touchstart", () => void audio.ensureRunning(), {
  passive: true,
});

// 백그라운드: BGM만 끔. 일시정지는 앱 이탈(pagehide) 때만
audio.bindLifecycle({
  onSuspend() {
    stopBgmEngine();
  },
  onHidden() {
    if (gameActive && !gamePaused && !gameEndingState) {
      pauseGame();
    }
  },
  onVisible() {
    if (gameActive && !gamePaused && !gameEndingState) {
      startBgmEngine();
      void audio.ensureRunning();
    }
  },
});
