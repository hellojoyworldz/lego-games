export const TARGET_FPS = 60; // 기준 FPS

export const BALL_RADIUS = 26; // 구슬 반지름
export const GRAVITY = 0.23; // 중력
export const FRICTION = 0.96; // 마찰
export const RESTITUTION = 0.38; // 반발(튕김)
export const DEADLINE_Y = 120; // 위험선 Y

export const INITIAL_TIME = TARGET_FPS * 15; // 시작 제한시간
export const MAX_TIME = TARGET_FPS * 30; // 제한시간 상한

export const POP_REWARDS = {
  2: { time: TARGET_FPS * 2, score: 100 }, // 2개로 10
  3: { time: TARGET_FPS * 2, score: 300 }, // 3개로 10
  4: { time: TARGET_FPS * 4, score: 850 }, // 4개로 10
  5: { time: (TARGET_FPS * 15) / 2, score: 1800 }, // 5개+로 10
};

export const PERFECT_CLEAR_SCORE = 5000; // 올클리어 점수
export const PERFECT_CLEAR_TIME = TARGET_FPS * 10; // 올클리어 시간 보너스
export const COMBO_RESET = TARGET_FPS * 3; // 콤보 끊김 간격

export const COMBO_START_AFTER = 2; // 연속 N회 10 성공 후 콤보 시작 (3이면 4번째부터 1콤보)
export const COMBO_DISPLAY_SUFFIX = "COMBO"; // 콤보 UI 접미사
export const COMBO_VOICE_FILE = "assets/audio/combo.mp3"; // 콤보 음성 mp3
export const COMBO_PITCH_START = 1.2; // 콤보 음성 pitch 시작값
export const COMBO_PITCH_STEP = 0.03; // 콤보당 pitch 증가
export const COMBO_PITCH_MAX = null; // pitch 상한 (null=무제한)
export const COMBO_VOICE_GAIN = 0.9; // 콤보 음성 볼륨

export const PERFECT_VOICE_FILE = "assets/audio/perfect.mp3"; // 퍼펙트 음성 mp3
export const PERFECT_PITCH_START = 1; // 퍼펙트 음성 pitch 시작값
export const PERFECT_PITCH_STEP = 0.05; // FEVER 단계당 pitch 증가
export const PERFECT_PITCH_MAX = null; // pitch 상한 (null=무제한)
export const PERFECT_VOICE_GAIN = 0.9; // 퍼펙트 음성 볼륨

export const FEVER_COMBO_INTERVAL = 7; // N콤보마다 PERFECT TEN FEVER + 콤보 pitch 사이클
export const FEVER_ANNOUNCE_TIME = 0; // PERFECT TEN 직후 바로 연타 구간 시작 (프레임)
export const FEVER_COUNTDOWN_SECONDS = 5; // 5,4,3,2,1 — 연타 가능 구간(초)
export const FEVER_GOLDEN_SCORE = 150; // 황금 10 1개당 기본 점수
export const FEVER_SPAWN_INTERVAL = TARGET_FPS / 3; // 황금 10 낙하 간격(프레임)
export const FEVER_METEOR_SPAWN_INTERVAL = 2; // 유성우 스폰 간격(프레임)
export const FEVER_BGM_BPM = 196; // FEVER BGM 템포
export const FEVER_BGM_BPM_STEP = 10; // FEVER 단계마다 BPM 추가

/** FEVER 황금 10 구슬 — fill·shadow·하이라이트·숫자 스타일 일괄 관리 */
export const GOLDEN_TEN_BALL = {
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
};

export const BONUS_SURVIVAL_INTERVAL = TARGET_FPS * 25; // 생존 N프레임마다 TIME BONUS (30초)
export const BONUS_COUNTDOWN_SECONDS = 5; // 5,4,3,2,1 — 구슬 5 변환 구간(초)
export const BONUS_VOICE_FILE = "assets/audio/bonus-time.mp3"; // TIME BONUS 시작 효과음 mp3 (BGM 아님)
export const BONUS_PITCH = 1.0; // TIME BONUS 효과음 playbackRate (1=원속, 높을수록 빠름)
export const BONUS_VOICE_GAIN = 0.9; // TIME BONUS 효과음 볼륨
export const BONUS_BGM_BPM = 128; // TIME BONUS BGM 템포

/** TIME BONUS 5 구슬 — fill·shadow·하이라이트 일괄 관리 */
export const TIME_BONUS_BALL = {
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
};

export const PENALTY_DURATION = TARGET_FPS / 3; // 10 초과 패널티
export const STACK_OVER_LIMIT = TARGET_FPS * 3; // 위험선 초과 시 게임오버
export const STACK_SETTLED_VELOCITY = 2.5; // 쌓인 구슬 판정 속도

export const DANGER_TIME_THRESHOLD = TARGET_FPS * 3; // 시간 부족 연출 시작
export const HURRY_UP_VOICE_FILE = "assets/audio/hurry-up.mp3"; // 시간 부족 음성 mp3
export const HURRY_UP_PITCH = 1.0; // 허리업 음성 playbackRate (1=원속, 높을수록 빠름)
export const HURRY_UP_VOICE_GAIN = 0.9; // 허리업 음성 볼륨
export const HURRY_UP_PLAY_EVERY = 3; // 위험 구간 진입 N번마다 1회 재생 (3=1·4·7…번째만)
export const BGM_URGENT_TIME = TARGET_FPS * 5; // BGM 긴급 모드
export const BGM_PANIC_TIME = TARGET_FPS * 3; // BGM 패닉 모드
export const TIME_DECAY_SCALE = 0.008; // 시간 감소 가속

export const ADD_BALL_COUNT = 2; // +구슬 1회 개수
export const INITIAL_FIELD_BALLS = 20; // initField 시작 구슬 수
export const MATCH_SPAWN_COUNT = 2; // 10 맞춤 시 낙하 구슬 수
export const ADD_BALL_STAGGER = TARGET_FPS / 10; // +구슬 낙하 간격(프레임)

export const SHUFFLE_MIN_FRAMES = TARGET_FPS; // 셔플 후 최소 잠금(프레임)
export const SHUFFLE_SETTLE_FRAMES = 15; // 연속 N프레임 정지 후 잠금 해제

export const HINT_DURATION = TARGET_FPS * 4; // 힌트 강조 유지(프레임)
export const HINT_COOLDOWN = TARGET_FPS * 3; // 힌트 재사용 대기(프레임)
export const HINT_IDLE_TIME = TARGET_FPS * 5; // 자동 힌트까지 대기(프레임)

/** 일반 구슬(1~9) — fill 색·캔디 하이라이트 radial */
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

export const BASS_PATTERN = [
  // BGM 베이스 Hz
  130.81, 130.81, 146.83, 130.81, 155.56, 155.56, 196.0, 164.81, 110.0, 110.0,
  123.47, 110.0, 130.81, 130.81, 164.81, 146.83,
];

export const FEVER_BASS_PATTERN = [
  // FEVER BGM — 밝은 메이저 아르페지오
  261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63, 293.66, 369.99,
  440.0, 587.33, 739.99, 587.33, 440.0, 369.99,
];

export const BONUS_BASS_PATTERN = [
  // TIME BONUS BGM — 귀여운 펜타토닉/뮤직박스
  523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25, 659.25,
  587.33, 739.99, 880.0, 987.77, 880.0, 739.99, 587.33, 659.25,
];
