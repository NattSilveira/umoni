const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = "umoni-expenses";
const modal = $("#modal");
const categoryModal = $("#category-modal");
const successModal = $("#success-modal");
const detailModal = $("#detail-modal");
const form = $("#form");
const categorySelect = $("#category-select");
const amountInput = $("#amount");
const descriptionInput = $("#description");
$("#expense-date").value = new Date().toISOString().slice(0, 10);
let editingIndex = null;

const getExpenses = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const displayDescription = (description) =>
  typeof description === "string" &&
  description.trim() &&
  description !== "[object PointerEvent]"
    ? description
    : "Descrição não informada";
const saveExpenses = (expenses) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
const currentDate = new Date();
const DASHBOARD_MONTH_KEY = "umoni-dashboard-month";
const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const dashboardMonthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const urlDashboardMonth = new URLSearchParams(window.location.search).get("period");
const savedDashboardMonth = dashboardMonthPattern.test(urlDashboardMonth || "")
  ? urlDashboardMonth
  : localStorage.getItem(DASHBOARD_MONTH_KEY);
let dashboardMonth = dashboardMonthPattern.test(savedDashboardMonth || "")
  ? savedDashboardMonth
  : monthKey(currentDate);
if (dashboardMonthPattern.test(urlDashboardMonth || ""))
  localStorage.setItem(DASHBOARD_MONTH_KEY, dashboardMonth);
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Date(2020, index, 1).toLocaleDateString("pt-BR", { month: "long" }),
);
const money = (value, currency = "BRL") =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency });
const parseAmount = (value) =>
  Number(value.replace(/\./g, "").replace(",", "."));
const chartColors = [
  "#7655e8",
  "#f0bd32",
  "#2f9d72",
  "#d85b86",
  "#3e8ed0",
  "#e07b39",
];
const categoryColorMap = (expenses) => {
  const categories = [
    ...new Set(expenses.map((item) => item.category || "Sem categoria")),
  ];
  return Object.fromEntries(
    categories.map((category, index) => [
      category,
      chartColors[index % chartColors.length],
    ]),
  );
};
const close = (element) => element.classList.remove("open");

function openMovement(type = "expense") {
  $("#movement-type").value = type;
  $("#form h2").textContent =
    type === "income"
      ? "Nova receita"
      : editingIndex === null
        ? "Novo gasto"
        : "Editar gasto";
  modal.classList.add("open");
}
function formatAmount() {
  const digits = amountInput.value.replace(/\D/g, "");
  amountInput.value = digits
    ? (Number(digits) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })
    : "";
}
function renderSummary(expenses) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const categories = expenses.reduce((result, item) => {
    const category = item.category || "Sem categoria";
    result[category] = (result[category] || 0) + Number(item.amount);
    return result;
  }, {});
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  $("#total-spent").textContent = money(total);
  $("#transaction-count").textContent = expenses.length;
  $("#top-category").textContent = topCategory ? topCategory[0] : "Nenhuma";
  $("#top-category-value").textContent = topCategory
    ? `${money(topCategory[1])} no mês`
    : "Suas categorias aparecerão aqui";
}
function renderAnalysis(expenses) {
  const period = $("#analysis-period")?.value || "month";
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = {
    week: 7,
    month: 31,
    bimester: 62,
    quarter: 93,
    semester: 186,
    year: 366,
  }[period];
  start.setDate(start.getDate() - days + 1);
  const visible = expenses.filter((item) => {
    const date = new Date(`${item.dateKey || ""}T12:00:00`);
    return !Number.isNaN(date.getTime()) && date >= start && date <= now;
  });
  const total = visible
    .filter((item) => item.type !== "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const income = visible
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const groups = Object.entries(
    visible
      .filter((item) => item.type !== "income")
      .reduce((result, item) => {
        const category = item.category || "Sem categoria";
        result[category] = (result[category] || 0) + Number(item.amount);
        return result;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);
  $("#analysis-total").textContent = money(total);
  $("#analysis-top").textContent = groups[0]?.[0] || "Nenhuma";
  $("#analysis-count").textContent = groups.length;
  $("#analysis-income").textContent = money(income);
  const colors = categoryColorMap(visible);
  $("#analysis-list").innerHTML = groups.length
    ? groups
        .map(
          ([category, amount]) =>
            `<div class="analysis-item"><strong><i class="legend-dot" style="background:${colors[category]}"></i> ${category}</strong><progress style="accent-color:${colors[category]}" value="${total ? (amount / total) * 100 : 0}" max="100"></progress><strong>${money(amount)}</strong></div>`,
        )
        .join("")
    : '<p class="empty-row">Adicione gastos para gerar sua análise mensal.</p>';
}
function renderTransactions(expenses) {
  const rows = expenses
    .slice()
    .reverse()
    .map((item, position) => {
      const index = getExpenses().indexOf(item);
      return `<tr><td><strong>${displayDescription(item.description)}</strong><small>${item.paymentMethod} • ${item.currency}</small></td><td><label>${item.category || "Sem categoria"}</label></td><td>${item.date}</td><td>− ${money(item.amount, item.currency)}</td><td class="actions-cell"><button class="table-action" data-edit="${index}">Editar</button><button class="table-action delete" data-delete="${index}">Excluir</button></td></tr>`;
    })
    .join("");
  $("#transactions-table").innerHTML =
    `<tr><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>DATA</th><th>VALOR</th><th>AÇÕES</th></tr>${rows || '<tr><td colspan="5" class="empty-row">Nenhum lançamento ainda. Use “Adicionar gasto” para começar.</td></tr>'}`;
}
function renderChart(expenses) {
  if (!expenses.length) {
    $("#spending-chart").innerHTML = '<p class="chart-empty">Nenhum lançamento neste mês.</p>';
    $("#chart-legend").innerHTML = "";
    $("#chart-start").textContent = "—";
    $("#chart-end").textContent = "—";
    return;
  }
  const colorByCategory = categoryColorMap(expenses);
  const categories = Object.keys(colorByCategory);
  const max = Math.max(...expenses.map((item) => Number(item.amount)), 1);
  $("#spending-chart").innerHTML = expenses
    .map(
      (item) =>
        `<i data-detail-index="${getExpenses().indexOf(item)}" style="height:${Math.max((Number(item.amount) / max) * 100, 5)}%;background:${colorByCategory[item.category || "Sem categoria"]}"></i>`,
    )
    .join("");
  $("#chart-legend").innerHTML = categories
    .map(
      (category) =>
        `<span class="legend-item"><i class="legend-dot" style="background:${colorByCategory[category]}"></i>${category}</span>`,
    )
    .join("");
  $("#chart-start").textContent = expenses[0].date;
  $("#chart-end").textContent = expenses.at(-1).date;
}
function renderCategories(expenses) {
  const panel = $("#category-insights");
  if (!panel) return;
  if (!expenses.length) {
    panel.innerHTML = '<p class="empty-row">Nenhum gasto registrado neste mês.</p>';
    return;
  }
  const totals = Object.entries(
    expenses.reduce((result, item) => {
      const category = item.category || "Sem categoria";
      result[category] = (result[category] || 0) + Number(item.amount);
      return result;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const total = totals.reduce((sum, [, amount]) => sum + amount, 0);
  panel.innerHTML = totals
    .slice(0, 4)
    .map(
      ([name, amount]) =>
        `<div class="category" data-category="${name}"><b style="background:${categoryColorMap(expenses)[name]}">◉</b><div><strong>${name}</strong><small>${Math.round((amount / total) * 100)}% do total</small><progress style="accent-color:${categoryColorMap(expenses)[name]}" value="${(amount / total) * 100}" max="100"></progress></div><strong>${money(amount)}</strong></div>`,
    )
    .join("");
}
function refresh() {
  const expenses = getExpenses().filter((item) => (item.dateKey || "").slice(0, 7) === dashboardMonth);
  renderSummary(expenses);
  renderTransactions(expenses);
  renderChart(expenses);
  renderCategories(expenses);
  renderAnalysis(expenses);
  const selected = new Date(`${dashboardMonth}-01T12:00:00`);
  $("#dashboard-year").value = String(selected.getFullYear());
  $("#dashboard-month").value = String(selected.getMonth());
}

const dashboardYearSelect = $("#dashboard-year");
const dashboardMonthSelect = $("#dashboard-month");
for (let year = currentDate.getFullYear() - 5; year <= currentDate.getFullYear() + 5; year += 1)
  dashboardYearSelect.add(new Option(String(year), String(year)));
monthNames.forEach((name, index) => dashboardMonthSelect.add(new Option(name, String(index))));
const updateDashboardMonth = () => {
  dashboardMonth = `${dashboardYearSelect.value}-${String(Number(dashboardMonthSelect.value) + 1).padStart(2, "0")}`;
  localStorage.setItem(DASHBOARD_MONTH_KEY, dashboardMonth);
  refresh();
};
const initialDashboardDate = new Date(`${dashboardMonth}-01T12:00:00`);
dashboardYearSelect.value = String(initialDashboardDate.getFullYear());
dashboardMonthSelect.value = String(initialDashboardDate.getMonth());
$("#today-label").textContent = currentDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }).toUpperCase();
dashboardYearSelect.onchange = updateDashboardMonth;
dashboardMonthSelect.onchange = updateDashboardMonth;

amountInput.addEventListener("input", formatAmount);
$("#open").onclick = openMovement;
$("#open-expense").onclick = openMovement;
$("#open-income").onclick = () => openMovement("income");
const dashboardParts = [
  $("#summary-cards"),
  $("#quick-actions"),
  $("#dashboard-insights"),
  $("#transactions-section"),
];
function showAnalysis() {
  dashboardParts.forEach((part) => (part.hidden = true));
  $("#analysis-view").hidden = false;
  setActive("#analysis-link");
}
function showDashboard() {
  dashboardParts.forEach((part) => (part.hidden = false));
  $("#analysis-view").hidden = true;
  setActive("#dashboard-link");
}
$("#analysis-link").onclick = showAnalysis;
$("#analysis-period").onchange = () => renderAnalysis(getExpenses());
$("#back-dashboard").onclick = showDashboard;
$("#dashboard-link").onclick = showDashboard;
function focusSection(link, section) {
  showDashboard();
  setActive(link);
  $(section).scrollIntoView({ behavior: "smooth" });
}
function setActive(link) {
  document
    .querySelectorAll("nav a")
    .forEach((item) => item.classList.remove("active"));
  $(link).classList.add("active");
}
$("#transactions-link").onclick = () =>
  focusSection("#transactions-link", "#transactions-section");
$("#view-all-transactions").onclick = (event) => {
  event.preventDefault();
  focusSection("#transactions-link", "#transactions-section");
};
$("#categories-link").onclick = () =>
  focusSection("#categories-link", "#dashboard-insights");
$("#budget-link").onclick = () =>
  focusSection("#budget-link", "#summary-cards");
$("#total-card").onclick = showAnalysis;
$("#total-card").style.cursor = "pointer";
$("#calendar-link").onclick = () =>
  focusSection("#calendar-link", "#calendar-module");
function renderCalendar() {
  const view = $("#calendar-view").value;
  const selectedDate =
    $("#calendar-date").value || new Date().toISOString().slice(0, 10);
  const selected =
    view === "day"
      ? selectedDate
      : `${$("#calendar-year").value}-${$("#calendar-month").value}`;
  const expenses = getExpenses().filter((item) => {
    const date = item.dateKey || "";
    return view === "day"
      ? date === selected
      : view === "month"
        ? date.slice(0, 7) === selected
        : date.slice(0, 4) === $("#calendar-year").value;
  });
  $("#calendar-result").innerHTML = expenses.length
    ? `<div class="calendar-summary"><strong>${expenses.length} movimentação(ões)</strong> • Total: <strong>${money(expenses.reduce((sum, item) => sum + Number(item.amount), 0))}</strong></div><div class="calendar-movements">${expenses
        .slice()
        .reverse()
        .map(
          (item) =>
            `<div class="detail-item"><div><strong>${displayDescription(item.description)}</strong><small>${item.date} • ${item.category || "Sem categoria"} • ${item.paymentMethod || "Não informado"}</small></div><strong>${money(item.amount, item.currency)}</strong></div>`,
        )
        .join("")}</div>`
    : "Nenhuma movimentação encontrada para este período.";
}
const calendarYear = $("#calendar-year");
const currentYear = new Date().getFullYear();
for (let year = currentYear - 5; year <= currentYear + 1; year += 1)
  calendarYear.add(new Option(String(year), String(year)));
calendarYear.value = String(currentYear);
$("#calendar-month").value = String(new Date().getMonth() + 1).padStart(2, "0");
$("#calendar-view").onchange = () => {
  const view = $("#calendar-view").value;
  $("#calendar-date").hidden = view !== "day";
  $("#calendar-month").hidden = view !== "month";
  $("#calendar-year").hidden = view === "day";
  renderCalendar();
};
$("#calendar-date").onchange = renderCalendar;
$("#calendar-month").onchange = renderCalendar;
$("#calendar-year").onchange = renderCalendar;
$("#calendar-view").dispatchEvent(new Event("change"));
$("#budget-card").onclick = () => {
  showDashboard();
  $("#summary-cards").scrollIntoView({ behavior: "smooth" });
  $("#budget-card").animate(
    [{ outline: "2px solid #f4d44d" }, { outline: "none" }],
    { duration: 900 },
  );
};
$("#top-category-card").onclick = () =>
  focusSection("#categories-link", "#dashboard-insights");
$("#transactions-card").onclick = () =>
  focusSection("#transactions-link", "#transactions-section");
$(".category-card").onclick = () => categoryModal.classList.add("open");
$("#close").onclick = () => close(modal);
$("#close-success").onclick = () => close(successModal);
$("#close-detail").onclick = () => close(detailModal);
detailModal.onclick = (event) => {
  if (event.target === detailModal) close(detailModal);
};
$("#close-category").onclick = () => close(categoryModal);
categorySelect.onchange = () => {
  if (categorySelect.value === "add-category") {
    categorySelect.selectedIndex = 0;
    categoryModal.classList.add("open");
  }
};
$("#category-form").onsubmit = (event) => {
  event.preventDefault();
  const name = $("#new-category-name").value.trim();
  if (!name) return;
  categorySelect.add(new Option(name, name), categorySelect.options.length - 1);
  categorySelect.value = name;
  $("#new-category-name").value = "";
  close(categoryModal);
};
form.onsubmit = (event) => {
  event.preventDefault();
  const expenses = getExpenses();
  const movement = {
    description: descriptionInput.value.trim(),
    amount: parseAmount(amountInput.value),
    currency: $("#currency").value,
    category: categorySelect.value,
    paymentMethod: $("#payment-method").value,
    type: $("#movement-type").value,
    date: new Date(`${$("#expense-date").value}T12:00:00`).toLocaleDateString(
      "pt-BR",
    ),
    month: $("#expense-date").value.slice(0, 7),
    dateKey: $("#expense-date").value,
  };
  if (editingIndex === null) expenses.push(movement);
  else expenses[editingIndex] = movement;
  saveExpenses(expenses);
  editingIndex = null;
  form.reset();
  close(modal);
  $("#success-message").textContent =
    `${movement.description} foi salvo em ${movement.currency} via ${movement.paymentMethod}.`;
  successModal.classList.add("open");
  refresh();
  renderCalendar();
};
$("#transactions-table").onclick = (event) => {
  const expenses = getExpenses();
  const edit = event.target.closest("[data-edit]");
  const remove = event.target.closest("[data-delete]");
  if (edit) {
    const index = Number(edit.dataset.edit);
    const item = expenses[index];
    editingIndex = index;
    descriptionInput.value = item.description;
    amountInput.value = Number(item.amount).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
    $("#currency").value = item.currency || "BRL";
    categorySelect.value = item.category || "Refeições";
    $("#payment-method").value = item.paymentMethod;
    openMovement();
  }
  if (remove) {
    expenses.splice(Number(remove.dataset.delete), 1);
    saveExpenses(expenses);
    refresh();
  }
};
function showDetails(items, title) {
  $("#detail-title").textContent = title;
  const currentTotal = items.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );
  const currency = items[0]?.currency || "BRL";
  $("#detail-total-value").textContent = money(currentTotal, currency);
  const category = items[0]?.category || "Sem categoria";
  const month = new Date().toISOString().slice(0, 7);
  const previousDate = new Date();
  previousDate.setMonth(previousDate.getMonth() - 1);
  const previousMonth = previousDate.toISOString().slice(0, 7);
  const allExpenses = getExpenses();
  const previousTotal = allExpenses
    .filter(
      (item) =>
        (item.category || "Sem categoria") === category &&
        item.month === previousMonth,
    )
    .reduce((total, item) => total + Number(item.amount), 0);
  const currentMonthTotal = allExpenses
    .filter(
      (item) =>
        (item.category || "Sem categoria") === category &&
        (item.month || month) === month,
    )
    .reduce((total, item) => total + Number(item.amount), 0);
  $("#detail-saving-value").textContent = previousTotal
    ? `Você economizou: ${money(Math.max(previousTotal - currentMonthTotal, 0), currency)}`
    : "Você economizou: aguardando comparação";
  $("#detail-list").innerHTML = items
    .map(
      (item) =>
        `<div class="detail-item"><div><strong>${displayDescription(item.description)}</strong><small>${item.date} • ${item.paymentMethod} • ${item.currency}</small></div><strong>${money(item.amount, item.currency)}</strong></div>`,
    )
    .join("");
  detailModal.classList.add("open");
}
$("#spending-chart").onclick = (event) => {
  const bar = event.target.closest("[data-detail-index]");
  if (bar) {
    const expenses = getExpenses();
    showDetails(
      [expenses[Number(bar.dataset.detailIndex)]],
      expenses[Number(bar.dataset.detailIndex)].category || "Detalhes do gasto",
    );
  }
};
$("#spending-chart").addEventListener("mousemove", (event) => {
  const bar = event.target.closest("[data-detail-index]");
  const tooltip = $("#chart-tooltip");
  if (!bar || !tooltip) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }
  const item = getExpenses()[Number(bar.dataset.detailIndex)];
  if (!item) return;
  tooltip.innerHTML = `<strong>${item.category || "Sem categoria"}</strong><span>• Dia: ${item.date}</span><span>• Descrição: ${displayDescription(item.description)}</span><span>• Valor: ${money(item.amount, item.currency)}</span><span>• Meio: ${item.paymentMethod || "Não informado"}</span>`;
  tooltip.style.display = "block";
  tooltip.style.left = `${Math.min(event.clientX + 14, window.innerWidth - 280)}px`;
  tooltip.style.top = `${Math.min(event.clientY + 14, window.innerHeight - 150)}px`;
});
$("#spending-chart").addEventListener("mouseleave", () => {
  const tooltip = $("#chart-tooltip");
  if (tooltip) tooltip.style.display = "none";
});
$("#category-insights").onclick = (event) => {
  const category = event.target.closest("[data-category]")?.dataset.category;
  if (category)
    showDetails(
      getExpenses().filter(
        (item) => (item.category || "Sem categoria") === category,
      ),
      `Gastos em ${category}`,
    );
};
refresh();
