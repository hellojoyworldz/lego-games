// UI 요소 선택
const introScreen = document.querySelector(".intro-screen");
const gameScreen = document.querySelector(".game-screen");
const startButton = document.getElementById("start-button");
const homeButton = document.getElementById("home-button");
const canvas = document.getElementById("gomoku-board");
const ctx = canvas.getContext("2d");
const gameOverPanel = document.querySelector(".game-over");
const gameResultDisplay = document.querySelector(".game-result");
const finalScoreDisplay = document.querySelector(".final-score");
const restartButton = document.getElementById("restart-button");
const timerDisplay = document.querySelector(".timer");
const currentTurnDisplay = document.querySelector(".current-turn");
const playerScoreDisplay = document.getElementById("player-score");
const computerScoreDisplay = document.getElementById("computer-score");
const difficultySelector = document.getElementById("difficulty");
const bettingPoint = document.getElementById("betting-point");

// 게임 설정
const BOARD_SIZE = 13; // 15x15 오목판
const LINE_COLOR = "#000000";
const BACKGROUND_COLOR = "#dcb35c";

// 게임 상태
let board = [];
let currentPlayer = 1; // 1: 사용자 (흑돌), 2: 컴퓨터 (백돌)
let gameActive = false;
let timeLeft = 30;
let timerId = null;
let playerScore = 0;
let computerScore = 0;
let lastMove = null;
let cellSize = 0;
let currentDifficulty = "master"; // 기본 난이도
let winningStones = []; // 승리 시 강조할 돌의 위치

// 인트로 화면에서 게임 화면으로 전환
function showGameScreen() {
  // 배팅 포인트 설정
  if (bettingPoint.value <= 0) {
    alert("Please enter a valid betting point");
    return;
  }

  introScreen.style.display = "none";
  gameScreen.style.display = "flex";
  // 난이도 설정
  currentDifficulty = difficultySelector.value; // 게임 시작
  initGame();
}

// 게임 화면에서 인트로 화면으로 돌아가기
function returnToIntro() {
  gameScreen.style.display = "none";
  introScreen.style.display = "flex";
  lastMove = null;

  // 게임 종료 (타이머 정지 등)
  if (gameActive) {
    clearInterval(timerId);
    gameActive = false;
  }
}

// 캔버스 사이즈 설정
function setupCanvas() {
  // 모바일에 최적화된 크기 설정
  const size = Math.min(window.innerWidth * 0.9, 500);
  canvas.width = size;
  canvas.height = size;
  cellSize = size / BOARD_SIZE;
}

// 게임 초기화
function initGame() {
  setupCanvas();

  // 보드 초기화
  board = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(0));

  // 게임 상태 초기화
  currentPlayer = 1;
  timeLeft = 30;
  gameActive = true;
  winningStones = [];

  // UI 업데이트
  updateTurnDisplay();
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
  timerDisplay.style.color = "#333";

  // 게임 오버 패널 숨기기
  gameOverPanel.style.display = "none";

  // 타이머 시작
  startTimer();

  // 보드 그리기
  drawBoard();
}

// 보드 그리기
function drawBoard() {
  // 배경 그리기
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 바둑판 선 그리기
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;

  for (let i = 0; i < BOARD_SIZE; i++) {
    // 수직선
    ctx.beginPath();
    ctx.moveTo((i + 0.5) * cellSize, 0.5 * cellSize);
    ctx.lineTo((i + 0.5) * cellSize, (BOARD_SIZE - 0.5) * cellSize);
    ctx.stroke();

    // 수평선
    ctx.beginPath();
    ctx.moveTo(0.5 * cellSize, (i + 0.5) * cellSize);
    ctx.lineTo((BOARD_SIZE - 0.5) * cellSize, (i + 0.5) * cellSize);
    ctx.stroke();
  }

  // 화점 그리기 (오목의 전통적인 위치)
  const dots = [3, 6, 9];
  ctx.fillStyle = "#000";

  for (let i of dots) {
    for (let j of dots) {
      ctx.beginPath();
      ctx.arc((i + 0.5) * cellSize, (j + 0.5) * cellSize, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 돌 그리기
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) {
        // 승리에 기여한 돌인지 확인
        const isWinningStone = winningStones.some(
          (stone) => stone.x === x && stone.y === y
        );
        drawStone(x, y, board[y][x], isWinningStone);
      }
    }
  }

  // 마지막 돌 주변에 항상 표시 (승리 여부 상관없이)
  if (lastMove) {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      (lastMove.x + 0.5) * cellSize,
      (lastMove.y + 0.5) * cellSize,
      cellSize * 0.4 + 3,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// 돌 그리기
function drawStone(x, y, player, isWinningStone = false) {
  const centerX = (x + 0.5) * cellSize;
  const centerY = (y + 0.5) * cellSize;
  const radius = cellSize * 0.4; // 모든 돌의 크기 동일하게 유지

  ctx.save();

  // 승리 돌은 그림자 효과만 추가 (크기 변경 없음)
  if (isWinningStone) {
    ctx.shadowColor =
      player === 1 ? "rgba(255, 215, 0, 0.7)" : "rgba(255, 215, 0, 0.7)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    radius, // 모든 돌의 크기 동일
    0,
    Math.PI * 2
  );

  if (player === 1) {
    // 사용자 (흑돌)
    ctx.fillStyle = "#000000";
    ctx.fill();
  } else {
    // 컴퓨터 (백돌)
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

// 타이머 시작
function startTimer() {
  clearInterval(timerId);

  timerId = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 10) {
      timerDisplay.style.color = "#e74c3c";
    } else {
      timerDisplay.style.color = "#333";
    }

    if (timeLeft <= 0) {
      clearInterval(timerId);
      gameOver("timeout");
    }
  }, 1000);
}

// 타이머 재설정
function resetTimer() {
  timeLeft = 30;
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
  timerDisplay.style.color = "#333";
  clearInterval(timerId);
  startTimer();
}

// 게임 종료
function gameOver(reason) {
  gameActive = false;
  clearInterval(timerId);

  let resultMessage = "";

  if (reason === "win") {
    // 현재 플레이어가 1(사용자)이면 사용자가 이긴 것이고, 2(컴퓨터)면 컴퓨터가 이긴 것입니다.
    if (currentPlayer === 1) {
      // 사용자가 이김
      resultMessage += "You Win!";
      playerScore++;
    } else {
      // 컴퓨터가 이김
      resultMessage += "AI Win!";
      computerScore++;
    }
  } else if (reason === "timeout") {
    resultMessage = "Time Over!";
    if (currentPlayer === 1) {
      computerScore++;
    } else {
      playerScore++;
    }
  } else if (reason === "draw") {
    resultMessage = "Draw!";
  }

  // 점수 업데이트
  playerScoreDisplay.textContent = playerScore;
  computerScoreDisplay.textContent = computerScore;

  // 승리한 경우, 잠시 후 게임 오버 화면 표시
  if (reason === "win" && winningStones.length > 0) {
    // 승리 애니메이션 후 게임 오버 화면 표시
    setTimeout(() => {
      // 게임 오버 화면 표시
      gameResultDisplay.textContent = resultMessage;
      finalScoreDisplay.textContent = `Final Score: You ${playerScore} - AI ${computerScore} \n Betting Point: ${bettingPoint.value}`;
      gameOverPanel.style.display = "flex";
    }, 1200); // 승리 애니메이션을 보여줄 시간
  } else {
    // 즉시 게임 오버 화면 표시
    gameResultDisplay.textContent = resultMessage;
    finalScoreDisplay.textContent = `Final Score: You ${playerScore} - AI ${computerScore} \n Betting Point: ${bettingPoint.value}`;
    gameOverPanel.style.display = "flex";
  }
}

// 승리 확인
function checkWin(row, col) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  const player = board[row][col];

  for (const [dx, dy] of directions) {
    let count = 1; // 현재 위치의 돌을 포함
    let stones = [{ x: col, y: row }]; // 현재 돌의 위치

    // 한쪽 방향으로 확인
    for (let i = 1; i <= 4; i++) {
      const newRow = row + i * dy;
      const newCol = col + i * dx;

      if (
        newRow >= 0 &&
        newRow < BOARD_SIZE &&
        newCol >= 0 &&
        newCol < BOARD_SIZE &&
        board[newRow][newCol] === player
      ) {
        count++;
        stones.push({ x: newCol, y: newRow });
      } else {
        break;
      }
    }

    // 반대 방향으로 확인
    for (let i = 1; i <= 4; i++) {
      const newRow = row - i * dy;
      const newCol = col - i * dx;

      if (
        newRow >= 0 &&
        newRow < BOARD_SIZE &&
        newCol >= 0 &&
        newCol < BOARD_SIZE &&
        board[newRow][newCol] === player
      ) {
        count++;
        stones.push({ x: newCol, y: newRow });
      } else {
        break;
      }
    }

    if (count >= 5) {
      // 승리한 돌 위치 저장
      winningStones = stones;

      // 승리 애니메이션을 위해 승리 돌을 반짝이게 표시
      animateWinningStones();

      return true;
    }
  }

  return false;
}

// 승리한 돌 애니메이션
function animateWinningStones() {
  let animationFrame = 0;

  function animate() {
    drawBoard(); // 보드와 모든 돌 다시 그리기

    animationFrame++;

    if (animationFrame < 10) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// 턴 완료 후 처리
function finishMove(x, y) {
  drawBoard();

  if (checkWin(y, x)) {
    gameOver("win");
    return;
  }

  // 보드가 가득 찼는지 확인
  let boardFull = true;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        boardFull = false;
        break;
      }
    }
    if (!boardFull) break;
  }

  if (boardFull) {
    gameOver("draw");
    return;
  }

  // 턴 변경
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnDisplay();
  resetTimer();

  // 컴퓨터 턴이면 지연 후 컴퓨터 차례 실행
  if (currentPlayer === 2 && gameActive) {
    setTimeout(computerMove, 1000);
  }
}

// 턴 표시 업데이트
function updateTurnDisplay() {
  if (currentPlayer === 1) {
    currentTurnDisplay.textContent = "Your Turn";
  } else {
    currentTurnDisplay.textContent = "AI's Turn";
  }
}

// 컴퓨터 AI - 난이도에 따른 다른 전략 (여기서 각 난이도별 함수 호출)
function computerMove() {
  if (!gameActive) return;

  // 승리 가능한 위치 찾기 (5개 완성) - 모든 난이도에서 공통
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        // 빈 위치인지 확인
        board[y][x] = 2;
        if (checkWin(y, x)) {
          lastMove = { x, y };
          return finishMove(x, y);
        }
        board[y][x] = 0;
      }
    }
  }

  // 사용자의 즉시 승리를 방어 - 모든 난이도에서 공통
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        // 빈 위치인지 확인
        board[y][x] = 1;
        if (checkWin(y, x)) {
          board[y][x] = 2;
          lastMove = { x, y };
          return finishMove(x, y);
        }
        board[y][x] = 0;
      }
    }
  }

  // 난이도별 다른 전략 적용
  switch (currentDifficulty) {
    case "easy":
      easyAI();
      break;
    case "medium":
      mediumAI();
      break;
    case "hard":
      hardAI();
      break;
    case "expert":
      expertAI();
      break;
    case "master":
      masterAI();
      break;
    default:
      mediumAI();
  }
}

// 쉬운 난이도 AI - 랜덤 배치 위주
function easyAI() {
  // 랜덤 위치 선택
  const emptyPositions = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        // 빈 위치만 추가
        emptyPositions.push({ x, y });
      }
    }
  }

  if (emptyPositions.length > 0) {
    const randomPosition =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    board[randomPosition.y][randomPosition.x] = 2;
    lastMove = { x: randomPosition.x, y: randomPosition.y };
    finishMove(randomPosition.x, randomPosition.y);
  } else {
    // 보드가 가득 찬 경우 무승부
    gameOver("draw");
  }
}

// 중간 난이도 AI - 간단한 패턴 인식
function mediumAI() {
  // 중앙 근처에 두기 선호
  const center = Math.floor(BOARD_SIZE / 2);

  // 첫 수는 중앙 근처에 두기
  if (board.flat().filter((cell) => cell !== 0).length < 2) {
    // 중앙이 비어있는지 확인
    if (board[center][center] === 0) {
      board[center][center] = 2;
      lastMove = { x: center, y: center };
      return finishMove(center, center);
    }
  }

  // 랜덤 위치 선택 (중앙에 더 가중치)
  const emptyPositions = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        // 빈 위치만 추가
        // 중앙에 가까울수록 더 자주 선택되도록 가중치
        const distFromCenter = Math.abs(x - center) + Math.abs(y - center);
        const weight = Math.max(1, 10 - distFromCenter);

        for (let i = 0; i < weight; i++) {
          emptyPositions.push({ x, y });
        }
      }
    }
  }

  if (emptyPositions.length > 0) {
    const randomPosition =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    board[randomPosition.y][randomPosition.x] = 2;
    lastMove = { x: randomPosition.x, y: randomPosition.y };
    finishMove(randomPosition.x, randomPosition.y);
  } else {
    // 보드가 가득 찬 경우 무승부
    gameOver("draw");
  }
}

// 어려운 난이도 AI - 기본 방어 및 공격
function hardAI() {
  // 공격: 자신의 돌이 2개 이상 연속되어 있는 위치 주변 찾기
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 2) {
        // 수평, 수직, 대각선 방향 확인
        const directions = [
          [0, 1],
          [1, 0],
          [1, 1],
          [1, -1],
        ];

        for (const [dx, dy] of directions) {
          // 연속된 돌 확인
          let count = 1;
          for (let i = 1; i <= 2; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 2
            ) {
              count++;
            } else {
              break;
            }
          }

          // 양쪽 끝 확인
          if (count >= 2) {
            // 한쪽 끝
            const endX1 = x + dx * count;
            const endY1 = y + dy * count;

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0 // 빈 위치인지 다시 확인
            ) {
              board[endY1][endX1] = 2;
              lastMove = { x: endX1, y: endY1 };
              return finishMove(endX1, endY1);
            }

            // 반대쪽 끝
            const endX2 = x - dx;
            const endY2 = y - dy;

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0 // 빈 위치인지 다시 확인
            ) {
              board[endY2][endX2] = 2;
              lastMove = { x: endX2, y: endY2 };
              return finishMove(endX2, endY2);
            }
          }
        }
      }
    }
  }

  // 방어: 사용자의 돌이 2개 이상 연속되어 있는 위치 주변 찾기
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 1) {
        // 수평, 수직, 대각선 방향 확인
        const directions = [
          [0, 1],
          [1, 0],
          [1, 1],
          [1, -1],
        ];

        for (const [dx, dy] of directions) {
          // 연속된 돌 확인
          let count = 1;
          for (let i = 1; i <= 2; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 1
            ) {
              count++;
            } else {
              break;
            }
          }

          // 양쪽 끝 확인
          if (count >= 2) {
            // 한쪽 끝
            const endX1 = x + dx * count;
            const endY1 = y + dy * count;

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0 // 빈 위치인지 다시 확인
            ) {
              board[endY1][endX1] = 2;
              lastMove = { x: endX1, y: endY1 };
              return finishMove(endX1, endY1);
            }

            // 반대쪽 끝
            const endX2 = x - dx;
            const endY2 = y - dy;

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0 // 빈 위치인지 다시 확인
            ) {
              board[endY2][endX2] = 2;
              lastMove = { x: endX2, y: endY2 };
              return finishMove(endX2, endY2);
            }
          }
        }
      }
    }
  }

  // 그 외의 경우 중간 난이도 전략 사용
  mediumAI();
}

// 전문가 난이도 AI - 고급 전략
function expertAI() {
  // 첫 수는 항상 중앙에 두기
  const center = Math.floor(BOARD_SIZE / 2);
  if (board.flat().filter((cell) => cell !== 0).length < 2) {
    if (board[center][center] === 0) {
      board[center][center] = 2;
      lastMove = { x: center, y: center };
      return finishMove(center, center);
    }
  }

  // 1. 4개 연속 돌을 찾아 승리 기회 노리기 (공격)
  if (findFourInRow(2)) return;

  // 2. 상대방의 4개 연속 돌 방어하기
  if (findFourInRow(1)) return;

  // 3. 열린 3 (both sides open) 만들기 (공격)
  if (findOpenThree(2)) return;

  // 4. 상대방의 열린 3 방어하기
  if (findOpenThree(1)) return;

  // 5. 3개 연속 돌 확장하기 (공격)
  if (extendThreeInRow(2)) return;

  // 6. 상대방의 3개 연속 돌 방어하기
  if (extendThreeInRow(1)) return;

  // 7. 2개 연속 돌 확장하기 (공격)
  if (extendTwoInRow(2)) return;

  // 8. 전략적 포지션에 두기
  if (playStrategicPosition()) return;

  // 마지막 수단으로 하드 AI 사용
  hardAI();
}

// 4개 연속 돌을 찾아 5번째 돌을 두기
function findFourInRow(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 연속된 돌 확인
          let count = 1;
          let stones = [{ x, y }];

          // 한쪽 방향으로 확인
          for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === player
            ) {
              count++;
              stones.push({ x: nx, y: ny });
            } else {
              break;
            }
          }

          // 반대 방향으로 확인
          for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === player
            ) {
              count++;
              stones.push({ x: nx, y: ny });
            } else {
              break;
            }
          }

          // 정확히 4개 돌이 연속되면 5번째 돌을 두기
          if (count === 4) {
            // 양쪽 끝 확인
            let positions = [];

            // 한쪽 끝
            const endX1 =
              stones.reduce((max, stone) => Math.max(max, stone.x), -1) + dx;
            const endY1 =
              stones.reduce((max, stone) => Math.max(max, stone.y), -1) + dy;

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0
            ) {
              positions.push({ x: endX1, y: endY1 });
            }

            // 반대쪽 끝
            const endX2 =
              stones.reduce(
                (min, stone) => Math.min(min, stone.x),
                BOARD_SIZE
              ) - dx;
            const endY2 =
              stones.reduce(
                (min, stone) => Math.min(min, stone.y),
                BOARD_SIZE
              ) - dy;

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0
            ) {
              positions.push({ x: endX2, y: endY2 });
            }

            if (positions.length > 0) {
              const position =
                positions[Math.floor(Math.random() * positions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 열린 3 (양쪽이 열린 3개 연속 돌) 찾기 및 대응
function findOpenThree(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 열린 3 패턴 확인 (OOO_)
          let count = 1;
          let continuous = true;

          // 한쪽 방향으로 확인
          for (let i = 1; i <= 2; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === player
            ) {
              count++;
            } else {
              continuous = false;
              break;
            }
          }

          if (continuous && count === 3) {
            // 양쪽 끝 확인
            const endX1 = x + dx * 3;
            const endY1 = y + dy * 3;
            const endX2 = x - dx;
            const endY2 = y - dy;

            let isOpenThree = false;
            let positions = [];

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0
            ) {
              positions.push({ x: endX1, y: endY1 });
              isOpenThree = true;
            }

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0
            ) {
              positions.push({ x: endX2, y: endY2 });
              isOpenThree = true;
            }

            if (isOpenThree && positions.length > 0) {
              const position =
                positions[Math.floor(Math.random() * positions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 3개 연속 돌 확장하기
function extendThreeInRow(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 연속된 돌 확인
          let count = 1;

          // 한쪽 방향으로 확인
          for (let i = 1; i <= 2; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === player
            ) {
              count++;
            } else {
              break;
            }
          }

          if (count === 3) {
            // 양쪽 끝 확인
            const endX1 = x + dx * 3;
            const endY1 = y + dy * 3;
            const endX2 = x - dx;
            const endY2 = y - dy;

            let positions = [];

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0
            ) {
              positions.push({ x: endX1, y: endY1 });
            }

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0
            ) {
              positions.push({ x: endX2, y: endY2 });
            }

            if (positions.length > 0) {
              const position =
                positions[Math.floor(Math.random() * positions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 2개 연속 돌 확장하기
function extendTwoInRow(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 연속된 돌 확인
          const nx = x + dx;
          const ny = y + dy;

          if (
            nx >= 0 &&
            nx < BOARD_SIZE &&
            ny >= 0 &&
            ny < BOARD_SIZE &&
            board[ny][nx] === player
          ) {
            // 양쪽 끝 확인
            const endX1 = x + dx * 2;
            const endY1 = y + dy * 2;
            const endX2 = x - dx;
            const endY2 = y - dy;

            let positions = [];

            if (
              endX1 >= 0 &&
              endX1 < BOARD_SIZE &&
              endY1 >= 0 &&
              endY1 < BOARD_SIZE &&
              board[endY1][endX1] === 0
            ) {
              positions.push({ x: endX1, y: endY1 });
            }

            if (
              endX2 >= 0 &&
              endX2 < BOARD_SIZE &&
              endY2 >= 0 &&
              endY2 < BOARD_SIZE &&
              board[endY2][endX2] === 0
            ) {
              positions.push({ x: endX2, y: endY2 });
            }

            if (positions.length > 0) {
              const position =
                positions[Math.floor(Math.random() * positions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 전략적 위치에 돌 놓기
function playStrategicPosition() {
  const center = Math.floor(BOARD_SIZE / 2);

  // 중앙 주변 5x5 영역에 놓는 것을 선호
  const strategicPositions = [];

  // 1. 컴퓨터 돌 주변에 놓는 것을 선호
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 2) {
        // 컴퓨터 돌
        // 주변 8방향 확인
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 0
            ) {
              // 주변이 비어있으면 가중치를 높게 설정
              const weight = 5;
              for (let i = 0; i < weight; i++) {
                strategicPositions.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }
  }

  // 2. 상대방 돌 주변에 놓는 것도 고려 (방어)
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 1) {
        // 사용자 돌
        // 주변 8방향 확인
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 0
            ) {
              // 주변이 비어있으면 가중치를 적절히 설정
              const weight = 3;
              for (let i = 0; i < weight; i++) {
                strategicPositions.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }
  }

  // 3. 중앙 부근에 놓는 것을 선호
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = center + dx;
      const ny = center + dy;

      if (
        nx >= 0 &&
        nx < BOARD_SIZE &&
        ny >= 0 &&
        ny < BOARD_SIZE &&
        board[ny][nx] === 0
      ) {
        // 중앙에 가까울수록 가중치를 높게 설정
        const distFromCenter = Math.abs(dx) + Math.abs(dy);
        const weight = 5 - distFromCenter;

        for (let i = 0; i < weight; i++) {
          strategicPositions.push({ x: nx, y: ny });
        }
      }
    }
  }

  // 랜덤으로 전략적 위치 선택
  if (strategicPositions.length > 0) {
    const position =
      strategicPositions[Math.floor(Math.random() * strategicPositions.length)];
    board[position.y][position.x] = 2; // 컴퓨터의 돌
    lastMove = position;
    finishMove(position.x, position.y);
    return true;
  }

  return false;
}

// 마스터 난이도 AI - 최고급 전략
function masterAI() {
  // 첫 수는 항상 중앙에 두기
  const center = Math.floor(BOARD_SIZE / 2);
  if (board.flat().filter((cell) => cell !== 0).length < 2) {
    if (board[center][center] === 0) {
      board[center][center] = 2;
      lastMove = { x: center, y: center };
      return finishMove(center, center);
    } else {
      // 중앙이 이미 차 있다면 중앙 주변에 두기
      const nearCenterPositions = [
        { x: center - 1, y: center },
        { x: center + 1, y: center },
        { x: center, y: center - 1 },
        { x: center, y: center + 1 },
      ];

      for (const pos of nearCenterPositions) {
        if (
          pos.x >= 0 &&
          pos.x < BOARD_SIZE &&
          pos.y >= 0 &&
          pos.y < BOARD_SIZE &&
          board[pos.y][pos.x] === 0
        ) {
          board[pos.y][pos.x] = 2;
          lastMove = pos;
          return finishMove(pos.x, pos.y);
        }
      }
    }
  }

  // 1. 공격 패턴: 4개 연속 돌을 찾아 승리 기회 노리기
  if (findConsecutiveStones(2, 4)) return;

  // 2. 방어 패턴: 상대방의 4개 연속 돌 방어하기
  if (findConsecutiveStones(1, 4)) return;

  // 3. 공격 패턴: 양쪽이 열린 3 만들기
  if (findDoubleOpenThree(2)) return;

  // 4. 방어 패턴: 상대방의 양쪽이 열린 3 방어하기
  if (findDoubleOpenThree(1)) return;

  // 5. 공격 패턴: 한쪽이 열린 3 만들기
  if (findSingleOpenThree(2)) return;

  // 6. 방어 패턴: 상대방의 한쪽이 열린 3 방어하기
  if (findSingleOpenThree(1)) return;

  // 7. 공격 패턴: 잠재적인 열린 3 패턴 만들기 (2-1-2 패턴)
  if (createPotentialOpenThree()) return;

  // 8. 공격 패턴: 양방향 2 만들기 (잠재적인 열린 3 패턴의 기초)
  if (createDoubleTwoPattern()) return;

  // 9. 3개 연속 돌 확장하기
  if (extendThreeInRow(2)) return;

  // 10. 상대방의 3개 연속 돌 방어하기
  if (extendThreeInRow(1)) return;

  // 11. 전략적 위치에 놓기 (개선된 버전)
  if (playAdvancedStrategicPosition()) return;

  // 마지막 수단으로 expertAI 사용
  expertAI();
}

// 특정 개수의 연속된 돌 찾기 (N-in-a-row)
function findConsecutiveStones(player, targetCount) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 해당 방향으로 연속된 돌 확인
          let count = 1;
          let stones = [{ x, y }];

          // 양방향으로 확인
          for (let dir = -1; dir <= 1; dir += 2) {
            if (dir === 0) continue;

            for (let i = 1; i < 5; i++) {
              const nx = x + dx * i * dir;
              const ny = y + dy * i * dir;

              if (
                nx >= 0 &&
                nx < BOARD_SIZE &&
                ny >= 0 &&
                ny < BOARD_SIZE &&
                board[ny][nx] === player
              ) {
                count++;
                stones.push({ x: nx, y: ny });
              } else {
                break;
              }
            }
          }

          if (count === targetCount) {
            // 양 끝에 빈 공간이 있는지 확인
            let endPositions = [];

            // 돌의 최소/최대 좌표 계산
            let minX = BOARD_SIZE,
              minY = BOARD_SIZE,
              maxX = -1,
              maxY = -1;
            for (const stone of stones) {
              minX = Math.min(minX, stone.x);
              minY = Math.min(minY, stone.y);
              maxX = Math.max(maxX, stone.x);
              maxY = Math.max(maxY, stone.y);
            }

            // 양 끝 위치 계산
            let end1X, end1Y, end2X, end2Y;

            if (dx === 0) {
              // 수직
              end1X = minX;
              end1Y = minY - 1;
              end2X = maxX;
              end2Y = maxY + 1;
            } else if (dy === 0) {
              // 수평
              end1X = minX - 1;
              end1Y = minY;
              end2X = maxX + 1;
              end2Y = maxY;
            } else if (dx === 1 && dy === 1) {
              // 대각선 (왼쪽 위 -> 오른쪽 아래)
              end1X = minX - 1;
              end1Y = minY - 1;
              end2X = maxX + 1;
              end2Y = maxY + 1;
            } else {
              // 대각선 (왼쪽 아래 -> 오른쪽 위)
              end1X = minX - 1;
              end1Y = maxY + 1;
              end2X = maxX + 1;
              end2Y = minY - 1;
            }

            // 양 끝 위치가 유효한지 확인
            if (
              end1X >= 0 &&
              end1X < BOARD_SIZE &&
              end1Y >= 0 &&
              end1Y < BOARD_SIZE &&
              board[end1Y][end1X] === 0
            ) {
              endPositions.push({ x: end1X, y: end1Y });
            }

            if (
              end2X >= 0 &&
              end2X < BOARD_SIZE &&
              end2Y >= 0 &&
              end2Y < BOARD_SIZE &&
              board[end2Y][end2X] === 0
            ) {
              endPositions.push({ x: end2X, y: end2Y });
            }

            if (endPositions.length > 0) {
              const position =
                endPositions[Math.floor(Math.random() * endPositions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 양쪽이 열린 3 (더블 오픈 쓰리) 찾기 및 처리
function findDoubleOpenThree(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          // 패턴 확인: _OOO_
          let count = 1;
          let leftOpen = false;
          let rightOpen = false;

          // 양방향 확인
          // 오른쪽 방향 확인
          for (let i = 1; i <= 2; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === player
            ) {
              count++;
            } else {
              break;
            }
          }

          // 오른쪽 끝이 비어있는지 확인
          const rightX = x + dx * 3;
          const rightY = y + dy * 3;

          if (
            rightX >= 0 &&
            rightX < BOARD_SIZE &&
            rightY >= 0 &&
            rightY < BOARD_SIZE &&
            board[rightY][rightX] === 0
          ) {
            rightOpen = true;
          }

          // 왼쪽 방향 확인
          const leftX = x - dx;
          const leftY = y - dy;

          if (
            leftX >= 0 &&
            leftX < BOARD_SIZE &&
            leftY >= 0 &&
            leftY < BOARD_SIZE &&
            board[leftY][leftX] === 0
          ) {
            leftOpen = true;
          }

          // 양쪽이 열린 3이면 막거나 만들기
          if (count === 3 && leftOpen && rightOpen) {
            // 끝에 돌 두기 (랜덤으로 선택)
            const positions = [];

            if (rightOpen) {
              positions.push({ x: rightX, y: rightY });
            }

            if (leftOpen) {
              positions.push({ x: leftX, y: leftY });
            }

            if (positions.length > 0) {
              const position =
                positions[Math.floor(Math.random() * positions.length)];
              board[position.y][position.x] = 2; // 컴퓨터의 돌
              lastMove = position;
              finishMove(position.x, position.y);
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

// 한쪽이 열린 3 (싱글 오픈 쓰리) 찾기 및 처리
function findSingleOpenThree(player) {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === player) {
        for (const [dx, dy] of directions) {
          let pattern1 = checkPattern(x, y, dx, dy, player, [1, 1, 1, 0]); // OOO_
          let pattern2 = checkPattern(x, y, dx, dy, player, [0, 1, 1, 1]); // _OOO

          if (pattern1.match) {
            const pos = {
              x: pattern1.positions[3].x,
              y: pattern1.positions[3].y,
            };
            board[pos.y][pos.x] = 2; // 컴퓨터의 돌
            lastMove = pos;
            finishMove(pos.x, pos.y);
            return true;
          }

          if (pattern2.match) {
            const pos = {
              x: pattern2.positions[0].x,
              y: pattern2.positions[0].y,
            };
            board[pos.y][pos.x] = 2; // 컴퓨터의 돌
            lastMove = pos;
            finishMove(pos.x, pos.y);
            return true;
          }
        }
      }
    }
  }

  return false;
}

// 패턴 체크 유틸리티 함수
function checkPattern(startX, startY, dx, dy, player, pattern) {
  let positions = [];
  let match = true;

  for (let i = 0; i < pattern.length; i++) {
    const x = startX + dx * i;
    const y = startY + dy * i;

    positions.push({ x, y });

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      match = false;
      break;
    }

    const expected = pattern[i] === 1 ? player : 0;
    if (board[y][x] !== expected) {
      match = false;
      break;
    }
  }

  return { match, positions };
}

// 잠재적인 열린 3 패턴 만들기 (2-1-2 패턴)
function createPotentialOpenThree() {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        // 빈 위치를 탐색
        for (const [dx, dy] of directions) {
          // 패턴 확인: OO_OO (중앙에 돌을 놓아 OOO_OO 패턴 만들기)
          const pattern1 = [2, 2, 0, 2, 2]; // 컴퓨터의 패턴
          let match = true;

          for (let i = -2; i <= 2; i++) {
            if (i === 0) continue; // 현재 위치 스킵

            const nx = x + dx * i;
            const ny = y + dy * i;

            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
              match = false;
              break;
            }

            const patternIndex = i + 2;
            if (board[ny][nx] !== pattern1[patternIndex]) {
              match = false;
              break;
            }
          }

          if (match) {
            board[y][x] = 2; // 컴퓨터의 돌
            lastMove = { x, y };
            finishMove(x, y);
            return true;
          }
        }
      }
    }
  }

  return false;
}

// 양방향 2 패턴 만들기 (더블 투)
function createDoubleTwoPattern() {
  // 두 방향에서 동시에 2개 연속 돌을 만들 수 있는 위치 찾기
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        const directionPairs = [
          [
            [0, 1],
            [1, 0],
          ], // 수평 + 수직
          [
            [0, 1],
            [1, 1],
          ], // 수평 + 대각선 (왼쪽 위 -> 오른쪽 아래)
          [
            [0, 1],
            [1, -1],
          ], // 수평 + 대각선 (왼쪽 아래 -> 오른쪽 위)
          [
            [1, 0],
            [1, 1],
          ], // 수직 + 대각선 (왼쪽 위 -> 오른쪽 아래)
          [
            [1, 0],
            [1, -1],
          ], // 수직 + 대각선 (왼쪽 아래 -> 오른쪽 위)
          [
            [1, 1],
            [1, -1],
          ], // 대각선 + 대각선
        ];

        for (const [dir1, dir2] of directionPairs) {
          let count1 = countStonesInDirection(x, y, dir1[0], dir1[1], 2);
          let count2 = countStonesInDirection(x, y, dir2[0], dir2[1], 2);

          if (count1 >= 2 && count2 >= 2) {
            board[y][x] = 2; // 컴퓨터의 돌
            lastMove = { x, y };
            finishMove(x, y);
            return true;
          }
        }
      }
    }
  }

  return false;
}

// 주어진 방향으로 돌 개수 세기
function countStonesInDirection(x, y, dx, dy, player) {
  // 주어진 위치에 돌을 놓았을 때 형성되는 연속된 돌 개수
  let count = 1; // 현재 위치에 가상으로 돌을 놓음

  // 양방향 확인
  for (let dir = -1; dir <= 1; dir += 2) {
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i * dir;
      const ny = y + dy * i * dir;

      if (
        nx >= 0 &&
        nx < BOARD_SIZE &&
        ny >= 0 &&
        ny < BOARD_SIZE &&
        board[ny][nx] === player
      ) {
        count++;
      } else {
        break;
      }
    }
  }

  return count;
}

// 고급 전략적 위치 선택
function playAdvancedStrategicPosition() {
  const center = Math.floor(BOARD_SIZE / 2);
  const strategicPositions = [];

  // 1. 컴퓨터 돌 주변에 놓는 것을 선호
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 2) {
        // 컴퓨터 돌
        // 주변 8방향 확인
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 0
            ) {
              // 상대방 돌이 인접해 있는지 확인
              let hasAdjacentOpponent = false;
              for (let ady = -1; ady <= 1; ady++) {
                for (let adx = -1; adx <= 1; adx++) {
                  if (adx === 0 && ady === 0) continue;

                  const anx = nx + adx;
                  const any = ny + ady;

                  if (
                    anx >= 0 &&
                    anx < BOARD_SIZE &&
                    any >= 0 &&
                    any < BOARD_SIZE &&
                    board[any][anx] === 1
                  ) {
                    hasAdjacentOpponent = true;
                    break;
                  }
                }
                if (hasAdjacentOpponent) break;
              }

              // 가중치 설정 (상대방 돌이 인접해 있으면 더 높은 가중치)
              const weight = hasAdjacentOpponent ? 10 : 5;
              for (let i = 0; i < weight; i++) {
                strategicPositions.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }
  }

  // 2. 상대방 돌 주변에 놓는 것도 고려 (방어 및 공격)
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 1) {
        // 사용자 돌
        // 주변 8방향 확인
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 0
            ) {
              // 다른 상대방 돌이 인접해 있는지 확인
              let adjacentOpponentCount = 0;
              for (let ady = -1; ady <= 1; ady++) {
                for (let adx = -1; adx <= 1; adx++) {
                  if (adx === 0 && ady === 0) continue;

                  const anx = nx + adx;
                  const any = ny + ady;

                  if (
                    anx >= 0 &&
                    anx < BOARD_SIZE &&
                    any >= 0 &&
                    any < BOARD_SIZE &&
                    board[any][anx] === 1
                  ) {
                    adjacentOpponentCount++;
                  }
                }
              }

              // 인접한 상대방 돌이 많을수록 더 높은 가중치
              const weight = 3 + adjacentOpponentCount * 2;
              for (let i = 0; i < weight; i++) {
                strategicPositions.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }
  }

  // 3. 중앙 부근에 놓는 것을 선호
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const nx = center + dx;
      const ny = center + dy;

      if (
        nx >= 0 &&
        nx < BOARD_SIZE &&
        ny >= 0 &&
        ny < BOARD_SIZE &&
        board[ny][nx] === 0
      ) {
        // 중앙에 가까울수록 가중치를 높게 설정
        const distFromCenter = Math.abs(dx) + Math.abs(dy);
        const weight = Math.max(1, 7 - distFromCenter);

        for (let i = 0; i < weight; i++) {
          strategicPositions.push({ x: nx, y: ny });
        }
      }
    }
  }

  // 4. 전략적 포인트(화점) 주변에 놓는 것도 고려
  const starPoints = [3, 7, 11];
  for (let i = 0; i < starPoints.length; i++) {
    for (let j = 0; j < starPoints.length; j++) {
      const x = starPoints[i];
      const y = starPoints[j];

      if (board[y][x] === 0) {
        // 화점에 가중치 부여
        const weight = 3;
        for (let k = 0; k < weight; k++) {
          strategicPositions.push({ x, y });
        }
      }

      // 화점 주변에도 가중치 부여
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (
            nx >= 0 &&
            nx < BOARD_SIZE &&
            ny >= 0 &&
            ny < BOARD_SIZE &&
            board[ny][nx] === 0
          ) {
            const weight = 2;
            for (let k = 0; k < weight; k++) {
              strategicPositions.push({ x: nx, y: ny });
            }
          }
        }
      }
    }
  }

  // 랜덤으로 전략적 위치 선택
  if (strategicPositions.length > 0) {
    const position =
      strategicPositions[Math.floor(Math.random() * strategicPositions.length)];
    board[position.y][position.x] = 2; // 컴퓨터의 돌
    lastMove = position;
    finishMove(position.x, position.y);
    return true;
  }

  return false;
}

// 클릭 이벤트 처리
canvas.addEventListener("click", (e) => {
  if (!gameActive || currentPlayer !== 1) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  // 범위 확인
  if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;

  // 이미 돌이 있는지 확인
  if (board[y][x] !== 0) return;

  // 돌 놓기
  board[y][x] = currentPlayer;
  lastMove = { x, y };

  finishMove(x, y);
});

// 터치 이벤트 처리
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault(); // 더블 탭 줌 방지

    if (!gameActive || currentPlayer !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.floor((touch.clientX - rect.left) / cellSize);
    const y = Math.floor((touch.clientY - rect.top) / cellSize);

    // 범위 확인
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;

    // 이미 돌이 있는지 확인
    if (board[y][x] !== 0) return;

    // 돌 놓기
    board[y][x] = currentPlayer;
    lastMove = { x, y };

    finishMove(x, y);
  },
  { passive: false }
);

// 시작 버튼 이벤트
startButton.addEventListener("click", showGameScreen);

// 홈 버튼 이벤트
homeButton.addEventListener("click", returnToIntro);

// 재시작 버튼 이벤트
restartButton.addEventListener("click", initGame);

// 화면 크기 변경 시 캔버스 조정
window.addEventListener("resize", () => {
  if (gameActive) {
    setupCanvas();
    drawBoard();
  }
});
