import en from "./messages/en.js";
import ko from "./messages/ko.js";
import {
  detectBrowserLocale,
  readLocalePref,
  saveLocalePref,
} from "./locale-pref.js";

/** @typedef {'ko'|'en'} Locale */

const catalogs = { en, ko };

/** @type {Locale} */
let locale = resolveInitialLocale();

/** @type {Set<() => void>} */
const listeners = new Set();

/** @returns {Locale} */
function resolveInitialLocale() {
  const saved = readLocalePref();
  if (saved) return saved;
  return detectBrowserLocale();
}

/**
 * @param {string} key dot notation
 * @param {Record<string, string | number>} [params]
 */
export function t(key, params = {}) {
  /** @type {unknown} */
  let value = catalogs[locale];
  for (const part of key.split(".")) {
    if (value && typeof value === "object" && part in value) {
      value = /** @type {Record<string, unknown>} */ (value)[part];
    } else {
      value = undefined;
      break;
    }
  }

  if (typeof value !== "string") {
    /** @type {unknown} */
    let fallback = catalogs.en;
    for (const part of key.split(".")) {
      if (fallback && typeof fallback === "object" && part in fallback) {
        fallback = /** @type {Record<string, unknown>} */ (fallback)[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    value = typeof fallback === "string" ? fallback : key;
  }

  let text = /** @type {string} */ (value);
  for (const [name, val] of Object.entries(params)) {
    text = text.replaceAll(`{{${name}}}`, String(val));
  }
  return text;
}

/**
 * 공통 prefix를 붙인 번역 함수 (예: createScopedT("tutorial") → tt("combo.title"))
 * @param {string} prefix
 */
export function createScopedT(prefix) {
  /** @param {string} key @param {Record<string, string | number>} [params] */
  return (key, params = {}) => t(`${prefix}.${key}`, params);
}

/** @returns {Locale} */
export function getLocale() {
  return locale;
}

/** @param {Locale} next */
export function setLocale(next) {
  if (next === locale) return;
  locale = next;
  saveLocalePref(next);
  document.documentElement.lang = next;
  document.title = t("meta.title");
  applyDocumentI18n();
  for (const fn of listeners) fn();
}

export function toggleLocale() {
  setLocale(locale === "ko" ? "en" : "ko");
}

/** @param {() => void} fn */
export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyDocumentI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.setAttribute("title", t(key));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });
}

function syncLocaleButton() {
  const btn = document.getElementById("btn-locale");
  if (!btn) return;

  btn.textContent = locale === "ko" ? "🇰🇷" : "🇺🇸";
}

export function bindLocaleButton(buttonId = "btn-locale") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  syncLocaleButton();
  btn.addEventListener("click", () => toggleLocale());
  onLocaleChange(syncLocaleButton);
}

export function initI18n() {
  document.documentElement.lang = locale;
  document.title = t("meta.title");
  applyDocumentI18n();
  bindLocaleButton();
}

export function syncMuteTooltip(isMuted) {
  const tooltip = document.getElementById("tooltip-mute");
  if (!tooltip) return;
  tooltip.textContent = isMuted ? "Sound OFF!" : "Sound ON!";
}
