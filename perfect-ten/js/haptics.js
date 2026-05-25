import { isIOSDevice } from "./audio/silent-unlock.js";

/** @typedef {'tap'|'pop'|'combo'|'fail'|'perfect'|'gameover'} HapticType */

const PATTERNS = {
  tap: 12,
  pop: [35, 25, 40],
  combo: [60, 40, 60, 40, 100],
  fail: [80, 40, 80],
  perfect: [100, 30, 100, 30, 200],
  gameover: [200, 50, 300],
};

/** @type {HTMLLabelElement|null} */
let iosSwitchLabel = null;

function initIOSSwitch() {
  if (iosSwitchLabel || !isIOSDevice()) return;

  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;overflow:hidden;";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);

  document.head.appendChild(label);
  iosSwitchLabel = label;
}

/**
 * iOS Safari 17.4+ — switch 토글 Taptic Engine
 * @see https://github.com/tijnjh/ios-haptics
 */
function iosSwitchPulse() {
  if (!isIOSDevice()) return;

  try {
    initIOSSwitch();
    if (!iosSwitchLabel) return;

    const input = iosSwitchLabel.querySelector("input");
    if (!(input instanceof HTMLInputElement)) return;

    input.checked = !input.checked;
    input.click();
  } catch (_e) {}
}

/** Android — iOS는 vibrate API 쓰지 않음 (18+ 일부 기기에서 noop) */
function vibrateAndroid(pattern) {
  if (isIOSDevice() || !("vibrate" in navigator)) return false;

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (_e) {
    return false;
  }
}

function iosPulseCount(type) {
  switch (type) {
    case "tap":
      return 1;
    case "pop":
    case "fail":
    case "gameover":
      return 2;
    case "combo":
    case "perfect":
      return 3;
    default:
      return 1;
  }
}

function iosPattern(type) {
  const count = iosPulseCount(type);
  iosSwitchPulse();
  if (count >= 2) {
    setTimeout(() => iosSwitchPulse(), 120);
  }
  if (count >= 3) {
    setTimeout(() => iosSwitchPulse(), 240);
  }
}

/** @param {HapticType} type */
export function triggerHaptic(type) {
  const pattern = PATTERNS[type];

  if (vibrateAndroid(pattern)) return;

  if (isIOSDevice()) {
    iosPattern(type);
  }
}

export function isHapticSupported() {
  return !isIOSDevice() && "vibrate" in navigator
    ? true
    : isIOSDevice();
}

if (typeof document !== "undefined") {
  document.addEventListener(
    "touchstart",
    () => {
      initIOSSwitch();
    },
    { capture: true, passive: true },
  );
}
