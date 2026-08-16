// Афиша Москвы — карта мероприятий с календарём и фильтром.
// Все данные о мероприятиях — демонстрационный набор (webapp/data/events.json),
// не подключены к внешнему API.

const CATEGORIES = {
  concerts:   { label: "Концерты",       emoji: "🎵", color: "#5b5bf0" },
  festivals:  { label: "Фестивали",      emoji: "🎉", color: "#ff6b6b" },
  exhibitions:{ label: "Выставки",       emoji: "🖼️", color: "#2fb5a0" },
  theatre:    { label: "Театр",          emoji: "🎭", color: "#f2994a" },
  sport:      { label: "Спорт",          emoji: "🏅", color: "#2f80ed" },
  kids:       { label: "Детям",          emoji: "🧸", color: "#eb5fa8" },
  cinema:     { label: "Кино",           emoji: "🎬", color: "#3fb27f" },
  fairs:      { label: "Ярмарки",        emoji: "🛍️", color: "#bb8f3d" },
};

const MONTH_NAMES = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

const state = {
  events: [],
  activeCategories: new Set(Object.keys(CATEGORIES)),
  selectedDate: null, // "YYYY-MM-DD"
  query: "",
  calendarMonth: new Date(2026, 7, 1), // August 2026 — matches sample data / "today"
  activeEventId: null,
};

let map;
const markers = new Map(); // id -> leaflet marker

init();

async function init() {
  initMap();
  renderCategoryChips();
  bindControls();

  try {
    const res = await fetch("data/events.json");
    state.events = await res.json();
  } catch (err) {
    console.error("Не удалось загрузить мероприятия", err);
    state.events = [];
  }

  renderCalendar();
  renderAll();
}

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([55.7558, 37.6176], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

function bindControls() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    renderAll();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.activeCategories = new Set(Object.keys(CATEGORIES));
    state.query = "";
    document.getElementById("searchInput").value = "";
    renderCategoryChips();
    renderAll();
  });

  document.getElementById("clearDate").addEventListener("click", () => {
    state.selectedDate = null;
    renderCalendar();
    renderAll();
  });

  document.getElementById("prevMonth").addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });
}

function renderCategoryChips() {
  const wrap = document.getElementById("categoryList");
  wrap.innerHTML = "";
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const active = state.activeCategories.has(key);
    const chip = document.createElement("div");
    chip.className = "chip" + (active ? " active" : " inactive");
    if (active) chip.style.background = cat.color;
    chip.innerHTML = `<span class="dot" style="background:${active ? "white" : cat.color}"></span>${cat.emoji} ${cat.label}`;
    chip.addEventListener("click", () => {
      if (state.activeCategories.has(key)) {
        state.activeCategories.delete(key);
      } else {
        state.activeCategories.add(key);
      }
      renderCategoryChips();
      renderAll();
    });
    wrap.appendChild(chip);
  });
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function renderCalendar() {
  const monthLabel = document.getElementById("monthLabel");
  const grid = document.getElementById("calendarGrid");
  const clearBtn = document.getElementById("clearDate");
  const month = state.calendarMonth;

  monthLabel.textContent = `${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`;
  clearBtn.hidden = !state.selectedDate;

  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  // Monday-first weekday index (0 = Monday ... 6 = Sunday)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const eventsByDate = countEventsByDate();
  const todayISO = toISODate(new Date(2026, 7, 17)); // fixed "today" reference for demo

  grid.innerHTML = "";

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(month.getFullYear(), month.getMonth(), day);
    const iso = toISODate(cellDate);
    const cell = document.createElement("div");
    cell.className = "cal-day";
    if (eventsByDate[iso]) cell.classList.add("has-events");
    if (iso === state.selectedDate) cell.classList.add("selected");
    if (iso === todayISO) cell.classList.add("today");
    cell.textContent = String(day);
    cell.title = eventsByDate[iso] ? `${eventsByDate[iso]} мероприятий` : "";
    cell.addEventListener("click", () => {
      state.selectedDate = state.selectedDate === iso ? null : iso;
      renderCalendar();
      renderAll();
    });
    grid.appendChild(cell);
  }
}

function countEventsByDate() {
  const counts = {};
  getCategoryAndSearchFiltered().forEach((ev) => {
    counts[ev.date] = (counts[ev.date] || 0) + 1;
  });
  return counts;
}

function getCategoryAndSearchFiltered() {
  return state.events.filter((ev) => {
    if (!state.activeCategories.has(ev.category)) return false;
    if (state.query) {
      const hay = `${ev.title} ${ev.venue} ${ev.address}`.toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  });
}

function getFilteredEvents() {
  return getCategoryAndSearchFiltered()
    .filter((ev) => !state.selectedDate || ev.date === state.selectedDate)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

function renderAll() {
  const filtered = getFilteredEvents();
  renderMarkers(filtered);
  renderList(filtered);
  document.getElementById("resultCount").textContent = filtered.length;
}

function makeIcon(category) {
  const cat = CATEGORIES[category];
  return L.divIcon({
    className: "",
    html: `<div class="marker-pin" style="background:${cat.color}"><span>${cat.emoji}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

function formatDateRu(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function renderMarkers(events) {
  markers.forEach((m) => map.removeLayer(m));
  markers.clear();

  const visibleIds = new Set(events.map((e) => e.id));

  events.forEach((ev) => {
    const marker = L.marker([ev.lat, ev.lng], { icon: makeIcon(ev.category) });
    const cat = CATEGORIES[ev.category];
    marker.bindPopup(`
      <div class="popup-card">
        <div class="cat-label"><span class="dot" style="background:${cat.color}"></span>${cat.emoji} ${cat.label}</div>
        <h3>${escapeHtml(ev.title)}</h3>
        <div class="meta">📅 ${formatDateRu(ev.date)} · ${ev.time}</div>
        <div class="meta">📍 ${escapeHtml(ev.venue)}</div>
        <div class="meta">💰 ${escapeHtml(ev.price)}</div>
        <div class="desc">${escapeHtml(ev.description)}</div>
      </div>
    `);
    marker.on("click", () => setActiveEvent(ev.id, false));
    marker.addTo(map);
    markers.set(ev.id, marker);
  });

  if (state.activeEventId && !visibleIds.has(state.activeEventId)) {
    state.activeEventId = null;
  }
}

function renderList(events) {
  const list = document.getElementById("eventList");
  list.innerHTML = "";

  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Ничего не найдено. Измените фильтры или дату.";
    list.appendChild(empty);
    return;
  }

  events.forEach((ev) => {
    const cat = CATEGORIES[ev.category];
    const card = document.createElement("div");
    card.className = "event-card" + (ev.id === state.activeEventId ? " active" : "");
    card.innerHTML = `
      <div class="event-card-top">
        <span class="cat-dot" style="background:${cat.color}"></span>
        ${formatDateRu(ev.date)} · ${ev.time}
      </div>
      <h3>${escapeHtml(ev.title)}</h3>
      <div class="venue">📍 ${escapeHtml(ev.venue)}</div>
    `;
    card.addEventListener("click", () => setActiveEvent(ev.id, true));
    list.appendChild(card);
  });
}

function setActiveEvent(id, flyTo) {
  state.activeEventId = id;
  const ev = state.events.find((e) => e.id === id);
  if (!ev) return;

  document.querySelectorAll(".event-card").forEach((el) => el.classList.remove("active"));
  renderList(getFilteredEvents());

  const marker = markers.get(id);
  if (marker) {
    if (flyTo) map.flyTo([ev.lat, ev.lng], 14, { duration: 0.6 });
    marker.openPopup();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
