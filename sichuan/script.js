document.addEventListener("DOMContentLoaded", function () {
  const ROWS = 8;
  const COLS = 10;
  const TILE_TYPES = [
    "🍎",
    "🍌",
    "🍒",
    "🍇",
    "🍊",
    "🍋",
    "🍉",
    "🍓",
    "🥝",
    "🥭",
    "🍍",
    "🥥",
    "🍑",
    "🥑",
    "🍐",
    "🍈",
    "🍏",
    "🫐",
  ];

  let board = [];
  let selectedTile = null;
  let tilesLeft = 0;
  let timer = 0;
  let timerInterval = null;
  let score = 0;

  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");
  const boardElement = document.getElementById("board");
  const tilesLeftElement = document.getElementById("tiles-left");
  const timerElement = document.getElementById("timer");
  const messageElement = document.getElementById("message");
  const finalScoreElement = document.getElementById("final-score");
  const timeResultElement = document.getElementById("time-result");
  const startButton = document.getElementById("start-button");
  const playAgainButton = document.getElementById("play-again");

  // 게임 초기화
  function initGame() {
    clearInterval(timerInterval);
    timer = 0;
    score = 0;
    timerElement.textContent = timer;
    board = [];
    selectedTile = null;
    boardElement.innerHTML = "";
    messageElement.textContent = "";

    // 보드 크기 설정
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

    // 빈 보드 생성
    for (let row = 0; row < ROWS; row++) {
      board[row] = [];
      for (let col = 0; col < COLS; col++) {
        board[row][col] = null;
      }
    }

    // 타일 배치 계획 (빈 공간을 포함한 레이아웃)
    // 1 = 타일 배치, 0 = 빈 공간
    const layout = [
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ];

    // 실제 타일 개수 계산
    let tilePositions = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (layout[row][col] === 1) {
          tilePositions.push({ row, col });
        }
      }
    }

    // 타일 쌍 생성 (짝수개의 타일이 되도록 함)
    const totalTiles = tilePositions.length;
    const pairCount = Math.floor(totalTiles / 2);

    const tiles = [];
    for (let i = 0; i < pairCount; i++) {
      const tileType = TILE_TYPES[i % TILE_TYPES.length];
      tiles.push(tileType, tileType);
    }

    // 타일 섞기
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // 타일 위치 섞기
    for (let i = tilePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilePositions[i], tilePositions[j]] = [
        tilePositions[j],
        tilePositions[i],
      ];
    }

    // DOM에 타일 생성 및 배치
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = document.createElement("div");

        if (layout[row][col] === 1) {
          // 타일을 배치할 위치
          const position = tilePositions.pop();
          if (position && tiles.length > 0) {
            const tileType = tiles.pop();
            tile.className = "tile";
            tile.textContent = tileType;
            tile.dataset.row = row;
            tile.dataset.col = col;
            tile.addEventListener("click", () => handleTileClick(row, col));

            board[row][col] = { type: tileType, element: tile };
            tilesLeft++;
          } else {
            // 위치는 타일 위치지만 타일이 부족한 경우 (짝이 안 맞는 경우)
            tile.className = "tile empty";
            board[row][col] = null;
          }
        } else {
          // 빈 공간
          tile.className = "tile empty";
          board[row][col] = null;
        }

        boardElement.appendChild(tile);
      }
    }

    tilesLeftElement.textContent = tilesLeft;

    // 타이머 시작
    timerInterval = setInterval(() => {
      timer++;
      timerElement.textContent = timer;
    }, 1000);

    // 게임 화면 표시
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    endScreen.style.display = "none";
  }

  // 타일 클릭 처리
  function handleTileClick(row, col) {
    const tile = board[row][col];

    // 빈 공간이나 이미 매칭된 타일은 무시
    if (
      !tile ||
      tile.element.classList.contains("matched") ||
      tile.element.classList.contains("empty")
    ) {
      return;
    }

    // 첫 번째 타일 선택
    if (!selectedTile) {
      selectedTile = tile;
      tile.element.classList.add("selected");
      return;
    }

    // 같은 타일 선택
    if (tile.element === selectedTile.element) {
      selectedTile.element.classList.remove("selected");
      selectedTile = null;
      return;
    }

    // 타입이 다른 타일 선택
    if (tile.type !== selectedTile.type) {
      selectedTile.element.classList.remove("selected");
      selectedTile = tile;
      tile.element.classList.add("selected");
      return;
    }

    // 연결 확인
    const selectedRow = parseInt(selectedTile.element.dataset.row);
    const selectedCol = parseInt(selectedTile.element.dataset.col);

    if (canConnect(selectedRow, selectedCol, row, col)) {
      // 매칭 성공
      selectedTile.element.classList.remove("selected");
      selectedTile.element.classList.add("matched");
      tile.element.classList.add("matched");

      // 게임판에서 제거
      board[selectedRow][selectedCol] = null;
      board[row][col] = null;

      selectedTile = null;
      tilesLeft -= 2;
      tilesLeftElement.textContent = tilesLeft;

      // 점수 계산 (빠른 시간일수록 높은 점수)
      const timeBonus = Math.max(100 - timer, 0);
      const matchPoints = 100;
      const pointsEarned = matchPoints + timeBonus;
      score += pointsEarned;

      messageElement.textContent = `연결 성공! +${pointsEarned}점`;
      setTimeout(() => {
        messageElement.textContent = "";
      }, 1000);

      // 게임 클리어 확인
      if (tilesLeft === 0) {
        endGame();
      }
    } else {
      // 연결할 수 없음
      selectedTile.element.classList.remove("selected");
      selectedTile = tile;
      tile.element.classList.add("selected");

      messageElement.textContent = "연결할 수 없습니다.";
      setTimeout(() => {
        messageElement.textContent = "";
      }, 1000);
    }
  }

  // 게임 종료
  function endGame() {
    clearInterval(timerInterval);

    // 보너스 점수 - 남은 시간 보너스
    const timeBonus = Math.max(1000 - timer * 5, 0);
    score += timeBonus;

    // 점수 표시
    finalScoreElement.textContent = `점수: ${score}점`;
    timeResultElement.textContent = `소요 시간: ${timer}초 (시간 보너스: +${timeBonus}점)`;

    // 종료 화면 표시
    setTimeout(() => {
      gameScreen.style.display = "none";
      endScreen.style.display = "flex";
    }, 1000);
  }

  // 타일 연결 가능 여부 확인
  function canConnect(r1, c1, r2, c2) {
    // 직접 연결
    if (isDirectlyConnectable(r1, c1, r2, c2)) {
      return true;
    }

    // 한 번 꺾어서 연결
    for (let r = 0; r < ROWS; r++) {
      // 꺾인 지점이 빈 타일이거나 끝 지점이면
      if (isEmpty(r, c1) || (r === r2 && c1 === c2)) {
        if (
          isDirectlyConnectable(r1, c1, r, c1) &&
          isDirectlyConnectable(r, c1, r2, c2)
        ) {
          return true;
        }
      }
    }

    for (let c = 0; c < COLS; c++) {
      // 꺾인 지점이 빈 타일이거나 끝 지점이면
      if (isEmpty(r1, c) || (r1 === r2 && c === c2)) {
        if (
          isDirectlyConnectable(r1, c1, r1, c) &&
          isDirectlyConnectable(r1, c, r2, c2)
        ) {
          return true;
        }
      }
    }

    // 두 번 꺾어서 연결
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // 두 꺾인 지점이 모두 빈 타일이거나 끝 지점이면
        if (
          (isEmpty(r, c1) || (r === r2 && c1 === c2)) &&
          (isEmpty(r, c) || (r === r2 && c === c2))
        ) {
          if (
            isDirectlyConnectable(r1, c1, r, c1) &&
            isDirectlyConnectable(r, c1, r, c) &&
            isDirectlyConnectable(r, c, r2, c2)
          ) {
            return true;
          }
        }

        if (
          (isEmpty(r1, c) || (r1 === r2 && c === c2)) &&
          (isEmpty(r, c) || (r === r2 && c === c2))
        ) {
          if (
            isDirectlyConnectable(r1, c1, r1, c) &&
            isDirectlyConnectable(r1, c, r, c) &&
            isDirectlyConnectable(r, c, r2, c2)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // 직선으로 연결 가능한지 확인
  function isDirectlyConnectable(r1, c1, r2, c2) {
    // 같은 타일이면 연결 불가
    if (r1 === r2 && c1 === c2) {
      return false;
    }

    // 같은 행
    if (r1 === r2) {
      const start = Math.min(c1, c2);
      const end = Math.max(c1, c2);

      for (let c = start + 1; c < end; c++) {
        if (!isEmpty(r1, c)) {
          return false;
        }
      }
      return true;
    }

    // 같은 열
    if (c1 === c2) {
      const start = Math.min(r1, r2);
      const end = Math.max(r1, r2);

      for (let r = start + 1; r < end; r++) {
        if (!isEmpty(r, c1)) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // 빈 타일인지 확인
  function isEmpty(row, col) {
    // 보드 바깥이면 빈 것으로 간주
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return true;
    }
    return (
      board[row][col] === null ||
      (board[row][col] &&
        board[row][col].element.classList.contains("matched")) ||
      (board[row][col] && board[row][col].element.classList.contains("empty"))
    );
  }

  // 시작 화면에서 게임 시작 버튼
  startButton.addEventListener("click", initGame);

  // 종료 화면에서 새 게임 버튼
  playAgainButton.addEventListener("click", initGame);
});
