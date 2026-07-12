/* ============================================================
   Lean Gain — app shell: routing + rendering + event wiring
   ============================================================ */

const view = document.getElementById("view");
let openRecipe = null;
let recipeFilter = { category: "All", query: "" };
let openDay = null;
let groceryWeek = 1;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function findTemplate(id) {
  return MEAL_TEMPLATES.find(t => t.id === id);
}

/* ---------- Router ---------- */

const RENDERERS = {
  dashboard: renderDashboard,
  mealplan: renderMealPlan,
  recipes: renderRecipes,
  grocery: renderGrocery,
  trackers: renderTrackers
};

function setActiveTab(tab) {
  Store.setActiveTab(tab);
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  view.innerHTML = "";
  RENDERERS[tab]();
}

/* ---------- Dashboard ---------- */

function renderDashboard() {
  const today = todayISO();
  const habitLog = Store.getHabitLog()[today] || {};
  const weightLog = Store.getWeightLog();
  const latestWeight = weightLog.length ? weightLog[weightLog.length - 1].kg : PROFILE.startWeightKg;
  const gained = (latestWeight - PROFILE.startWeightKg).toFixed(1);

  // Use day-of-month cycling through the 12 templates for "today's" example meals.
  const dayIndex = new Date().getDate() % MEAL_TEMPLATES.length;
  const template = MEAL_TEMPLATES[dayIndex];

  view.innerHTML = `
    <div class="section-title">Your Profile</div>
    <div class="grid grid-4">
      <div class="card">
        <h3>Current Weight</h3>
        <div class="stat-value">${latestWeight} kg</div>
        <div class="stat-label">Gained ${gained >= 0 ? "+" : ""}${gained} kg since start</div>
      </div>
      <div class="card">
        <h3>Target</h3>
        <div class="stat-value">${PROFILE.targetWeightRange}</div>
        <div class="stat-label">${PROFILE.timelineWeeks} · ${PROFILE.weeklyGainTarget}</div>
      </div>
      <div class="card">
        <h3>Height / BP</h3>
        <div class="stat-value">${PROFILE.heightLabel.split(" ")[0]}</div>
        <div class="stat-label">${PROFILE.bp}</div>
      </div>
      <div class="card">
        <h3>Daily Calories</h3>
        <div class="stat-value">${PROFILE.calories.split("/")[0]}</div>
        <div class="stat-label">${PROFILE.protein} protein</div>
      </div>
    </div>

    <div class="info-box" style="margin-top:16px;">
      <strong>About the small appetite / fast metabolism:</strong> ${PROFILE.metabolismNote}
    </div>

    <div class="grid grid-2" style="margin-top:24px; align-items:start;">
      <div>
        <div class="section-title">Today's Meal Timeline <span class="pill pill-accent">${template.totalKcal} kcal · ${template.totalProtein}g protein</span></div>
        <div class="timeline">
          ${template.meals.map(m => `
            <div class="timeline-item">
              <div class="timeline-time">${m.time}</div>
              <div class="timeline-body">
                <div class="timeline-label">${m.label}</div>
                <div class="timeline-items">${escapeHtml(m.items)}</div>
                <div class="timeline-macros">${m.kcal} kcal · ${m.protein}g protein</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div>
        <div class="section-title">Today's Habits</div>
        <div class="card">
          <div class="habit-list" id="habitList">
            ${HABIT_ITEMS.map(h => `
              <label class="habit-row ${habitLog[h.key] ? "done" : ""}" data-habit="${h.key}">
                <input type="checkbox" ${habitLog[h.key] ? "checked" : ""} data-habit-checkbox="${h.key}">
                <span>${h.label}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="section-title">Daily Targets</div>
        <div class="card">
          <p><strong>Calories:</strong> ${PROFILE.calories}</p>
          <p><strong>Protein:</strong> ${PROFILE.protein}</p>
          <p><strong>Fat:</strong> ${PROFILE.fat}</p>
          <p><strong>Carbs:</strong> ${PROFILE.carbs}</p>
          <p><strong>Water:</strong> ${PROFILE.water}</p>
          <p style="margin-bottom:0;"><strong>Frequency:</strong> ${PROFILE.mealFrequency}</p>
        </div>
      </div>
    </div>
  `;

  view.querySelectorAll("[data-habit-checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      Store.toggleHabit(today, cb.dataset.habitCheckbox);
      renderDashboard();
    });
  });
}

/* ---------- Meal Plan ---------- */

function renderMealPlan() {
  const dayChecks = Store.getPlanDayChecks();

  const weeks = [[], [], [], []];
  MEAL_PLAN_30_DAYS.forEach(d => {
    const weekIdx = Math.min(3, Math.floor((d.day - 1) / 7));
    weeks[weekIdx].push(d);
  });

  view.innerHTML = `
    <div class="section-title">30-Day Meal Plan</div>
    <p style="color:var(--text-muted); margin-bottom:18px;">
      Built from ${MEAL_TEMPLATES.length} rotating small-appetite templates (6–7 meals/day, every 2.5–3 hrs)
      so no two consecutive days repeat, without needing 30 completely separate menus.
      Tap a day to see the full meal-by-meal breakdown.
    </p>
    ${weeks.map((week, wi) => `
      <div class="week-header">Week ${wi + 1}</div>
      <div class="day-grid">
        ${week.map(d => {
          const t = findTemplate(d.templateId);
          const isOpen = openDay === d.day;
          const done = dayChecks[d.day];
          return `
            <div class="day-row ${isOpen ? "open" : ""}" data-day="${d.day}">
              <div class="day-row-head" data-day-toggle="${d.day}">
                <span class="day-chevron">▶</span>
                <span class="day-num">Day ${d.day}</span>
                <span class="day-macros">${t.totalKcal} kcal · ${t.totalProtein}g protein · 7 small meals</span>
                <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted);">
                  <input type="checkbox" data-day-check="${d.day}" ${done ? "checked" : ""}> done
                </label>
              </div>
              <div class="day-row-body">
                <div class="timeline">
                  ${t.meals.map(m => `
                    <div class="timeline-item">
                      <div class="timeline-time">${m.time}</div>
                      <div class="timeline-body">
                        <div class="timeline-label">${m.label}</div>
                        <div class="timeline-items">${escapeHtml(m.items)}</div>
                        <div class="timeline-macros">${m.kcal} kcal · ${m.protein}g protein</div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `).join("")}
  `;

  view.querySelectorAll("[data-day-toggle]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("label")) return;
      const day = Number(el.dataset.dayToggle);
      openDay = openDay === day ? null : day;
      renderMealPlan();
    });
  });

  view.querySelectorAll("[data-day-check]").forEach(cb => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", () => {
      Store.togglePlanDay(Number(cb.dataset.dayCheck));
    });
  });
}

/* ---------- Recipes ---------- */

function renderRecipes() {
  const filtered = RECIPES.filter(r => {
    const matchesCat = recipeFilter.category === "All" || r.category === recipeFilter.category;
    const matchesQuery = !recipeFilter.query || r.name.toLowerCase().includes(recipeFilter.query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  view.innerHTML = `
    <div class="section-title">Recipes <span class="pill">${filtered.length} of ${RECIPES.length}</span></div>
    <div class="recipe-toolbar">
      <input type="text" class="search-input" id="recipeSearch" placeholder="Search recipes..." value="${escapeHtml(recipeFilter.query)}">
      <select class="filter-select" id="recipeCategory">
        ${RECIPE_CATEGORIES.map(c => `<option value="${c}" ${c === recipeFilter.category ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>
    <div class="grid grid-3" id="recipeGrid">
      ${filtered.map(r => `
        <div class="card recipe-card" data-recipe="${r.id}">
          <span class="pill pill-accent">${r.category}</span>
          <h4>${escapeHtml(r.name)}</h4>
          <div class="recipe-meta">
            <span>${r.kcal} kcal</span>
            <span>${r.protein}g protein</span>
            <span>${r.prepMin} min</span>
          </div>
        </div>
      `).join("") || `<p style="color:var(--text-muted);">No recipes match your search.</p>`}
    </div>
    ${openRecipe ? renderRecipeModal(openRecipe) : ""}
  `;

  document.getElementById("recipeSearch").addEventListener("input", (e) => {
    recipeFilter.query = e.target.value;
    renderRecipes();
  });
  document.getElementById("recipeCategory").addEventListener("change", (e) => {
    recipeFilter.category = e.target.value;
    renderRecipes();
  });
  view.querySelectorAll("[data-recipe]").forEach(card => {
    card.addEventListener("click", () => {
      openRecipe = card.dataset.recipe;
      renderRecipes();
    });
  });
  const backdrop = view.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) { openRecipe = null; renderRecipes(); }
    });
    const closeBtn = view.querySelector(".modal-close");
    if (closeBtn) closeBtn.addEventListener("click", () => { openRecipe = null; renderRecipes(); });
  }
}

function renderRecipeModal(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return "";
  return `
    <div class="modal-backdrop">
      <div class="modal">
        <button class="modal-close">✕</button>
        <span class="pill pill-accent">${r.category}</span>
        <h3 style="margin-top:8px;">${escapeHtml(r.name)}</h3>
        <div class="recipe-meta" style="margin-bottom:10px;">
          <span>${r.kcal} kcal</span>
          <span>${r.protein}g protein</span>
          <span>${r.prepMin} min prep</span>
        </div>
        <strong>Ingredients</strong>
        <ul class="recipe-detail-list">
          ${r.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
        </ul>
        <strong>Steps</strong>
        <ol class="recipe-detail-list">
          ${r.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `;
}

/* ---------- Grocery ---------- */

function renderGrocery() {
  const checks = Store.getGroceryChecks();
  const weekData = GROCERY_LISTS.find(w => w.week === groceryWeek);

  view.innerHTML = `
    <div class="section-title">Weekly Grocery List</div>
    <div class="tabgroup">
      ${GROCERY_LISTS.map(w => `<button data-week="${w.week}" class="${w.week === groceryWeek ? "active" : ""}">Week ${w.week}</button>`).join("")}
    </div>
    <div class="grocery-week">
      ${weekData.categories.map(cat => {
        const catTotal = cat.items.reduce((s, it) => s + it.price, 0);
        return `
          <div class="card grocery-cat">
            <h4>${cat.name}</h4>
            ${cat.items.map(it => {
              const id = `w${groceryWeek}-${cat.name}-${it.item}`.replace(/\s+/g, "_");
              const checked = !!checks[id];
              return `
                <label class="grocery-item ${checked ? "checked" : ""}">
                  <input type="checkbox" data-grocery="${id}" ${checked ? "checked" : ""}>
                  <span class="g-name">${escapeHtml(it.item)}</span>
                  <span class="g-qty">${escapeHtml(it.qty)}</span>
                  <span class="g-price">₹${it.price}</span>
                </label>
              `;
            }).join("")}
            <div class="grocery-total">Subtotal: ₹${catTotal}</div>
          </div>
        `;
      }).join("")}
      <div class="grocery-total" style="font-size:15px;">
        Week ${groceryWeek} total: ₹${weekData.categories.reduce((s, c) => s + c.items.reduce((s2, it) => s2 + it.price, 0), 0)}
      </div>
    </div>
  `;

  view.querySelectorAll("[data-week]").forEach(btn => {
    btn.addEventListener("click", () => {
      groceryWeek = Number(btn.dataset.week);
      renderGrocery();
    });
  });
  view.querySelectorAll("[data-grocery]").forEach(cb => {
    cb.addEventListener("change", () => {
      Store.toggleGroceryCheck(cb.dataset.grocery);
      renderGrocery();
    });
  });
}

/* ---------- Trackers ---------- */

let trackerSubtab = "weight";

function renderTrackers() {
  view.innerHTML = `
    <div class="section-title">Trackers</div>
    <div class="tabgroup" id="trackerTabs">
      <button data-sub="weight" class="${trackerSubtab === "weight" ? "active" : ""}">Weight</button>
      <button data-sub="water" class="${trackerSubtab === "water" ? "active" : ""}">Water</button>
      <button data-sub="workout" class="${trackerSubtab === "workout" ? "active" : ""}">Workout Plan</button>
    </div>
    <div id="trackerBody"></div>
  `;

  view.querySelectorAll("[data-sub]").forEach(btn => {
    btn.addEventListener("click", () => {
      trackerSubtab = btn.dataset.sub;
      renderTrackers();
    });
  });

  const body = document.getElementById("trackerBody");
  if (trackerSubtab === "weight") renderWeightTracker(body);
  else if (trackerSubtab === "water") renderWaterTracker(body);
  else renderWorkoutPlan(body);
}

function renderWeightTracker(body) {
  const log = Store.getWeightLog();
  const last8 = log.slice(-8);

  body.innerHTML = `
    <div class="card" style="margin-bottom:16px;">
      <h3>Log Today's Weight</h3>
      <div class="tracker-form">
        <input type="date" id="weightDate" value="${todayISO()}">
        <input type="number" id="weightKg" placeholder="kg" step="0.1" min="30" max="200">
        <button id="addWeightBtn">Add Entry</button>
      </div>
    </div>
    <div class="grid grid-2" style="align-items:start;">
      <div class="card">
        <h3>Trend (last 8 entries)</h3>
        <canvas class="chart-canvas" id="weightChart"></canvas>
      </div>
      <div class="card">
        <h3>History</h3>
        <table class="log-table">
          <thead><tr><th>Date</th><th>Weight (kg)</th><th></th></tr></thead>
          <tbody>
            ${log.slice().reverse().map(e => `
              <tr>
                <td>${e.date}</td>
                <td>${e.kg}</td>
                <td><button class="del-btn" data-del-weight="${e.date}">Remove</button></td>
              </tr>
            `).join("") || `<tr><td colspan="3" style="color:var(--text-muted);">No entries yet</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const canvas = document.getElementById("weightChart");
  drawLineChart(canvas, last8.map(e => ({ y: e.kg, label: e.date.slice(5) })), { emptyMessage: "Log a weight entry to see your trend" });

  document.getElementById("addWeightBtn").addEventListener("click", () => {
    const date = document.getElementById("weightDate").value || todayISO();
    const kg = parseFloat(document.getElementById("weightKg").value);
    if (!kg || kg <= 0) return;
    Store.addWeightEntry(date, kg);
    renderWeightTracker(body);
  });

  body.querySelectorAll("[data-del-weight]").forEach(btn => {
    btn.addEventListener("click", () => {
      Store.deleteWeightEntry(btn.dataset.delWeight);
      renderWeightTracker(body);
    });
  });
}

function renderWaterTracker(body) {
  const waterLog = Store.getWaterLog();
  const today = todayISO();
  const todayCount = waterLog[today] || 0;

  // last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: iso, label: iso.slice(5), count: waterLog[iso] || 0 });
  }

  body.innerHTML = `
    <div class="card" style="margin-bottom:16px;">
      <h3>Today's Water Intake</h3>
      <div class="tracker-form" style="align-items:center;">
        <button id="waterMinus" style="background:var(--surface-alt); color:var(--text); border:1px solid var(--border);">−</button>
        <div class="stat-value" id="waterCount" style="min-width:50px; text-align:center;">${todayCount}</div>
        <button id="waterPlus">+ glass (250ml)</button>
        <span class="pill">${(todayCount * 0.25).toFixed(2)} L / ${PROFILE.water}</span>
      </div>
    </div>
    <div class="card">
      <h3>Last 7 Days</h3>
      <canvas class="chart-canvas" id="waterChart"></canvas>
    </div>
  `;

  const canvas = document.getElementById("waterChart");
  drawBarChart(canvas, days.map(d => ({ y: d.count, label: d.label })), { target: 11, emptyMessage: "Log water to see your trend" });

  document.getElementById("waterPlus").addEventListener("click", () => {
    Store.setWaterCount(today, (waterLog[today] || 0) + 1);
    renderWaterTracker(body);
  });
  document.getElementById("waterMinus").addEventListener("click", () => {
    Store.setWaterCount(today, Math.max(0, (waterLog[today] || 0) - 1));
    renderWaterTracker(body);
  });
}

function renderWorkoutPlan(body) {
  body.innerHTML = `
    <div class="grid grid-2">
      ${WORKOUT_PLAN.map(d => `
        <div class="card workout-day">
          <h4>${d.day} <span class="pill pill-accent">${d.focus}</span></h4>
          <table class="log-table">
            <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th></tr></thead>
            <tbody>
              ${d.exercises.map(ex => `
                <tr><td>${escapeHtml(ex.name)}</td><td>${ex.sets}</td><td>${ex.reps}</td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- Global chrome: nav, dark mode, print ---------- */

function initNav() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });
}

function initDarkMode() {
  const isDark = Store.getDarkMode();
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  const btn = document.getElementById("darkToggle");
  btn.textContent = isDark ? "☀️" : "🌙";
  btn.addEventListener("click", () => {
    const nowDark = document.documentElement.getAttribute("data-theme") !== "dark";
    document.documentElement.setAttribute("data-theme", nowDark ? "dark" : "light");
    Store.setDarkMode(nowDark);
    btn.textContent = nowDark ? "☀️" : "🌙";
    // Redraw any charts on screen so colors update immediately.
    const activeTab = Store.getActiveTab();
    if (activeTab === "trackers") renderTrackers();
  });
}

function initPrint() {
  document.getElementById("printBtn").addEventListener("click", () => window.print());
}

function init() {
  initNav();
  initDarkMode();
  initPrint();
  setActiveTab(Store.getActiveTab());
}

init();
