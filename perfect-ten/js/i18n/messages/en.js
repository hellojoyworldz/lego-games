/** @type {Record<string, string | Record<string, string>>} */
export default {
  meta: {
    title: "Perfect Ten",
  },
  toolbar: {
    gameActions: "Game actions",
    tutorial: "How to Play",
    tutorialTip: "Tutorial",
    history: "Play history",
    historyTip: "Play history",
    soundOn: "Sound ON!",
    soundOff: "Sound OFF!",
    soundToggle: "Sound ON/OFF",
    langKo: "Korean",
    langEn: "English",
    langToggle: "Change language",
    close: "Close",
  },
  intro: {
    descLine1: "Tap number marbles",
    descLine2: "and make 10!",
    start: "START GAME",
  },
  equation: {
    timeBonus: "TIME BONUS {{step}}",
    perfectTen: "PERFECT TEN!",
    tapGolden: "Tap golden 10! {{step}}",
  },
  combo: {
    empty: "COMBO",
    level: "{{level}}COMBO",
  },
  perfect: {
    bannerTitle: "✨ PERFECT CLEAR! ✨",
    bannerSubtitle: "Bonus +5,000 pts & +10 sec!",
    floating: "PERFECT!!! +{{score}}",
  },
  fever: {
    title: "PERFECT TEN!",
  },
  timeBonus: {
    title: "TIME BONUS",
  },
  play: {
    pause: "Pause",
    hint: "Hint",
    balls: "Balls",
    shuffle: "Shuffle",
    pauseTitle: "Pause game",
    hintTitle: "Show a combo that makes 10",
    addBallTitle: "Add marbles",
    shuffleTitle: "Shuffle marbles",
    shufflingTitle: "Shuffling…",
    shuffleUnavailable: "Shuffle marbles (unavailable)",
    addBallUnavailable: "Add marbles (unavailable)",
    pileLimit: "Pile reached the limit line!",
    over10: "OVER 10! 💥",
  },
  hint: {
    none: "No combo to 10 right now",
    preview: "💡 {{expr}} = 10",
  },
  pause: {
    desc: "Game paused",
    resume: "Resume ▶",
    quit: "Quit Game",
  },
  result: {
    newRecord: "NEW RECORD!",
    thisRun: "This Run",
    best: "BEST",
    bestScore: "Best Score",
    bestCombo: "Best Combo",
    bestTime: "Best Time",
    finalScore: "Final Score",
    maxCombo: "Max Combo",
    survivalTime: "Survival Time",
    retry: "Try Again 🔄",
  },
  gameover: {
    timeOut: "Time ran out.",
    stackOver: "Marbles collapsed past the limit line!",
    quit: "You quit the game.",
  },
  history: {
    title: "Play History",
    reset: "Reset records",
    totalPlays: "{{count}} games played",
    empty: "No games yet.\nPlay a round and your stats will show up here!",
    bestRecords: "Best Records",
    playNumber: "Game {{n}}",
    colScore: "Score",
    colTime: "Time",
    colCombo: "Combo",
    colClear: "Clears",
    newBestScore: "Best score",
    newBestCombo: "Best combo",
    newBestTime: "Best time",
    close: "Close",
  },
  reset: {
    title: "Reset Records",
    message: "Reset play history?",
    cancel: "Cancel",
    confirm: "Reset",
  },
  tutorial: {
    title: "How to Play",
    ok: "OK",
    basicRules: {
      title: "Basic Rules",
      item1: "Tap marbles to select or deselect them.",
      item2:
        "If the selected numbers <strong>add up to exactly 10</strong>, they pop!",
      item3: "Go over 10 and you fail — <strong>your combo breaks</strong>.",
    },
    score: {
      title: "Base Score",
      item1:
        "Each success restores <strong>score</strong> and <strong>time</strong> by marble count:",
      item2:
        "<strong>2</strong> → {{s2}} pts &amp; +{{t2}}s · <strong>3</strong> → {{s3}} pts &amp; +{{t3}}s · <strong>4</strong> → {{s4}} pts &amp; +{{t4}}s · <strong>5+</strong> → {{s5}} pts &amp; +{{t5}}s",
      item3:
        "Clear every marble for a <strong>Perfect Clear</strong> bonus (+{{score}} pts &amp; +{{sec}} sec)!",
    },
    combo: {
      title: "Combo",
      item1:
        "Combo popup starts on your <strong>{{startLabel}}</strong> consecutive 10 (<strong>1COMBO</strong>).",
      item2:
        "Make another 10 within <strong>{{sec}} sec</strong> of each success — wait too long and combo <strong>resets</strong>.",
      item3:
        "While combo is active, score = <strong>base score × consecutive success count</strong>.",
      item4:
        "Example: {{marbles}} marbles ({{base}} pts base) on your <strong>{{streakLabel}}</strong> → <strong>{{total}} pts</strong>.",
    },
    fever: {
      title: "PERFECT TEN FEVER",
      item1:
        "Every <strong>{{interval}} COMBO</strong>, <strong>PERFECT TEN!</strong> begins.",
      item2:
        "For <strong>{{sec}} seconds</strong>, the timer pauses and all marbles become <strong>10</strong>s.",
      item3: "Clear each <strong>10</strong> one at a time.",
      item4:
        "Each success — <strong>1st FEVER {{golden}} pts</strong>, <strong>2nd {{tier2}} pts</strong>, <strong>3rd {{tier3}} pts</strong>… <strong>+{{golden}} pts</strong> each time FEVER returns.",
    },
    timeBonus: {
      title: "TIME BONUS",
      item1:
        "Every <strong>{{sec}} seconds</strong> of survival, <strong>TIME BONUS</strong> triggers.",
      item2:
        "For <strong>{{countdown}} seconds</strong>, the timer pauses and all marbles become <strong>5</strong>s.",
      item3: "Each success — <strong>fixed {{score}} pts</strong>.",
      item4: "When TIME BONUS ends, marbles return to normal.",
    },
    gameOver: {
      title: "Game Over",
      item1: "The game ends when time hits <strong>0</strong>.",
      item2:
        "If marbles stay above the <strong>danger line</strong> for <strong>{{sec}} seconds</strong>, you lose.",
    },
    controls: {
      title: "Controls",
      hint: "<span>💡 Hint</span> See a combo that makes 10",
      balls: "<span>＋ Balls</span> Drop {{count}} marbles from above",
      shuffle: "<span>🔄 Shuffle</span> Mix remaining marble positions",
      pause: "<span>⏸ Pause</span> Pause or quit the game",
    },
  },
};
