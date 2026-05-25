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
export const COMBO_PITCH_START = 1.2; // 콤보 SFX pitch 시작값
export const COMBO_PITCH_STEP = 0.03; // 콤보당 pitch 증가
export const COMBO_PITCH_MAX = null; // pitch 상한 (null=무제한)

export const PENALTY_DURATION = TARGET_FPS / 3; // 10 초과 패널티
export const STACK_OVER_LIMIT = TARGET_FPS * 3; // 위험선 초과 시 게임오버
export const STACK_SETTLED_VELOCITY = 2.5; // 쌓인 구슬 판정 속도

export const DANGER_TIME_THRESHOLD = TARGET_FPS * 3; // 시간 부족 연출 시작
export const BGM_URGENT_TIME = TARGET_FPS * 5; // BGM 긴급 모드
export const BGM_PANIC_TIME = TARGET_FPS * 3; // BGM 패닉 모드
export const TIME_DECAY_SCALE = 0.008; // 시간 감소 가속

export const ADD_BALL_COUNT = 2; // +구슬 1회 개수
export const INITIAL_FIELD_BALLS = 20; // initField 시작 구슬 수
export const MATCH_SPAWN_COUNT = 2; // 10 맞춤 시 낙하 구슬 수
export const ADD_BALL_STAGGER = TARGET_FPS / 10; // +구슬 낙하 간격(프레임)
export const ADD_BALL_BLOCK_MARGIN = BALL_RADIUS * 2 * ADD_BALL_COUNT; // 위험선 직전 차단 여유(px)

export const HINT_DURATION = TARGET_FPS * 4; // 힌트 강조 유지(프레임)
export const HINT_COOLDOWN = TARGET_FPS * 3; // 힌트 재사용 대기(프레임)
export const HINT_IDLE_TIME = TARGET_FPS * 5; // 자동 힌트까지 대기(프레임)

export const COLOR_MAP = {
  // 숫자별 구슬 색
  1: "#FF453A",
  2: "#BF5AF2",
  3: "#0A84FF",
  4: "#30D158",
  5: "#FFD60A",
  6: "#FF9F0A",
  7: "#5AC8FA",
  8: "#FF2D92",
  9: "#5856D6",
};

export const BASS_PATTERN = [
  // BGM 베이스 Hz
  130.81, 130.81, 146.83, 130.81, 155.56, 155.56, 196.0, 164.81, 110.0, 110.0,
  123.47, 110.0, 130.81, 130.81, 164.81, 146.83,
];
