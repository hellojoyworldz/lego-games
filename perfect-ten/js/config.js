export const TARGET_FPS = 60; // 기준 FPS

/** 물리·필드 경계 */
export const PHYSICS = {
  ballRadius: 26, // 구슬 반지름
  playfieldBottomPad: 6, // 캔버스 하단 여백
  gravity: 0.23, // 중력
  friction: 0.96, // 마찰
  restitution: 0.38, // 반발(튕김)
  deadlineY: 120, // 위험선 Y
  stackSettledVelocity: 2.5, // 쌓임 판정 속도
};

/** 제한시간·감소·BGM 긴급 구간 */
export const TIMER = {
  initial: TARGET_FPS * 15, // 시작 제한시간
  max: TARGET_FPS * 30, // 제한시간 상한
  decayScale: 0.008, // 시간 감소 가속
  dangerThreshold: TARGET_FPS * 3, // 시간 부족 연출 시작
  hurryUpEvery: 3, // 위험 구간 진입 N번마다 hurry-up 1회
  bgmUrgent: TARGET_FPS * 5, // BGM 긴급 모드
  bgmPanic: TARGET_FPS * 3, // BGM 패닉 모드
};

/** 10 맞춤·올클리어·패널티 */
export const MATCH = {
  popRewards: {
    2: { time: TARGET_FPS * 2, score: 100 }, // 2개로 10
    3: { time: TARGET_FPS * 2, score: 300 }, // 3개로 10
    4: { time: TARGET_FPS * 4, score: 850 }, // 4개로 10
    5: { time: (TARGET_FPS * 15) / 2, score: 1800 }, // 5개+로 10
  },
  perfectClear: {
    score: 5000, // 올클리어 점수
    time: TARGET_FPS * 10, // 올클리어 시간 보너스
  },
  penaltyDuration: TARGET_FPS / 3, // 10 초과 패널티
  matchSpawnCount: 2, // 10 맞춤 시 낙하 구슬 수
};

/** 콤보 */
export const COMBO = {
  reset: TARGET_FPS * 3, // 콤보 끊김 간격
  startAfter: 2, // N회 성공 후 콤보 시작
  displaySuffix: "COMBO", // UI 접미사
  pitchStart: 1.2, // 콤보 음성 pitch 시작
  pitchStep: 0.03, // 콤보당 pitch 증가
  pitchMax: null, // pitch 상한 (null=무제한)
};

/** PERFECT TEN FEVER */
export const FEVER = {
  comboInterval: 7, // N콤보마다 FEVER
  announceTime: 0, // 시작 연출(프레임, 0=바로 플레이)
  countdownSeconds: 5, // 연타 구간(초)
  goldenScore: 150, // 황금 10 1개당 점수
  grantsMatchTime: false, // 탭 시 시간 추가 여부
  goldenTime: TARGET_FPS * 2, // 탭 시 시간 보상
  spawnInterval: TARGET_FPS / 3, // 황금 10 낙하 간격
  meteorSpawnInterval: 2, // 유성우 간격
  bgm: {
    bpm: 196, // FEVER BGM 템포
    bpmStep: 10, // FEVER 단계마다 BPM +
    bassPattern: [
      261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63, 293.66,
      369.99, 440.0, 587.33, 739.99, 587.33, 440.0, 369.99,
    ],
  },
  ballColor: {
    fillTop: "#FFE066",
    fillBottom: "#FFC400",
    shadowRgb: "255, 196, 0",
    shadowBlur: 22,
    shadowGlowMin: 0.45,
    shadowGlowAmp: 0.18,
    pulseSpeed: 0.14,
    radiusScale: 1.05,
    radiusPulseAmp: 0.04,
    highlightStops: [
      [0, "rgba(255, 255, 255, 0.48)"],
      [0.55, "rgba(255, 255, 255, 0.1)"],
      [1, "rgba(255, 180, 0, 0.08)"],
    ],
    particleGlow: "#FFE066",
    particleFill: "#FFC400",
    meteorTailFade: "rgba(255, 202, 40, 0)",
    meteorShadow: "#FFD700",
  },
};

/** TIME BONUS */
export const TIME_BONUS = {
  survivalInterval: TARGET_FPS * 25, // 생존 N프레임마다 발동
  countdownSeconds: 5, // 5→4→… 구간(초)
  grantsMatchTime: false, // 10 맞춤 시 시간 추가 여부
  matchTime: TARGET_FPS * 2, // 10 맞춤 시 시간 보상
  matchScore: 200, // 10 맞춤 시 점수
  sfxPitch: 1.0, // 시작 효과음 playbackRate
  bgm: {
    bpm: 128, // TIME BONUS BGM 템포
    bassPattern: [
      523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25, 659.25, 587.33,
      739.99, 880.0, 987.77, 880.0, 739.99, 587.33, 659.25,
    ],
  },
  ballColor: {
    fill: "#f472b6",
    glow: "#fbcfe8",
    shadowRgb: "251, 207, 232",
    shadowBlur: 22,
    shadowGlowMin: 0.42,
    shadowGlowAmp: 0.18,
    pulseSpeed: 0.12,
    radiusScale: 1.03,
    radiusPulseAmp: 0.025,
    highlightStops: [
      [0, "rgba(255, 255, 255, 0.52)"],
      [0.45, "rgba(255, 255, 255, 0.1)"],
      [0.82, "rgba(255, 255, 255, 0)"],
      [1, "rgba(255, 255, 255, 0)"],
    ],
    particleGlow: "#fbcfe8",
    particleFill: "#f472b6",
  },
};

/** 시작 필드·구슬 추가 */
export const FIELD = {
  grid: { cols: 5, rows: 4 }, // 시작 구슬 배치 (cols×rows)
  addBall: {
    count: 2, // +구슬 1회 개수
    staggerFrames: TARGET_FPS / 10, // +구슬 낙하 간격
  },
};

/** 위험선 초과 게임오버 */
export const STACK = {
  overLimit: TARGET_FPS * 3, // 위험선 초과 허용 시간
};

/** 셔플 */
export const SHUFFLE = {
  minFrames: TARGET_FPS, // 셔플 후 최소 잠금
  settleFrames: 15, // 정지 N프레임 후 잠금 해제
};

/** 힌트 */
export const HINT = {
  duration: TARGET_FPS * 4, // 힌트 강조 유지
  cooldown: TARGET_FPS * 3, // 힌트 재사용 대기
  idleTime: TARGET_FPS * 5, // 자동 힌트까지 대기
};

/** 효과음·음성 */
export const SFX = {
  combo: {
    file: "assets/audio/combo.mp3", // 콤보 음성
    gain: 1, // 볼륨
  },
  perfect: {
    file: "assets/audio/perfect.mp3", // 퍼펙트/FEVER 음성
    pitchStart: 1, // pitch 시작
    pitchStep: 0.05, // FEVER 단계당 pitch +
    pitchMax: null, // pitch 상한
    gain: 1, // 볼륨
  },
  hurryUp: {
    file: "assets/audio/hurry-up.mp3", // 시간 부족 음성
    pitch: 1.0, // playbackRate
    gain: 1, // 볼륨
  },
  timeBonus: {
    file: "assets/audio/bonus-time.mp3", // TIME BONUS 시작 음성
    gain: 1, // 볼륨
  },
};

/** 일반 BGM */
export const BGM = {
  bassPattern: [
    130.81, 130.81, 146.83, 130.81, 155.56, 155.56, 196.0, 164.81, 110.0, 110.0,
    123.47, 110.0, 130.81, 130.81, 164.81, 146.83,
  ], // 베이스 Hz 패턴
};

/** 일반 구슬(1~9) — fill·하이라이트 */
export const BALL_COLOR = {
  map: {
    1: "#FFB2CE",
    2: "#9B88F5",
    3: "#80C4FF",
    4: "#88E89A",
    5: "#FFD060",
    6: "#FFBA85",
    7: "#68E4D9",
    8: "#D980FF",
    9: "#FF7A8C",
  },
  highlightStops: [
    [0, "rgba(255, 255, 255, 0.38)"],
    [0.42, "rgba(255, 255, 255, 0.06)"],
    [0.78, "rgba(255, 255, 255, 0)"],
    [1, "rgba(0, 0, 0, 0.1)"],
  ],
};
