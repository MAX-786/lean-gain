/* ============================================================
   Lean Gain — localStorage persistence helpers
   Everything lives under the "leangain:" prefix so it's easy
   to namespace/clear without touching other sites' storage.
   ============================================================ */

const STORE_KEYS = {
  darkMode: "leangain:darkMode",
  activeTab: "leangain:activeTab",
  weightLog: "leangain:weightLog",
  waterLog: "leangain:waterLog",
  habitLog: "leangain:habitLog",
  groceryChecks: "leangain:groceryChecks",
  planDayChecks: "leangain:planDayChecks"
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* localStorage unavailable (e.g. private mode) — fail silently */
  }
}

const Store = {
  getDarkMode() {
    return readJSON(STORE_KEYS.darkMode, false);
  },
  setDarkMode(on) {
    writeJSON(STORE_KEYS.darkMode, !!on);
  },

  getActiveTab() {
    return readJSON(STORE_KEYS.activeTab, "dashboard");
  },
  setActiveTab(tab) {
    writeJSON(STORE_KEYS.activeTab, tab);
  },

  // Weight log: array of { date: "YYYY-MM-DD", kg: number }
  getWeightLog() {
    return readJSON(STORE_KEYS.weightLog, []);
  },
  addWeightEntry(date, kg) {
    const log = Store.getWeightLog().filter(e => e.date !== date);
    log.push({ date, kg });
    log.sort((a, b) => a.date.localeCompare(b.date));
    writeJSON(STORE_KEYS.weightLog, log);
    return log;
  },
  deleteWeightEntry(date) {
    const log = Store.getWeightLog().filter(e => e.date !== date);
    writeJSON(STORE_KEYS.weightLog, log);
    return log;
  },

  // Water log: { "YYYY-MM-DD": glassesCount }
  getWaterLog() {
    return readJSON(STORE_KEYS.waterLog, {});
  },
  setWaterCount(date, count) {
    const log = Store.getWaterLog();
    log[date] = Math.max(0, count);
    writeJSON(STORE_KEYS.waterLog, log);
    return log;
  },

  // Habit log: { "YYYY-MM-DD": { habitKey: true/false, ... } }
  getHabitLog() {
    return readJSON(STORE_KEYS.habitLog, {});
  },
  toggleHabit(date, habitKey) {
    const log = Store.getHabitLog();
    if (!log[date]) log[date] = {};
    log[date][habitKey] = !log[date][habitKey];
    writeJSON(STORE_KEYS.habitLog, log);
    return log;
  },

  // Grocery checks: { "week-category-item": true/false }
  getGroceryChecks() {
    return readJSON(STORE_KEYS.groceryChecks, {});
  },
  toggleGroceryCheck(id) {
    const checks = Store.getGroceryChecks();
    checks[id] = !checks[id];
    writeJSON(STORE_KEYS.groceryChecks, checks);
    return checks;
  },

  // Meal-plan day expand/complete state: { dayNum: true/false }
  getPlanDayChecks() {
    return readJSON(STORE_KEYS.planDayChecks, {});
  },
  togglePlanDay(dayNum) {
    const checks = Store.getPlanDayChecks();
    checks[dayNum] = !checks[dayNum];
    writeJSON(STORE_KEYS.planDayChecks, checks);
    return checks;
  }
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
