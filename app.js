
const data = window.APP_DATA;

const els = {
  totalRecords: document.getElementById("totalRecords"),
  dateRange: document.getElementById("dateRange"),
  yearFilter: document.getElementById("yearFilter"),
  metricFilter: document.getElementById("metricFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  topFilter: document.getElementById("topFilter"),
  kpiLatestValue: document.getElementById("kpiLatestValue"),
  kpiLatestDate: document.getElementById("kpiLatestDate"),
  kpiAverage: document.getElementById("kpiAverage"),
  kpiMax: document.getElementById("kpiMax"),
  kpiMaxDate: document.getElementById("kpiMaxDate"),
  kpiMin: document.getElementById("kpiMin"),
  kpiMinDate: document.getElementById("kpiMinDate"),
  recentMonthsBody: document.getElementById("recentMonthsBody"),
};

const state = {
  year: "all",
  metric: "ars",
  category: "regions",
  top: 8,
};

const charts = {};

const moneyFormat = {
  ars: new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }),
  usd: new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }),
};

function metricLabel(metric) {
  return metric === "ars" ? "$/MWh" : "u$s/MWh";
}

function formatValue(value, metric) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${moneyFormat[metric].format(value)} ${metricLabel(metric)}`;
}

function formatMonth(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

function formatLongDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fillYearFilter() {
  els.yearFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Todos";
  els.yearFilter.appendChild(allOption);

  data.meta.years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    els.yearFilter.appendChild(option);
  });
}

function initMeta() {
  els.totalRecords.textContent = new Intl.NumberFormat("es-AR").format(data.meta.records);
  els.dateRange.textContent = `${formatLongDate(data.meta.dateRange.from)} → ${formatLongDate(data.meta.dateRange.to)}`;
}

function filterByYear(items, yearField = "year") {
  if (state.year === "all") return items;
  return items.filter((item) => String(item[yearField]) === String(state.year));
}

function getMonthlyData() {
  return filterByYear(data.monthly);
}

function getDailyData() {
  return filterByYear(data.daily);
}

function getHourlyData() {
  return filterByYear(data.hourly);
}

function getCategoryData() {
  const items = filterByYear(data.categories[state.category]);
  return [...items]
    .sort((a, b) => b[state.metric] - a[state.metric])
    .slice(0, state.top);
}

function updateKPIs() {
  const monthly = getMonthlyData();
  if (!monthly.length) return;

  const latest = monthly[monthly.length - 1];
  const values = monthly.map((item) => item[state.metric]);
  const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
  const maxItem = monthly.reduce((max, item) => (item[state.metric] > max[state.metric] ? item : max), monthly[0]);
  const minItem = monthly.reduce((min, item) => (item[state.metric] < min[state.metric] ? item : min), monthly[0]);

  els.kpiLatestValue.textContent = formatValue(latest[state.metric], state.metric);
  els.kpiLatestDate.textContent = formatMonth(latest.period);
  els.kpiAverage.textContent = formatValue(avg, state.metric);
  els.kpiMax.textContent = formatValue(maxItem[state.metric], state.metric);
  els.kpiMaxDate.textContent = formatMonth(maxItem.period);
  els.kpiMin.textContent = formatValue(minItem[state.metric], state.metric);
  els.kpiMinDate.textContent = formatMonth(minItem.period);
}

function renderRecentMonthsTable() {
  const items = [...data.monthly].slice(-6).reverse();
  els.recentMonthsBody.innerHTML = items.map((item) => `
    <tr>
      <td>${formatMonth(item.period)}</td>
      <td>${formatValue(item.ars, "ars")}</td>
      <td>${formatValue(item.usd, "usd")}</td>
    </tr>
  `).join("");
}

function buildChart(id, type, labels, values, datasetLabel, horizontal = false) {
  const canvas = document.getElementById(id);
  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data: values,
        borderWidth: 2,
        tension: 0.25,
        fill: type === "line",
        borderColor: "rgba(125, 211, 252, 1)",
        backgroundColor: horizontal ? "rgba(96, 165, 250, 0.55)" : "rgba(125, 211, 252, 0.18)",
      }]
    },
    options: {
      indexAxis: horizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#edf2ff" }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatValue(context.raw, state.metric)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#a9b4d0" },
          grid: { color: "rgba(255,255,255,0.06)" }
        },
        y: {
          ticks: {
            color: "#a9b4d0",
            callback: (value) => moneyFormat[state.metric].format(value)
          },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      }
    }
  });
}

function renderMonthlyChart() {
  const items = getMonthlyData();
  buildChart(
    "monthlyChart",
    "line",
    items.map((item) => formatMonth(item.period)),
    items.map((item) => item[state.metric]),
    `Evolución mensual (${metricLabel(state.metric)})`
  );
}

function renderDailyChart() {
  const items = getDailyData();
  buildChart(
    "dailyChart",
    "line",
    items.map((item) => item.label),
    items.map((item) => item[state.metric]),
    `Promedio diario (${metricLabel(state.metric)})`
  );
}

function renderHourlyChart() {
  const items = getHourlyData();
  buildChart(
    "hourlyChart",
    "bar",
    items.map((item) => `${String(item.hour).padStart(2, "0")}:00`),
    items.map((item) => item[state.metric]),
    `Promedio por hora (${metricLabel(state.metric)})`
  );
}

function renderCategoryChart() {
  const items = getCategoryData();
  buildChart(
    "categoryChart",
    "bar",
    items.map((item) => item.name),
    items.map((item) => item[state.metric]),
    `Top categorías (${metricLabel(state.metric)})`,
    true
  );
}

function renderAll() {
  updateKPIs();
  renderMonthlyChart();
  renderDailyChart();
  renderHourlyChart();
  renderCategoryChart();
}

function bindEvents() {
  els.yearFilter.addEventListener("change", (e) => {
    state.year = e.target.value;
    renderAll();
  });

  els.metricFilter.addEventListener("change", (e) => {
    state.metric = e.target.value;
    renderAll();
  });

  els.categoryFilter.addEventListener("change", (e) => {
    state.category = e.target.value;
    renderAll();
  });

  els.topFilter.addEventListener("change", (e) => {
    state.top = Number(e.target.value);
    renderAll();
  });
}

function init() {
  fillYearFilter();
  initMeta();
  renderRecentMonthsTable();
  bindEvents();
  renderAll();
}

init();
