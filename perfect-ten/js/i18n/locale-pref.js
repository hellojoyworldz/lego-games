export const LOCALE_PREF_KEY = "perfect-ten-locale";

/** @returns {'ko'|'en'|null} */
export function readLocalePref() {
  try {
    const pref = localStorage.getItem(LOCALE_PREF_KEY);
    if (pref === "ko" || pref === "en") return pref;
  } catch (_e) {}
  return null;
}

/** @param {'ko'|'en'} locale */
export function saveLocalePref(locale) {
  try {
    localStorage.setItem(LOCALE_PREF_KEY, locale);
  } catch (_e) {}
}

/** @returns {'ko'|'en'} */
export function detectBrowserLocale() {
  const lang = (
    navigator.language ||
    /** @type {{ userLanguage?: string }} */ (navigator).userLanguage ||
    "en"
  ).toLowerCase();
  return lang.startsWith("ko") ? "ko" : "en";
}
