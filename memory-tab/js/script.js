// 상수
const GRID_COLS = 4; // 가로 개수
const GRID_ROWS = 5; // 세로 개수
const BASE_TIME = 10 * 1000; // 기본 시간
const MAX_TIME = 5 * 60 * 1000; // 최대 시간을 기본 시간과 동일하게 설정
const TIME_PENALTY = 2 * 1000; // 틀릴 때 감소
const TIME_REWARD = 7 * 1000; // 맞출 때 증가
const SHOW_INTERVAL = 150; // 캐릭터 보여주는 간격
const CLICK_ANIMATION_DURATION = 200; // 클릭 애니메이션 지속 시간
const WRONG_ANIMATION_DURATION = 350; // 틀린 표시 지속 시간
const NEXT_LEVEL_DELAY = 300; // 다음 레벨로 넘어가는 지연 시간
const RETRY_DELAY = 400; // 재도전 지연 시간
const CHARACTER_IMAGE = "./images/circle10.png"; // 캐릭터 이미지 경로
const DARKEN_CORRECT = true; // 정답 클릭한 캐릭터 어둡게 표시 여부
const HINT_ENABLED = false; // 힌트 표시 여부
const WRONG_INCLUDE_PATTERN = false; // 잘못 클릭한 tile이 패턴에 포함되어 있으면 틀린 것으로 처리

// 상태 변수
let level = 1,
  timer = BASE_TIME,
  intervalId,
  pattern = [],
  userInput = [],
  correctCount = 0,
  totalCount = 0,
  playing = false,
  point = 0;

//  인스턴스 생성
const audioManager = new AudioManager();

// DOM
const intro = document.getElementById("intro");
const game = document.getElementById("game");
const result = document.getElementById("result");
const grid = document.getElementById("grid");
const levelSpan = document.getElementById("level");
const timerSpan = document.getElementById("timer");
const finalLevel = document.getElementById("finalLevel");
const accuracy = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const shareBtn = document.getElementById("shareBtn");
const soundBtn = document.getElementById("soundBtn");
const pointSpan = document.getElementById("point");
const finalPoint = document.getElementById("finalPoint");
const wrongOverlay = document.getElementById("wrongOverlay");
const correctOverlay = document.getElementById("correctOverlay");

// 타일 생성
function createGrid() {
  grid.innerHTML = "";
  // JS 상수와 CSS 변수 동기화
  grid.style.setProperty("--grid-cols", GRID_COLS);
  grid.style.setProperty("--grid-rows", GRID_ROWS);

  for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.idx = i;
    tile.addEventListener("click", onTileClick, { passive: true });
    const characterBox = document.createElement("div");
    characterBox.className = "character-box";
    const img = document.createElement("img");
    img.src = CHARACTER_IMAGE;
    img.className = "character";
    characterBox.appendChild(img);
    tile.appendChild(characterBox);
    grid.appendChild(tile);
  }
}

// 레벨별 패턴 길이
function getPatternLength(lv) {
  const maxLen = GRID_COLS * GRID_ROWS;
  let len;
  if (lv === 1) len = 1;
  else if (lv <= 2) len = 2;
  else if (lv <= 4) len = 3;
  else if (lv <= 7) len = 4;
  else if (lv <= 11) len = 5;
  else if (lv <= 16) len = 6;
  else if (lv <= 22) len = 7;
  else if (lv <= 29) len = 8;
  else if (lv <= 37) len = 9;
  else if (lv <= 46) len = 10;
  else if (lv <= 56) len = 11;
  else if (lv <= 67) len = 12;
  else len = Math.floor(Math.random() * 3) + 5;
  return Math.min(len, maxLen);
}

// 패턴 생성
function generatePattern() {
  const len = getPatternLength(level);
  const arr = [];
  while (arr.length < len) {
    const idx = Math.floor(Math.random() * GRID_COLS * GRID_ROWS);
    if (!arr.includes(idx)) arr.push(idx);
  }
  return arr;
}

// 사운드 초기화
function initSound() {
  const enabled = audioManager.soundEnabled;
  soundBtn.textContent = `sound: ${enabled ? "on" : "off"}`;
  soundBtn.classList.toggle("off", !enabled);

  // 사운드: 시작 효과음 & BGM
  audioManager.play("start");
  audioManager.play("bgm");
}

// 사운드 토글 함수
function toggleSound() {
  const enabled = audioManager.toggleSound();
  soundBtn.textContent = `sound: ${enabled ? "on" : "off"}`;
  soundBtn.classList.toggle("off", !enabled);

  // BGM on/off 처리
  if (enabled) {
    if (!audioManager.sources.bgm && !game.classList.contains("hidden")) {
      audioManager.play("bgm");
    }
  } else {
    audioManager.stop("bgm");
  }
}

// 캐릭터 애니메이션 (수정)
function showPattern(pattern) {
  let i = 0;
  playing = false;
  userInput = [];
  const tiles = [...grid.children];
  function showNext() {
    if (i >= pattern.length) {
      playing = true;
      showHint(); // 패턴 끝나면 힌트 표시
      return;
    }
    const idx = pattern[i];
    const characterBox = tiles[idx].querySelector(".character-box");
    characterBox.classList.add("show"); // 사라지지 않음
    setTimeout(() => {
      i++;
      showNext();
    }, SHOW_INTERVAL);
  }
  showNext();
}

// 모든 캐릭터 숨기기 함수 추가
function hideAllCharacters() {
  const tiles = [...grid.children];
  tiles.forEach((tile) => {
    const characterBox = tile.querySelector(".character-box");
    characterBox.classList.remove("show");
    characterBox.classList.remove("darken"); // 어두운 효과도 함께 제거
    tile.classList.remove("hint"); // 힌트도 함께 제거
  });
}

// 힌트 표시
function showHint() {
  if (!HINT_ENABLED || !playing) return;
  const tiles = [...grid.children];
  tiles.forEach((tile) => {
    tile.classList.remove("hint");
  });
  const nextIdx = pattern[userInput.length];
  if (nextIdx !== undefined) {
    const tile = tiles[nextIdx];
    const characterBox = tile.querySelector(".character-box");
    if (characterBox.classList.contains("show") && !characterBox.classList.contains("darken")) {
      tile.classList.add("hint");
    }
  }
}

// 틀린 순간 피드백 및 재도전
function onTileClick(e) {
  if (!playing) return;
  const idx = Number(e.currentTarget.dataset.idx);

  // 틀린 클릭 체크
  if (!WRONG_INCLUDE_PATTERN && !pattern.includes(idx)) {
    return;
  }

  userInput.push(idx);
  const characterBox = e.currentTarget.querySelector(".character-box");
  characterBox.classList.add("clicked");
  setTimeout(() => characterBox.classList.remove("clicked"), CLICK_ANIMATION_DURATION);

  // 정답 클릭 시 어두운 효과
  if (DARKEN_CORRECT && pattern[userInput.length - 1] === idx) {
    characterBox.classList.add("darken");
  }

  showHint(); // 힌트 갱신

  // 정답 클릭 시 포인트 증가
  if (pattern[userInput.length - 1] === idx) {
    point += level * 1;
    pointSpan.textContent = point;

    // 정답 오버레이 효과
    if (correctOverlay) {
      correctOverlay.classList.add("active");
      setTimeout(() => {
        correctOverlay.classList.remove("active");
      }, WRONG_ANIMATION_DURATION);
    }
    // 정답 효과음
    audioManager.play("correct");
  }

  // 틀린 입력 즉시 처리
  if (pattern[userInput.length - 1] !== idx) {
    // 틀린 클릭 체크
    if (!WRONG_INCLUDE_PATTERN && !pattern.includes(idx)) {
      return;
    }

    playing = false;
    totalCount++;
    timer = Math.max(timer - TIME_PENALTY, 0); // 시간 감소
    updateTimerDisplay();
    e.currentTarget.querySelector(".character-box").classList.add("wrong");

    // 틀린 오버레이 효과
    if (wrongOverlay) {
      wrongOverlay.classList.add("active");
      setTimeout(() => {
        wrongOverlay.classList.remove("active");
      }, WRONG_ANIMATION_DURATION);
    }
    // 오답 효과음
    audioManager.play("wrong");

    setTimeout(() => {
      // 1. 모든 캐릭터 숨기기
      hideAllCharacters();
      // 2. 틀린 표시(빨간 원)도 사라지게
      const tiles = [...grid.children];
      tiles.forEach((tile) => tile.querySelector(".character-box").classList.remove("wrong"));
      // 3. 잠시 후 같은 레벨 패턴 다시 등장
      setTimeout(retryLevel, RETRY_DELAY);
    }, WRONG_ANIMATION_DURATION);
    return;
  }

  // 정답 입력 완료
  if (userInput.length === pattern.length) {
    playing = false;
    correctCount++;
    timer = Math.min(timer + TIME_REWARD, MAX_TIME); // 시간 증가
    updateTimerDisplay();
    setTimeout(() => {
      hideAllCharacters();
      setTimeout(nextLevel, NEXT_LEVEL_DELAY);
    }, WRONG_ANIMATION_DURATION);
  }
}

// 다음 레벨
function nextLevel() {
  level++;
  levelSpan.textContent = level;
  startLevel();
}

// 같은 레벨 재도전
function retryLevel() {
  startLevel();
}

// 레벨 시작
function startLevel() {
  pattern = generatePattern();
  showPattern(pattern);
}

// 타이머
function startTimer() {
  timer = BASE_TIME;
  updateTimerDisplay();
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    timer = Math.max(timer - 1000, 0); // 0 이하로 내려가지 않도록 수정
    updateTimerDisplay();
    if (timer <= 0) endGame();
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timer / (60 * 1000));
  const s = Math.floor((timer % (60 * 1000)) / 1000);
  timerSpan.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; // 분도 2자리로 표시
}

// 게임 시작
function startGame() {
  intro.classList.add("hidden");
  result.classList.add("hidden");
  game.classList.remove("hidden");
  level = 1;
  correctCount = 0;
  totalCount = 0;
  point = 0;
  pointSpan.textContent = point;
  levelSpan.textContent = level;
  createGrid();
  startLevel();
  startTimer();
  initSound();
}

// 게임 종료
function endGame() {
  clearInterval(intervalId);
  game.classList.add("hidden");
  result.classList.remove("hidden");
  finalLevel.textContent = level;
  accuracy.textContent = totalCount ? Math.round((correctCount / totalCount) * 100) : 0;
  finalPoint.textContent = point;
  // 사운드: 게임오버 효과음, BGM 정지
  audioManager.play("gameover");
  audioManager.stop("bgm");
}

// 이벤트
startBtn.onclick = startGame;
restartBtn.onclick = startGame;
shareBtn.onclick = () => {
  if (navigator.share) {
    navigator.share({
      title: "순서기억하기 게임",
      text: `내 최종 레벨: ${level}, 정답률: ${accuracy.textContent}%`,
      url: location.href,
    });
  } else {
    alert("공유 기능을 지원하지 않는 브라우저입니다.");
  }
};
soundBtn.addEventListener("click", toggleSound);

// 최초 화면
createGrid();
