/** @type {Record<string, string | Record<string, string>>} */
export default {
  meta: {
    title: "퍼펙트 텐",
  },
  toolbar: {
    gameActions: "게임 메뉴",
    tutorial: "게임 방법",
    tutorialTip: "튜토리얼",
    history: "플레이 기록",
    historyTip: "플레이 기록",
    soundOn: "소리 켜짐!",
    soundOff: "소리 꺼짐!",
    soundToggle: "소리 ON/OFF",
    langKo: "한국어",
    langEn: "English",
    langToggle: "언어 변경",
    close: "닫기",
  },
  intro: {
    descLine1: "숫자 구슬을 탭해서",
    descLine2: "합이 10이 되게!",
    start: "게임 시작",
  },
  equation: {
    timeBonus: "TIME BONUS {{step}}",
    perfectTen: "PERFECT TEN!",
    tapGolden: "황금 10 탭! {{step}}",
  },
  combo: {
    empty: "콤보",
    level: "{{level}} 콤보",
  },
  perfect: {
    bannerTitle: "✨ PERFECT CLEAR! ✨",
    bannerSubtitle: "보너스 +5,000점 & +10초!",
    floating: "PERFECT!!! +{{score}}",
  },
  fever: {
    title: "PERFECT TEN!",
  },
  timeBonus: {
    title: "TIME BONUS",
  },
  play: {
    pause: "중지",
    hint: "힌트",
    balls: "구슬",
    shuffle: "셔플",
    pauseTitle: "게임 일시정지",
    hintTitle: "10을 만드는 조합 보기",
    addBallTitle: "구슬 추가",
    shuffleTitle: "구슬 위치 섞기",
    shufflingTitle: "셔플 중…",
    shuffleUnavailable: "셔플 (사용 불가)",
    addBallUnavailable: "구슬 추가 (사용 불가)",
    pileLimit: "위험선까지 쌓였습니다!",
    over10: "10 초과! 💥",
  },
  hint: {
    none: "지금은 10 조합이 없어요",
    preview: "💡 {{expr}} = 10",
  },
  pause: {
    desc: "게임이 멈췄습니다",
    resume: "계속하기 ▶",
    quit: "게임 종료",
  },
  result: {
    newRecord: "신기록!",
    thisRun: "이번 판",
    best: "BEST",
    bestScore: "최고 점수",
    bestCombo: "최고 콤보",
    bestTime: "최고 시간",
    finalScore: "최종 점수",
    maxCombo: "최대 콤보",
    survivalTime: "생존 시간",
    retry: "다시 도전 🔄",
  },
  gameover: {
    timeOut: "시간이 다 됐습니다.",
    stackOver: "위험선을 넘어 구슬이 쌓였습니다!",
    quit: "게임을 종료했습니다.",
  },
  history: {
    title: "플레이 기록",
    reset: "기록 초기화",
    totalPlays: "총 {{count}}회 플레이",
    empty: "아직 플레이 기록이 없어요.\n한 판 플레이하면 여기에 쌓여요!",
    bestRecords: "최고 기록",
    playNumber: "{{n}}회",
    colScore: "점수",
    colTime: "시간",
    colCombo: "콤보",
    colClear: "클리어",
    newBestScore: "점수 신기록",
    newBestCombo: "콤보 신기록",
    newBestTime: "시간 신기록",
    close: "닫기",
  },
  reset: {
    title: "기록 초기화",
    message: "플레이 기록을 초기화할까요?",
    cancel: "취소",
    confirm: "초기화",
  },
  tutorial: {
    title: "게임 방법",
    ok: "확인",
    basicRules: {
      title: "기본 규칙",
      item1: "구슬을 탭해 선택하거나 해제하세요.",
      item2: "선택한 숫자의 <strong>합이 정확히 10</strong>이면 터집니다!",
      item3: "10을 넘기면 실패 — <strong>콤보가 끊깁니다</strong>.",
    },
    score: {
      title: "기본 점수",
      item1:
        "성공 시 구슬 개수에 따라 <strong>점수</strong>와 <strong>시간</strong>이 회복됩니다:",
      item2:
        "<strong>2개</strong> → {{s2}}점 &amp; +{{t2}}초 · <strong>3개</strong> → {{s3}}점 &amp; +{{t3}}초 · <strong>4개</strong> → {{s4}}점 &amp; +{{t4}}초 · <strong>5개+</strong> → {{s5}}점 &amp; +{{t5}}초",
      item3:
        "구슬을 전부 없애면 <strong>퍼펙트 클리어</strong> 보너스 (+{{score}}점 &amp; +{{sec}}초)!",
    },
    combo: {
      title: "콤보",
      item1:
        "<strong>{{startLabel}}</strong> 연속 10부터 콤보 팝업 (<strong>1 COMBO</strong>).",
      item2:
        "성공 후 <strong>{{sec}}초</strong> 안에 다시 10을 만들어야 콤보가 <strong>유지</strong>됩니다.",
      item3: "콤보 중 점수 = <strong>기본 점수 × 연속 성공 횟수</strong>.",
      item4:
        "예: {{marbles}}개 (기본 {{base}}점) · <strong>{{streakLabel}}</strong> → <strong>{{total}}점</strong>.",
    },
    fever: {
      title: "PERFECT TEN FEVER",
      item1:
        "<strong>{{interval}} COMBO</strong>마다 <strong>PERFECT TEN!</strong> 시작.",
      item2:
        "<strong>{{sec}}초</strong> 동안 타이머가 멈추고 구슬이 <strong>10</strong>으로 바뀝니다.",
      item3: "<strong>10</strong>을 <strong>하나씩</strong> 없애세요.",
      item4:
        "성공마다 <strong>1번째 FEVER {{golden}}점</strong>, <strong>2번째 {{tier2}}점</strong>, <strong>3번째 {{tier3}}점</strong>… FEVER가 다시 올 때마다 <strong>+{{golden}}점</strong>.",
    },
    timeBonus: {
      title: "TIME BONUS",
      item1:
        "<strong>{{sec}}초</strong> 생존할 때마다 <strong>TIME BONUS</strong> 발동.",
      item2:
        "<strong>{{countdown}}초</strong> 동안 타이머가 멈추고 모든 구슬이 <strong>5</strong>가 됩니다.",
      item3: "성공마다 <strong>고정 {{score}}점</strong>.",
      item4: "TIME BONUS가 끝나면 구슬이 원래대로 돌아옵니다.",
    },
    gameOver: {
      title: "게임 오버",
      item1: "시간이 <strong>0</strong>이 되면 게임이 끝납니다.",
      item2:
        "구슬이 <strong>위험선</strong> 위에 <strong>{{sec}}초</strong> 이상 머물면 패배합니다.",
    },
    controls: {
      title: "조작",
      hint: "<span>💡 힌트</span> 10을 만드는 조합 보기",
      balls: "<span>＋ 구슬</span> 위에서 {{count}}개 낙하",
      shuffle: "<span>🔄 셔플</span> 남은 구슬 위치 섞기",
      pause: "<span>⏸ 중지</span> 일시정지 또는 종료",
    },
  },
};
