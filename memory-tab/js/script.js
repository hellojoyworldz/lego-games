// 게임 설정 상수
const GameConfig = {
  grid: {
    COLS: 4, // 가로 개수
    ROWS: 5, // 세로 개수
  },
  points: {
    BASE: 1, // 성공 시 제공되는 포인트
    MULTIPLIER: 1, // 레벨 별 포인트 배수
    LEVEL_MULTIPLIER_ENABLED: true, // 레벨 별 포인트 배수 적용 여부 - true면 레벨 * POINT_MULTIPLIER, false면 BASE_POINT
  },
  timing: {
    BASE_TIME: 0.5 * 10 * 1000, // 기본 제공 시간
    MAX_TIME: 5 * 60 * 1000, // 최대 시간
    PENALTY: 0.7 * 1000, // 오답 시 시간 감소
    REWARD: 0.7 * 1000, // 정답 시 시간 증가
    SHOW_INTERVAL: 150, // 패턴 표시 간격
    CLICK_ANIMATION: 200, // 클릭 애니메이션 지속 시간
    WRONG_ANIMATION: 350, // 오답 애니메이션 지속 시간
    NEXT_LEVEL_DELAY: 300, // 다음 레벨 진행 전 딜레이 시간
    RETRY_DELAY: 400, // 오답 후 같은 레벨 재시도 전 딜레이
    TIMER_INTERVAL: 100, // 타이머 갱신 간격
  },
  display: {
    CHARACTER_IMAGE: "./images/circle10.png", // 캐릭터 이미지
    DARKEN_CORRECT: true, // 정답 시 어두운 효과 적용 여부
    HINT_ENABLED: false, // 힌트 표시 여부
    WRONG_INCLUDE_PATTERN: false, // 캐릭터 외 타일 클릭 시 오답 여부 - true면 캐릭터 외 타일 클릭 시 오답, false면 캐릭터 외 타일 클릭 시 오답 처리 안함
  },
  // 레벨별 패턴 길이 설정
  levelRanges: [
    { max: 1, length: 1 }, // 레벨 1은 1개 패턴
    { max: 2, length: 2 }, // 레벨 2는 2개 패턴
    { max: 4, length: 3 }, // 레벨 3-4는 3개 패턴
    { max: 7, length: 4 }, // 레벨 5-7은 4개 패턴
    { max: 11, length: 5 }, // 레벨 8-11은 5개 패턴
    { max: 16, length: 6 }, // 레벨 12-16은 6개 패턴
    { max: 22, length: 7 }, // 레벨 17-22는 7개 패턴
    { max: 29, length: 8 }, // 레벨 23-29는 8개 패턴
    { max: 37, length: 9 }, // 레벨 30-37은 9개 패턴
    { max: 46, length: 10 }, // 레벨 38-46은 10개 패턴
    { max: 56, length: 11 }, // 레벨 47-56은 11개 패턴
    { max: 67, length: 12 }, // 레벨 57-67은 12개 패턴
  ],
  // 고레벨 기본 패턴 설정
  defaultHighLevelPattern: {
    min: 11, // 최소 패턴 수
    max: 22, // 최대 패턴 수
  },
};

// 상태
class GameState {
  constructor() {
    this.level = 1;
    this.timer = GameConfig.timing.BASE_TIME;
    this.intervalId = null;
    this.correctCount = 0;
    this.totalCount = 0;
    this.point = 0;
    this.playing = false;
    this.pattern = [];
    this.userInput = [];
  }

  reset() {
    this.level = 1;
    this.timer = GameConfig.timing.BASE_TIME;
    this.correctCount = 0;
    this.totalCount = 0;
    this.point = 0;
    this.playing = false;
    this.pattern = [];
    this.userInput = [];
  }
}

// DOM 요소
class DOMElements {
  constructor() {
    // 화면 컨테이너
    this.introScreen = document.getElementById("intro"); // 인트로 화면
    this.gameScreen = document.getElementById("game"); // 게임 화면
    this.resultScreen = document.getElementById("result"); // 게임 결과 화면

    // 인트로 화면 요소
    this.intro = {
      screen: document.getElementById("intro"), // 인트로 화면 컨테이너
      startButton: document.getElementById("startBtn"), // 게임 시작 버튼
    };

    // 게임 화면 요소
    this.game = {
      screen: document.getElementById("game"), // 게임 화면 컨테이너
      grid: document.getElementById("grid"), // 그리드
      levelSpan: document.getElementById("level"), // 레벨 표시
      timerSpan: document.getElementById("timer"), // 타이머 표시
      addTime: document.getElementById("addTime"), // 타이머 증가 표시
      currentPoint: document.getElementById("point"), // 현재 포인트 표시
      addPoint: document.getElementById("addPoint"), // 포인트 증가 표시
      soundButton: document.getElementById("soundBtn"), // 사운드 토글 버튼
      wrongOverlay: document.getElementById("wrongOverlay"), // 오답 오버레이 효과
      correctOverlay: document.getElementById("correctOverlay"), // 정답 오버레이 효과
    };

    // 결과 화면 요소
    this.result = {
      screen: document.getElementById("result"), // 결과 화면 컨테이너
      finalLevel: document.getElementById("finalLevel"), // 최종 레벨 표시
      // accuracy: document.getElementById("accuracy"), // 정답률 표시
      finalPoint: document.getElementById("finalPoint"), // 최종 포인트 표시
      restartButton: document.getElementById("restartBtn"), // 게임 재시작 버튼
      // shareButton: document.getElementById("shareBtn"), // 게임 결과 공유 버튼
    };
  }
}

// 게임 상태와 DOM 요소 초기화
const gameState = new GameState();
const dom = new DOMElements();
const audioManager = new AudioManager();

// 그리드 생성
function createGrid() {
  dom.game.grid.innerHTML = "";
  dom.game.grid.style.setProperty("--grid-cols", GameConfig.grid.COLS);
  dom.game.grid.style.setProperty("--grid-rows", GameConfig.grid.ROWS);

  const totalTiles = GameConfig.grid.COLS * GameConfig.grid.ROWS;
  for (let i = 0; i < totalTiles; i++) {
    dom.game.grid.appendChild(createTile(i));
  }
}

// 타일 생성
function createTile(index) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.dataset.idx = index;
  tile.addEventListener("click", onTileClick, { passive: true });

  const characterBox = document.createElement("div");
  characterBox.className = "character-box";

  const img = document.createElement("img");
  img.src = GameConfig.display.CHARACTER_IMAGE;
  img.className = "character";

  characterBox.appendChild(img);
  tile.appendChild(characterBox);
  return tile;
}

// 레벨별 패턴 길이
function getPatternLength(level) {
  const maxLen = GameConfig.grid.COLS * GameConfig.grid.ROWS;

  // 해당 레벨 범위 찾기
  const range = GameConfig.levelRanges.find((range) => level <= range.max);

  // 범위를 찾았으면 해당 길이 반환, 없으면 랜덤 길이 생성
  const len = range
    ? range.length
    : Math.floor(
        Math.random() *
          (GameConfig.defaultHighLevelPattern.max -
            GameConfig.defaultHighLevelPattern.min +
            1)
      ) +
      GameConfig.defaultHighLevelPattern.min;

  return Math.min(len, maxLen);
}

// 패턴 생성
function generatePattern() {
  const totalTiles = GameConfig.grid.COLS * GameConfig.grid.ROWS;
  const patternLength = getPatternLength(gameState.level);
  const uniqueIndices = new Set();

  // 고유한 인덱스 생성
  while (uniqueIndices.size < patternLength) {
    const randomIndex = Math.floor(Math.random() * totalTiles);
    uniqueIndices.add(randomIndex);
  }

  return Array.from(uniqueIndices);
}

// 사운드 초기화
function initSound() {
  updateSoundButtonState();

  // 사운드: 시작 효과음 & BGM
  audioManager.play("start");
  audioManager.play("bgm");
}

// 사운드 토글 함수
function toggleSound() {
  const enabled = audioManager.toggleSound();
  updateSoundButtonState();
  return enabled;
}

// 사운드 버튼 상태 업데이트
function updateSoundButtonState() {
  const enabled = audioManager.soundEnabled;
  dom.game.soundButton.textContent = `sound: ${enabled ? "on" : "off"}`;
  dom.game.soundButton.classList.toggle("off", !enabled);
}

// 캐릭터 애니메이션 - 패턴 보여주기
function showPattern(pattern) {
  let i = 0;
  gameState.playing = false;
  gameState.userInput = [];
  const tiles = [...dom.game.grid.children];

  function showNext() {
    if (i >= pattern.length) {
      gameState.playing = true;
      showHint(); // 패턴 끝나면 힌트 표시
      return;
    }

    const idx = pattern[i];
    const characterBox = tiles[idx].querySelector(".character-box");
    characterBox.classList.add("show"); // 사라지지 않음

    setTimeout(() => {
      i++;
      showNext();
    }, GameConfig.timing.SHOW_INTERVAL);
  }

  showNext();
}

// 모든 캐릭터 숨기기
function hideAllCharacters() {
  const tiles = [...dom.game.grid.children];

  tiles.forEach((tile) => {
    const characterBox = tile.querySelector(".character-box");
    // 모든 관련 클래스 제거
    characterBox.classList.remove("show", "darken");
    tile.classList.remove("hint");
  });
}

// 힌트 표시
function showHint() {
  if (!GameConfig.display.HINT_ENABLED || !gameState.playing) return;

  const tiles = [...dom.game.grid.children];
  // 모든 힌트 제거
  tiles.forEach((tile) => tile.classList.remove("hint"));

  // 다음 선택해야 할 항목 찾기
  const nextIdx = gameState.pattern[gameState.userInput.length];

  if (nextIdx !== undefined) {
    const tile = tiles[nextIdx];
    const characterBox = tile.querySelector(".character-box");

    // 보이는 상태이고 어둡게 처리되지 않은 경우만 힌트 표시
    if (characterBox.classList.contains("show") && !characterBox.classList.contains("darken")) {
      tile.classList.add("hint");
    }
  }
}

// 타일 클릭 이벤트 처리
function onTileClick(e) {
  if (!gameState.playing) return;

  const idx = Number(e.currentTarget.dataset.idx);

  // 패턴에 포함되지 않은 타일 클릭 처리
  if (!GameConfig.display.WRONG_INCLUDE_PATTERN && !gameState.pattern.includes(idx)) {
    return;
  }

  // 클릭 애니메이션 표시
  const characterBox = e.currentTarget.querySelector(".character-box");
  characterBox.classList.add("clicked");
  setTimeout(() => characterBox.classList.remove("clicked"), GameConfig.timing.CLICK_ANIMATION);

  // 유저 입력 기록
  gameState.userInput.push(idx);

  // 정답 처리
  if (gameState.pattern[gameState.userInput.length - 1] === idx) {
    handleCorrectClick(characterBox);
  } else {
    handleWrongClick(e.currentTarget);
    return;
  }

  // 모든 패턴 입력 완료 확인
  if (gameState.userInput.length === gameState.pattern.length) {
    gameState.playing = false;
    gameState.correctCount++;
    updateTimerDisplay();

    setTimeout(() => {
      hideAllCharacters();
      setTimeout(nextLevel, GameConfig.timing.NEXT_LEVEL_DELAY);
    }, GameConfig.timing.WRONG_ANIMATION);
  }

  showHint(); // 힌트 갱신
}

// 정답 클릭 처리
function handleCorrectClick(characterBox) {
  // 점수 계산 및 표시
  const pointToAdd = GameConfig.points.LEVEL_MULTIPLIER_ENABLED
    ? gameState.level * GameConfig.points.MULTIPLIER
    : GameConfig.points.BASE;

  gameState.point += pointToAdd;
  dom.game.currentPoint.textContent = gameState.point;

  // 시간 증가
  gameState.timer = Math.min(gameState.timer + GameConfig.timing.REWARD, GameConfig.timing.MAX_TIME);

  //시간 증가 표시
  dom.game.addTime.textContent = `+${GameConfig.timing.REWARD / 1000}`;
  dom.game.addTime.classList.add("active");

  // 포인트 증가 표시
  dom.game.addPoint.textContent = `+${pointToAdd}`;
  dom.game.addPoint.classList.add("active");

  // 어두운 효과 적용
  if (GameConfig.display.DARKEN_CORRECT) {
    characterBox.classList.add("darken");
  }

  // 정답 오버레이 효과
  if (dom.game.correctOverlay) {
    dom.game.correctOverlay.classList.add("active");
    dom.game.addPoint.classList.add("active");
    dom.game.addTime.classList.add("active");
    setTimeout(() => {
      dom.game.correctOverlay.classList.remove("active");
      dom.game.addPoint.classList.remove("active");
      dom.game.addTime.classList.remove("active");
    }, GameConfig.timing.WRONG_ANIMATION);
  }

  // 정답 효과음
  audioManager.play("correct");
}

// 오답 클릭 처리
function handleWrongClick(tile) {
  gameState.playing = false;
  gameState.totalCount++;
  gameState.timer = Math.max(gameState.timer - GameConfig.timing.PENALTY, 0);
  updateTimerDisplay();

  // 오답 표시
  const characterBox = tile.querySelector(".character-box");
  characterBox.classList.add("wrong");

  // 시간 감소 표시
  dom.game.addTime.textContent = `-${GameConfig.timing.PENALTY / 1000}`;

  // 틀린 오버레이 효과
  if (dom.game.wrongOverlay) {
    dom.game.wrongOverlay.classList.add("active");
    dom.game.addTime.classList.add("active");
    setTimeout(() => {
      dom.game.wrongOverlay.classList.remove("active");
      dom.game.addTime.classList.remove("active");
    }, GameConfig.timing.WRONG_ANIMATION);
  }

  // 오답 효과음
  audioManager.play("wrong");

  // 일정 시간 후 재시도
  setTimeout(() => {
    // 모든 캐릭터 숨기기
    hideAllCharacters();

    // 틀린 표시 제거
    const tiles = [...dom.game.grid.children];
    tiles.forEach((tile) => tile.querySelector(".character-box").classList.remove("wrong"));

    // 같은 레벨 재시도
    setTimeout(retryLevel, GameConfig.timing.RETRY_DELAY);
  }, GameConfig.timing.WRONG_ANIMATION);
}

// 다음 레벨로 진행
function nextLevel() {
  gameState.level++;
  dom.game.levelSpan.textContent = gameState.level;
  startLevel();
}

// 같은 레벨 재도전
function retryLevel() {
  startLevel();
}

// 레벨 시작
function startLevel() {
  // 새로운 패턴 생성 및 표시
  gameState.pattern = generatePattern();
  showPattern(gameState.pattern);
}

// 타이머 시작
function startTimer() {
  gameState.timer = GameConfig.timing.BASE_TIME;
  updateTimerDisplay();

  // 기존 타이머 정리
  clearInterval(gameState.intervalId);

  // 새 타이머 설정
  gameState.intervalId = setInterval(() => {
    // 시간 감소
    gameState.timer = Math.max(gameState.timer - GameConfig.timing.TIMER_INTERVAL, 0);
    updateTimerDisplay();

    // 시간 종료 시 게임 종료
    if (gameState.timer <= 0) {
      endGame();
    }
  }, GameConfig.timing.TIMER_INTERVAL);
}

// 타이머 표시 업데이트
function updateTimerDisplay() {
  const minutes = Math.floor(gameState.timer / (60 * 1000));
  const seconds = Math.floor((gameState.timer % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((gameState.timer % 1000) / 10); // 10ms 단위로 표시

  // 시간 형식: MM:SS:MS
  if (minutes > 0) {
    dom.game.timerSpan.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    dom.game.timerSpan.textContent = `${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(2, "0")}`;
  }
}

// 게임 시작
function startGame() {
  // 화면 전환
  dom.intro.screen.classList.add("hidden");
  dom.result.screen.classList.add("hidden");
  dom.game.screen.classList.remove("hidden");

  // 게임 상태 초기화
  gameState.reset();

  // UI 초기화
  dom.game.currentPoint.textContent = gameState.point;
  dom.game.levelSpan.textContent = gameState.level;

  // 게임 요소 초기화
  createGrid();
  startLevel();
  startTimer();
  initSound();
}

// 게임 종료
function endGame() {
  // 타이머 정리
  clearInterval(gameState.intervalId);

  // 화면 전환
  dom.game.screen.classList.add("hidden");
  dom.result.screen.classList.remove("hidden");

  // 결과 표시
  dom.result.finalLevel.textContent = gameState.level;
  // dom.result.accuracy.textContent = gameState.totalCount
  //   ? Math.round((gameState.correctCount / gameState.totalCount) * 100)
  //   : 0;
  dom.result.finalPoint.textContent = gameState.point;

  // 사운드: 게임오버 효과음, BGM 정지
  audioManager.play("gameover");
  audioManager.stop("bgm");
}

// 게임 결과 공유
function shareGameResult() {
  if (navigator.share) {
    navigator.share({
      title: "순서기억하기 게임",
      text: `내 최종 레벨: ${gameState.level}, 정답률: ${dom.result.accuracy.textContent}%`,
      url: location.href,
    });
  } else {
    alert("공유 기능을 지원하지 않는 브라우저입니다.");
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  dom.intro.startButton.onclick = startGame;
  dom.result.restartButton.onclick = startGame;
  // dom.result.shareButton.onclick = shareGameResult;
  dom.game.soundButton.addEventListener("click", toggleSound);
}

// 초기화 및 시작
function initGame() {
  createGrid();
  setupEventListeners();
}

// 게임 초기화 실행
initGame();
