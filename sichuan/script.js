document.addEventListener("DOMContentLoaded", function () {
  const ROWS = 8;
  const COLS = 10;
  const TIME_LIMIT = 90; // 1분 30초 시간제한
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
  let lineElements = []; // 연결선 요소 저장 배열

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
    timer = TIME_LIMIT; // 시간제한 설정
    score = 0;
    timerElement.textContent = timer;
    board = [];
    selectedTile = null;
    boardElement.innerHTML = "";
    messageElement.textContent = "";
    lineElements = [];

    // 보드 크기 설정 - 간격을 더 크게
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    boardElement.style.gap = "8px"; // 타일 사이 간격 증가

    // 빈 보드 생성
    for (let row = 0; row < ROWS; row++) {
      board[row] = [];
      for (let col = 0; col < COLS; col++) {
        board[row][col] = null;
      }
    }

    // 랜덤 레이아웃 생성
    const layout = generateRandomLayout();

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

            // 클릭 이벤트 리스너 수정 - 이벤트 버블링 방지
            tile.addEventListener("click", function (event) {
              event.stopPropagation();
              handleTileClick(row, col);
            });

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

    // 타이머 시작 (카운트다운)
    timerInterval = setInterval(() => {
      timer--;
      timerElement.textContent = timer;

      if (timer <= 10) {
        timerElement.style.color = "red"; // 시간이 10초 이하면 빨간색으로 표시
      } else {
        timerElement.style.color = ""; // 기본 색상으로 복원
      }

      if (timer <= 0) {
        clearInterval(timerInterval);
        endGame(false); // 시간 초과로 게임 종료
      }
    }, 1000);

    // 게임 화면 표시
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    endScreen.style.display = "none";
  }

  // 랜덤 레이아웃 생성 함수
  function generateRandomLayout() {
    const layout = [];
    const emptySpaceRate = 0.4; // 빈 공간 비율을 40%로 증가

    for (let row = 0; row < ROWS; row++) {
      layout[row] = [];
      for (let col = 0; col < COLS; col++) {
        // 가장자리에는 항상 빈 공간 생성
        if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
          layout[row][col] = 0;
        } else {
          // 나머지는 랜덤하게 타일 또는 빈 공간 생성
          layout[row][col] = Math.random() < emptySpaceRate ? 0 : 1;
        }
      }
    }

    // 타일 개수가 짝수가 되도록 조정
    let tileCount = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (layout[row][col] === 1) {
          tileCount++;
        }
      }
    }

    // 타일 개수가 홀수면, 마지막 행에 타일 추가 또는 제거
    if (tileCount % 2 !== 0) {
      for (let col = 0; col < COLS; col++) {
        if (layout[ROWS - 1][col] === 0) {
          layout[ROWS - 1][col] = 1;
          break;
        } else if (layout[ROWS - 1][col] === 1) {
          layout[ROWS - 1][col] = 0;
          break;
        }
      }
    }

    return layout;
  }

  // 타일 클릭 처리
  function handleTileClick(row, col) {
    const tile = board[row][col];

    // 빈 공간이나 이미 매칭된 타일은 무시
    if (
      !tile ||
      !tile.element ||
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

    // 연결 가능 여부 및 경로 찾기
    const path = findPath(selectedRow, selectedCol, row, col);

    if (path) {
      // 연결선 그리기
      drawConnectionLines(path);

      // 0.5초 후에 타일 제거 및 점수 계산
      setTimeout(() => {
        // 연결선 제거
        clearConnectionLines();

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

        // 점수 계산 (남은 시간이 많을수록 높은 점수)
        const timeBonus = Math.max(timer, 0);
        const matchPoints = 100;
        const pointsEarned = matchPoints + timeBonus;
        score += pointsEarned;

        messageElement.textContent = `연결 성공! +${pointsEarned}점`;
        setTimeout(() => {
          messageElement.textContent = "";
        }, 1000);

        // 게임 클리어 확인
        if (tilesLeft === 0) {
          endGame(true); // 성공으로 게임 종료
        }
      }, 500);
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

  // 연결선 그리기
  function drawConnectionLines(path) {
    // 기존 연결선 제거
    clearConnectionLines();

    // 각 경로 지점을 연결하는 선 생성
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];

      // 각 지점의 타일 요소 찾기
      const startTile = document.querySelector(
        `.tile[data-row="${start.row}"][data-col="${start.col}"]`
      );
      const endTile = document.querySelector(
        `.tile[data-row="${end.row}"][data-col="${end.col}"]`
      );

      if (!startTile || !endTile) continue;

      // 타일의 위치 정보
      const startRect = startTile.getBoundingClientRect();
      const endRect = endTile.getBoundingClientRect();
      const boardRect = boardElement.getBoundingClientRect();

      // 타일 중앙 위치 계산 (보드 기준)
      const startX = startRect.left + startRect.width / 2 - boardRect.left;
      const startY = startRect.top + startRect.height / 2 - boardRect.top;
      const endX = endRect.left + endRect.width / 2 - boardRect.left;
      const endY = endRect.top + endRect.height / 2 - boardRect.top;

      // 선 생성
      const line = document.createElement("div");
      line.className = "connection-line";

      // 선의 길이와 각도 계산
      const length = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

      // 선 스타일 설정
      line.style.width = `${length}px`;
      line.style.left = `${startX}px`;
      line.style.top = `${startY}px`;
      line.style.transform = `rotate(${angle}deg)`;
      line.style.transformOrigin = "0 50%";

      // 보드에 선 추가
      boardElement.appendChild(line);
      lineElements.push(line);
    }
  }

  // 연결선 제거
  function clearConnectionLines() {
    lineElements.forEach((line) => {
      if (line && line.parentNode) {
        line.parentNode.removeChild(line);
      }
    });
    lineElements = [];
  }

  // 게임 종료
  function endGame(success = false) {
    clearInterval(timerInterval);
    clearConnectionLines();

    let message = "";
    let timeBonus = 0;

    if (success) {
      // 보너스 점수 - 남은 시간 보너스
      timeBonus = Math.max(timer * 10, 0);
      score += timeBonus;
      message = "게임 클리어!";
    } else {
      message = "시간 초과!";
    }

    // 점수 표시
    finalScoreElement.textContent = `점수: ${score}점`;

    if (success) {
      timeResultElement.textContent = `남은 시간: ${timer}초 (시간 보너스: +${timeBonus}점)`;
    } else {
      timeResultElement.textContent = `시간이 초과되었습니다!`;
    }

    // 타이틀 업데이트
    document.querySelector("#end-screen .title").textContent = message;

    // 종료 화면 표시
    setTimeout(() => {
      gameScreen.style.display = "none";
      endScreen.style.display = "flex";
    }, 1000);
  }

  // 연결 경로 찾기
  function findPath(r1, c1, r2, c2) {
    // 직접 연결 가능한 경우
    if (isDirectlyConnectable(r1, c1, r2, c2)) {
      return [
        { row: r1, col: c1 },
        { row: r2, col: c2 },
      ];
    }

    // 한 번 꺾여서 연결 가능한 경우
    for (let r = 0; r < ROWS; r++) {
      if (isEmpty(r, c1) || (r === r2 && c1 === c2)) {
        if (
          isDirectlyConnectable(r1, c1, r, c1) &&
          isDirectlyConnectable(r, c1, r2, c2)
        ) {
          return [
            { row: r1, col: c1 },
            { row: r, col: c1 },
            { row: r2, col: c2 },
          ];
        }
      }
    }

    for (let c = 0; c < COLS; c++) {
      if (isEmpty(r1, c) || (r1 === r2 && c === c2)) {
        if (
          isDirectlyConnectable(r1, c1, r1, c) &&
          isDirectlyConnectable(r1, c, r2, c2)
        ) {
          return [
            { row: r1, col: c1 },
            { row: r1, col: c },
            { row: r2, col: c2 },
          ];
        }
      }
    }

    // 두 번 꺾여서 연결 가능한 경우
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (
          (isEmpty(r, c1) || (r === r2 && c1 === c2)) &&
          (isEmpty(r, c) || (r === r2 && c === c2))
        ) {
          if (
            isDirectlyConnectable(r1, c1, r, c1) &&
            isDirectlyConnectable(r, c1, r, c) &&
            isDirectlyConnectable(r, c, r2, c2)
          ) {
            return [
              { row: r1, col: c1 },
              { row: r, col: c1 },
              { row: r, col: c },
              { row: r2, col: c2 },
            ];
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
            return [
              { row: r1, col: c1 },
              { row: r1, col: c },
              { row: r, col: c },
              { row: r2, col: c2 },
            ];
          }
        }
      }
    }

    return null; // 연결 불가능
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
