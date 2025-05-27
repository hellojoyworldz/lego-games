// 상수
const GRID_SIZE = 5;
const SHOW_INTERVAL = 150;
const VISIBLE_DURATION = 200;
const DARKEN_CORRECT = true; // 정답 클릭한 캐릭터 어둡게 표시 여부
const HINT_ENABLED = true; // 힌트(파란 원) 표시 여부
const BASE_TIME = 20; // 기본 시간(초)
const TIME_PENALTY = 5; // 틀릴 때 감소(초)
const TIME_REWARD = 3; // 맞출 때 증가(초)
const MAX_TIME = 60; // 최대 시간(초)

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
const successSound = document.getElementById("successSound");
const failSound = document.getElementById("failSound");
const pointSpan = document.getElementById("point");
const finalPoint = document.getElementById("finalPoint");

// 타일 생성
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.idx = i;
    tile.addEventListener("click", onTileClick, { passive: true });
    const img = document.createElement("img");
    img.src = "circle10.png";
    img.className = "character";
    tile.appendChild(img);
    grid.appendChild(tile);
  }
}

// 레벨별 패턴 길이
function getPatternLength(lv) {
  if (lv === 1) return 1;
  if (lv <= 2) return 2;
  if (lv <= 4) return 3;
  if (lv <= 7) return 4;
  if (lv <= 11) return 5;
  if (lv <= 16) return 6;
  if (lv <= 22) return 7;
  if (lv <= 29) return 8;
  if (lv <= 37) return 9;
  if (lv <= 46) return 10;
  if (lv <= 56) return 11;
  if (lv <= 67) return 12;
  return Math.floor(Math.random() * 3) + 5;
}

// 패턴 생성
function generatePattern() {
  const len = getPatternLength(level);
  const arr = [];
  while (arr.length < len) {
    const idx = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    if (!arr.includes(idx)) arr.push(idx);
  }
  return arr;
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
    const img = tiles[idx].querySelector(".character");
    img.classList.add("show"); // 사라지지 않음
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
    const img = tile.querySelector(".character");
    img.classList.remove("show");
    img.classList.remove("darken"); // 어두운 효과도 함께 제거
    img.classList.remove("hint"); // 힌트도 함께 제거
  });
}

// 힌트 표시
function showHint() {
  if (!HINT_ENABLED || !playing) return;
  const tiles = [...grid.children];
  tiles.forEach((tile) => {
    const img = tile.querySelector(".character");
    img.classList.remove("hint");
  });
  const nextIdx = pattern[userInput.length];
  if (nextIdx !== undefined) {
    const tile = tiles[nextIdx];
    const img = tile.querySelector(".character");
    if (img.classList.contains("show") && !img.classList.contains("darken")) {
      img.classList.add("hint");
    }
  }
}

// 틀린 순간 피드백 및 재도전
function onTileClick(e) {
  if (!playing) return;
  const idx = Number(e.currentTarget.dataset.idx);
  userInput.push(idx);
  const img = e.currentTarget.querySelector(".character");
  img.classList.add("clicked");
  setTimeout(() => img.classList.remove("clicked"), 200);

  // 정답 클릭 시 어두운 효과
  if (DARKEN_CORRECT && pattern[userInput.length - 1] === idx) {
    img.classList.add("darken");
  }

  showHint(); // 힌트 갱신

  // 정답 클릭 시 포인트 증가
  if (pattern[userInput.length - 1] === idx) {
    point += level * 1;
    pointSpan.textContent = point;
  }

  // 틀린 입력 즉시 처리
  if (pattern[userInput.length - 1] !== idx) {
    playing = false;
    totalCount++;
    timer = Math.max(timer - TIME_PENALTY, 0); // 시간 감소
    updateTimerDisplay();
    e.currentTarget.classList.add("wrong");
    failSound.play();
    setTimeout(() => {
      // 1. 모든 캐릭터 숨기기
      hideAllCharacters();
      // 2. 틀린 표시(빨간 원)도 사라지게
      const tiles = [...grid.children];
      tiles.forEach((tile) => tile.classList.remove("wrong"));
      // 3. 잠시 후 같은 레벨 패턴 다시 등장
      setTimeout(retryLevel, 400);
    }, 400); // 틀린 표시 0.4초 보여주고
    return;
  }

  // 정답 입력 완료
  if (userInput.length === pattern.length) {
    playing = false;
    correctCount++;
    timer = Math.min(timer + TIME_REWARD, MAX_TIME); // 시간 증가
    updateTimerDisplay();
    successSound.play();
    setTimeout(() => {
      hideAllCharacters();
      setTimeout(nextLevel, 500);
    }, 400);
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
    timer--;
    updateTimerDisplay();
    if (timer <= 0) endGame();
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timer / 60);
  const s = String(timer % 60).padStart(2, "0");
  timerSpan.textContent = `${m}:${s}`;
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
}

// 게임 종료
function endGame() {
  clearInterval(intervalId);
  game.classList.add("hidden");
  result.classList.remove("hidden");
  finalLevel.textContent = level;
  accuracy.textContent = totalCount
    ? Math.round((correctCount / totalCount) * 100)
    : 0;
  finalPoint.textContent = point;
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

// 최초 화면
createGrid();
