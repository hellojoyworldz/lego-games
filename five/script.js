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
let currentDifficulty = "ultraMaster"; // 기본 난이도
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
  currentDifficulty = difficultySelector.value;

  // 게임 시작
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
  currentPlayer = 2;
  timeLeft = 20;
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

  // AI가 선공이므로 AI 턴 실행 (시간 지연 추가)
  if (currentPlayer === 2 && gameActive) {
    setTimeout(function () {
      computerMove();
    }, 1000);
  }
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
  timeLeft = 20;
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
    case "ultraMaster":
      ultraMasterAI();
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

  // 1. 승리 가능한 위치 찾기 (5개 완성) - 이미 원래 코드에서 구현됨
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

  // 2. 사용자의 즉시 승리를 방어 - 이미 원래 코드에서 구현됨
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

  // 3. 사용자의 3-3 패턴 차단 (새로 추가된 기능)
  const threethreePosition = findThreeThreePattern();
  if (threethreePosition) {
    const { x, y } = threethreePosition;
    board[y][x] = 2;
    lastMove = { x, y };
    return finishMove(x, y);
  }

  // 4. 공격 패턴: 4개 연속 돌을 찾아 승리 기회 노리기
  if (findFourInRow(2)) return;

  // 5. 방어 패턴: 상대방의 4개 연속 돌 방어하기
  if (findFourInRow(1)) return;

  // 6. 열린 3 (both sides open) 만들기 (공격)
  if (findOpenThree(2)) return;

  // 7. 상대방의 열린 3 방어하기
  if (findOpenThree(1)) return;

  // 8. 3개 연속 돌 확장하기 (공격)
  if (extendThreeInRow(2)) return;

  // 9. 상대방의 3개 연속 돌 방어하기
  if (extendThreeInRow(1)) return;

  // 10. 2개 연속 돌 확장하기 (공격)
  if (extendTwoInRow(2)) return;

  // 11. 전략적 포지션에 두기
  if (playStrategicPosition()) return;

  // 마지막 수단으로 하드 AI 사용
  hardAI();
}

// 3-3 패턴을 찾는 함수 (새로 추가)
function findThreeThreePattern() {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  // 모든 빈 위치 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 검사

      // 이 위치에 임시로 사용자 돌을 놓아봄
      board[y][x] = 1;

      // 열린 3이 형성되는 방향 카운트
      let openThreeCount = 0;

      // 각 방향에서 열린 3이 있는지 확인
      for (const [dx, dy] of directions) {
        if (isOpenThree(x, y, dx, dy, 1)) {
          openThreeCount++;
        }
      }

      // 원래대로 돌려놓기
      board[y][x] = 0;

      // 두 방향 이상에서 열린 3이 형성되면 (3-3 패턴) 이 위치 반환
      if (openThreeCount >= 2) {
        return { x, y };
      }
    }
  }

  return null;
}

// 열린 3 패턴 확인 함수 (새로 추가)
function isOpenThree(x, y, dx, dy, player) {
  // 해당 방향으로 연속된 돌의 수 계산
  let count = 1; // 현재 위치 포함
  let leftOpen = true;
  let rightOpen = true;

  // 왼쪽 방향 확인
  for (let i = 1; i <= 2; i++) {
    const nx = x - dx * i;
    const ny = y - dy * i;

    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      leftOpen = false;
      break;
    }

    if (board[ny][nx] === player) {
      count++;
    } else if (board[ny][nx] === 0) {
      // 한 칸 더 확인하여 진짜로 열려있는지 확인
      const nx2 = nx - dx;
      const ny2 = ny - dy;

      if (
        nx2 < 0 ||
        nx2 >= BOARD_SIZE ||
        ny2 < 0 ||
        ny2 >= BOARD_SIZE ||
        board[ny2][nx2] !== 0
      ) {
        leftOpen = false;
      }
      break;
    } else {
      leftOpen = false;
      break;
    }
  }

  // 오른쪽 방향 확인
  for (let i = 1; i <= 2; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;

    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      rightOpen = false;
      break;
    }

    if (board[ny][nx] === player) {
      count++;
    } else if (board[ny][nx] === 0) {
      // 한 칸 더 확인하여 진짜로 열려있는지 확인
      const nx2 = nx + dx;
      const ny2 = ny + dy;

      if (
        nx2 < 0 ||
        nx2 >= BOARD_SIZE ||
        ny2 < 0 ||
        ny2 >= BOARD_SIZE ||
        board[ny2][nx2] !== 0
      ) {
        rightOpen = false;
      }
      break;
    } else {
      rightOpen = false;
      break;
    }
  }

  // 돌이 정확히 3개이고, 양쪽이 모두 열려있으면 열린 3
  return count === 3 && leftOpen && rightOpen;
}

// 마스터 난이도 AI - 최고급 전략 (향상된 버전)
function ultraMasterAI() {
  // 첫 수는 항상 중앙이나 중앙 근처에 두기
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
        { x: center - 1, y: center - 1 },
        { x: center + 1, y: center + 1 },
        { x: center - 1, y: center + 1 },
        { x: center + 1, y: center - 1 },
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

  // 1. 승리 가능한 위치 찾기 (5개 완성)
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        board[y][x] = 2;
        if (checkWin(y, x)) {
          lastMove = { x, y };
          return finishMove(x, y);
        }
        board[y][x] = 0;
      }
    }
  }

  // 2. 사용자의 즉시 승리를 방어
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
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

  // 3. 투수삼목 전략 (새로 추가) - 두 개의 열린 삼목 생성 기회 찾기
  const doubleThreatPosition = findDoubleThreatPosition();
  if (doubleThreatPosition) {
    const { x, y } = doubleThreatPosition;
    board[y][x] = 2;
    lastMove = { x, y };
    return finishMove(x, y);
  }

  // 4. 사용자의 3-3 패턴 차단
  const threethreePosition = findThreeThreePattern();
  if (threethreePosition) {
    const { x, y } = threethreePosition;
    board[y][x] = 2;
    lastMove = { x, y };
    return finishMove(x, y);
  }

  // 5. 사용자의 4-3 패턴 차단 (새로 추가)
  const fourthreePosition = findFourThreePattern();
  if (fourthreePosition) {
    const { x, y } = fourthreePosition;
    board[y][x] = 2;
    lastMove = { x, y };
    return finishMove(x, y);
  }

  // 6. 공격: 4개 연속 돌 만들기
  if (findFourInRow(2)) return;

  // 7. 방어: 상대방의 4개 연속 돌 방어
  if (findFourInRow(1)) return;

  // 8. 은닉된 4 패턴 만들기 (새로 추가)
  if (createHiddenFour()) return;

  // 9. 열린 3 만들기
  if (findOpenThree(2)) return;

  // 10. 상대방의 열린 3 방어
  if (findOpenThree(1)) return;

  // 11. 3개 연속 돌 확장 (공격)
  if (extendThreeInRow(2)) return;

  // 12. 상대방의 3개 연속 돌 방어
  if (extendThreeInRow(1)) return;

  // 13. 2개 연속 돌 확장 (공격)
  if (extendTwoInRow(2)) return;

  // 14. 전략적 포지션 평가
  if (playStrategicPositionAdvanced()) return;

  // 15. 좋은 형태의 두수 찾기 (새로 추가)
  if (findGoodShapeMove()) return;

  // 마지막 수단으로 하드 AI 사용
  masterAI();
}

// 투수삼목 전략 - 두 개의 열린 삼목을 동시에 만들 수 있는 위치 찾기
function findDoubleThreatPosition() {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  // 모든 빈 위치 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 검사

      // 이 위치에 임시로 컴퓨터 돌을 놓아봄
      board[y][x] = 2;

      // 열린 3이 형성되는 방향 카운트
      let openThreeCount = 0;

      // 각 방향에서 열린 3이 있는지 확인
      for (const [dx, dy] of directions) {
        if (isOpenThree(x, y, dx, dy, 2)) {
          openThreeCount++;
        }
      }

      // 원래대로 돌려놓기
      board[y][x] = 0;

      // 두 방향 이상에서 열린 3이 형성되면 (투수삼목) 이 위치 반환
      if (openThreeCount >= 2) {
        return { x, y };
      }
    }
  }

  return null;
}

// 4-3 패턴 찾기 (새로 추가)
function findFourThreePattern() {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  // 모든 빈 위치 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 검사

      // 이 위치에 임시로 사용자 돌을 놓아봄
      board[y][x] = 1;

      let hasFour = false;
      let hasOpenThree = false;

      // 4목이 있는지 확인
      for (const [dx, dy] of directions) {
        if (checkFourInRow(x, y, dx, dy, 1)) {
          hasFour = true;
          break;
        }
      }

      // 열린 3목이 있는지 확인
      if (!hasFour) {
        for (const [dx, dy] of directions) {
          if (isOpenThree(x, y, dx, dy, 1)) {
            hasOpenThree = true;
            break;
          }
        }
      }

      // 원래대로 돌려놓기
      board[y][x] = 0;

      // 4목과 열린 3목이 모두 있으면 이 위치에 돌을 두어 방어
      if (hasFour && hasOpenThree) {
        return { x, y };
      }
    }
  }

  return null;
}

// 4목 확인 함수 (새로 추가)
function checkFourInRow(x, y, dx, dy, player) {
  // 해당 방향으로 연속된 돌의 수 계산
  let count = 1; // 현재 위치 포함

  // 왼쪽 방향 확인
  for (let i = 1; i <= 3; i++) {
    const nx = x - dx * i;
    const ny = y - dy * i;

    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      break;
    }

    if (board[ny][nx] === player) {
      count++;
    } else {
      break;
    }
  }

  // 오른쪽 방향 확인
  for (let i = 1; i <= 3; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;

    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      break;
    }

    if (board[ny][nx] === player) {
      count++;
    } else {
      break;
    }
  }

  // 돌이 정확히 4개이면 참
  return count === 4;
}

// 은닉된 4 패턴 만들기 (새로 추가)
function createHiddenFour() {
  const directions = [
    [0, 1], // 수평
    [1, 0], // 수직
    [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
    [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
  ];

  // 모든 빈 위치 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 검사

      // 이 위치에 임시로 컴퓨터 돌을 놓아봄
      board[y][x] = 2;

      // 각 방향에서 확인
      for (const [dx, dy] of directions) {
        // 현재 위치에서 양쪽으로 돌의 패턴 확인
        // OO_OO 패턴 찾기 (O는 돌, _는 빈 칸)

        // 왼쪽 검사
        let leftCount = 0;
        for (let i = 1; i <= 2; i++) {
          const nx = x - dx * i;
          const ny = y - dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
            break;
          }

          if (board[ny][nx] === 2) {
            leftCount++;
          } else {
            break;
          }
        }

        // 오른쪽 검사
        let rightCount = 0;
        for (let i = 1; i <= 2; i++) {
          const nx = x + dx * i;
          const ny = y + dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
            break;
          }

          if (board[ny][nx] === 2) {
            rightCount++;
          } else {
            break;
          }
        }

        // 패턴이 OO_OO 형태인지 확인 (총 5개 중 가운데 채움)
        if (leftCount + rightCount >= 3) {
          // 원래대로 돌려놓기
          board[y][x] = 0;

          // 이 위치에 실제로 돌 놓기
          board[y][x] = 2;
          lastMove = { x, y };
          finishMove(x, y);
          return true;
        }

        // 또는 O_OOO 혹은 OOO_O 패턴 찾기
        // 왼쪽 한 칸 건너뛰기
        if (leftCount === 1) {
          const skipX = x - dx * 2;
          const skipY = y - dy * 2;

          if (
            skipX >= 0 &&
            skipX < BOARD_SIZE &&
            skipY >= 0 &&
            skipY < BOARD_SIZE &&
            board[skipY][skipX] === 0
          ) {
            const nx = skipX - dx;
            const ny = skipY - dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 2
            ) {
              // 원래대로 돌려놓기
              board[y][x] = 0;

              // 이 위치에 실제로 돌 놓기
              board[y][x] = 2;
              lastMove = { x, y };
              finishMove(x, y);
              return true;
            }
          }
        }

        // 오른쪽 한 칸 건너뛰기
        if (rightCount === 1) {
          const skipX = x + dx * 2;
          const skipY = y + dy * 2;

          if (
            skipX >= 0 &&
            skipX < BOARD_SIZE &&
            skipY >= 0 &&
            skipY < BOARD_SIZE &&
            board[skipY][skipX] === 0
          ) {
            const nx = skipX + dx;
            const ny = skipY + dy;

            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[ny][nx] === 2
            ) {
              // 원래대로 돌려놓기
              board[y][x] = 0;

              // 이 위치에 실제로 돌 놓기
              board[y][x] = 2;
              lastMove = { x, y };
              finishMove(x, y);
              return true;
            }
          }
        }
      }

      // 원래대로 돌려놓기
      board[y][x] = 0;
    }
  }

  return false;
}

// 향상된 전략적 위치 평가
function playStrategicPositionAdvanced() {
  // 위치 평가 점수 배열 초기화
  const scoreBoard = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(0));

  // 평가 기준:
  // 1. 컴퓨터 돌에 인접한 위치 (가중치 높음)
  // 2. 사용자 돌에 인접한 위치 (방어)
  // 3. 중앙에 가까운 위치 선호
  // 4. 상대방 돌 차단 및 자신의 돌 연결 가능성

  const center = Math.floor(BOARD_SIZE / 2);

  // 점수 계산
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 평가

      // 1. 중앙에 가까울수록 기본 점수 높게
      const distFromCenter = Math.abs(x - center) + Math.abs(y - center);
      scoreBoard[y][x] += Math.max(1, 10 - distFromCenter);

      // 2. 인접한 돌 평가
      let playerStoneCount = 0;
      let computerStoneCount = 0;

      // 8방향 확인
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE)
            continue;

          if (board[ny][nx] === 1) {
            playerStoneCount++;
          } else if (board[ny][nx] === 2) {
            computerStoneCount++;
          }
        }
      }

      // 컴퓨터 돌에 인접할수록 높은 점수
      scoreBoard[y][x] += computerStoneCount * 8;

      // 사용자 돌에 인접할수록 중간 점수 (방어)
      scoreBoard[y][x] += playerStoneCount * 6;

      // 3. 공격 및 방어 패턴 평가
      // 임시로 컴퓨터 돌 놓기
      board[y][x] = 2;

      // 공격 패턴 평가
      const directions = [
        [0, 1], // 수평
        [1, 0], // 수직
        [1, 1], // 대각선 (왼쪽 위 -> 오른쪽 아래)
        [1, -1], // 대각선 (왼쪽 아래 -> 오른쪽 위)
      ];

      for (const [dx, dy] of directions) {
        // 연속 돌 확인
        let continuousStones = 1; // 현재 위치 포함
        let emptyAfter = 0;
        let emptyBefore = 0;

        // 한쪽 방향
        for (let i = 1; i <= 4; i++) {
          const nx = x + dx * i;
          const ny = y + dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;

          if (board[ny][nx] === 2) {
            continuousStones++;
          } else if (board[ny][nx] === 0) {
            emptyAfter++;
            break;
          } else {
            break;
          }
        }

        // 반대 방향
        for (let i = 1; i <= 4; i++) {
          const nx = x - dx * i;
          const ny = y - dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;

          if (board[ny][nx] === 2) {
            continuousStones++;
          } else if (board[ny][nx] === 0) {
            emptyBefore++;
            break;
          } else {
            break;
          }
        }

        // 패턴에 따른 점수 부여
        if (continuousStones >= 2) {
          // 양쪽이 열린 경우 더 높은 점수
          if (emptyBefore > 0 && emptyAfter > 0) {
            scoreBoard[y][x] += continuousStones * 15;
          } else if (emptyBefore > 0 || emptyAfter > 0) {
            // 한쪽만 열린 경우
            scoreBoard[y][x] += continuousStones * 10;
          }
        }
      }

      // 임시 돌 제거
      board[y][x] = 0;

      // 방어 패턴 평가 (사용자 돌에 대해 동일 평가)
      board[y][x] = 1;

      for (const [dx, dy] of directions) {
        let continuousStones = 1;
        let emptyAfter = 0;
        let emptyBefore = 0;

        // 한쪽 방향
        for (let i = 1; i <= 4; i++) {
          const nx = x + dx * i;
          const ny = y + dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;

          if (board[ny][nx] === 1) {
            continuousStones++;
          } else if (board[ny][nx] === 0) {
            emptyAfter++;
            break;
          } else {
            break;
          }
        }

        // 반대 방향
        for (let i = 1; i <= 4; i++) {
          const nx = x - dx * i;
          const ny = y - dy * i;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;

          if (board[ny][nx] === 1) {
            continuousStones++;
          } else if (board[ny][nx] === 0) {
            emptyBefore++;
            break;
          } else {
            break;
          }
        }

        // 패턴에 따른 점수 부여 (방어는 공격보다 약간 낮은 우선순위)
        if (continuousStones >= 2) {
          if (emptyBefore > 0 && emptyAfter > 0) {
            scoreBoard[y][x] += continuousStones * 12;
          } else if (emptyBefore > 0 || emptyAfter > 0) {
            scoreBoard[y][x] += continuousStones * 8;
          }
        }
      }

      // 임시 돌 제거
      board[y][x] = 0;
    }
  }

  // 최고 점수 위치 찾기
  let maxScore = -1;
  let bestPositions = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0 && scoreBoard[y][x] > maxScore) {
        maxScore = scoreBoard[y][x];
        bestPositions = [{ x, y }];
      } else if (board[y][x] === 0 && scoreBoard[y][x] === maxScore) {
        bestPositions.push({ x, y });
      }
    }
  }

  if (bestPositions.length > 0) {
    // 최고 점수가 여러 개면 랜덤 선택
    const position =
      bestPositions[Math.floor(Math.random() * bestPositions.length)];
    board[position.y][position.x] = 2;
    lastMove = position;
    finishMove(position.x, position.y);
    return true;
  }

  return false;
}

// 좋은 형태의 두수 찾기 (새로 추가)
function findGoodShapeMove() {
  // 좋은 형태 패턴들:
  // 1. 삼각형 모양 만들기 (세 돌이 삼각형 꼭지점에 위치)
  // 2. 나이트 모브 패턴 (체스의 나이트처럼 L자 모양으로 돌 연결)

  const goodMoves = [];

  // 모든 빈 위치 검사
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // 빈 위치만 검사

      let score = 0;

      // 삼각형 패턴 찾기
      const trianglePatterns = [
        // 오른쪽 아래 삼각형
        [
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 1, dy: 1 },
        ],
        // 오른쪽 위 삼각형
        [
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 1, dy: -1 },
        ],
        // 왼쪽 아래 삼각형
        [
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 1 },
        ],
        // 왼쪽 위 삼각형
        [
          { dx: -1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: -1, dy: -1 },
        ],
      ];

      // 삼각형 패턴 점수 계산
      for (const pattern of trianglePatterns) {
        let patternScore = 0;
        let valid = true;

        for (const { dx, dy } of pattern) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
            valid = false;
            break;
          }

          if (board[ny][nx] === 2) {
            patternScore += 10;
          } else if (board[ny][nx] === 1) {
            patternScore -= 5;
            valid = false;
            break;
          }
        }

        if (valid && patternScore > 0) {
          score += patternScore;
        }
      }

      // 나이트 무브 패턴 찾기
      const knightPatterns = [
        { dx: 1, dy: 2 },
        { dx: 2, dy: 1 },
        { dx: -1, dy: 2 },
        { dx: -2, dy: 1 },
        { dx: 1, dy: -2 },
        { dx: 2, dy: -1 },
        { dx: -1, dy: -2 },
        { dx: -2, dy: -1 },
      ];

      for (const { dx, dy } of knightPatterns) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (board[ny][nx] === 2) {
            score += 8; // 나이트 무브 패턴에 점수 부여
          }
        }
      }

      // 총점이 특정 임계값 이상이면 좋은 수로 간주
      if (score >= 10) {
        goodMoves.push({ x, y, score });
      }
    }
  }

  // 점수순으로 정렬
  goodMoves.sort((a, b) => b.score - a.score);

  // 최상위 수 선택
  if (goodMoves.length > 0) {
    const topMoves = goodMoves.filter(
      (move) => move.score >= goodMoves[0].score * 0.8
    );
    const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];

    board[selectedMove.y][selectedMove.x] = 2;
    lastMove = { x: selectedMove.x, y: selectedMove.y };
    finishMove(selectedMove.x, selectedMove.y);
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
