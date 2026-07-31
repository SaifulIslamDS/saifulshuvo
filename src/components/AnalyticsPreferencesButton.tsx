"use client";

const CONSENT_KEY = "portfolio-analytics-consent";

export function AnalyticsPreferencesButton() {
  function resetPreferences() {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // Storage can be unavailable in hardened browser modes.
    }
    window.dispatchEvent(new Event("portfolio:analytics-reset"));
  }

  return (
    <button type="button" className="footer-privacy-button" onClick={resetPreferences}>
      Analytics choices
    </button>
  );
}
