const $ = (selector) => document.querySelector(selector);
const movements = JSON.parse(localStorage.getItem("umoni-expenses") || "[]");
const expenses = movements.filter((item) => item.type !== "income");
const incomes = movements.filter((item) => item.type === "income");
const money = (value, currency = "BRL") =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency });
const page = document.body.dataset.page;
const titles = {
  lancamentos: [
    "SEUS REGISTROS",
    "Lançamentos",
    "Visualize e edite todas as suas movimentações.",
  ],
  categorias: [
    "ORGANIZAÇÃO",
    "Categorias",
    "Acompanhe quanto você movimenta em cada categoria.",
  ],
  orcamento: [
    "PLANEJAMENTO",
    "Orçamento",
    "Defina limites e acompanhe sua evolução financeira.",
  ],
  calendario: [
    "CONSULTA POR DATA",
    "Calendário",
    "Analise suas movimentações por dia, mês ou ano.",
  ],
  analises: [
    "INTELIGÊNCIA FINANCEIRA",
    "Análises",
    "Compare seus gastos e receitas ao longo do tempo.",
  ],
};
const [eyebrow, title, description] = titles[page];
document.querySelector("#eyebrow").textContent = eyebrow;
document.querySelector("h1").textContent = title;
document.querySelector("#description").textContent = description;
document
  .querySelectorAll("nav a")
  .forEach((link) =>
    link.classList.toggle("active", link.dataset.page === page),
  );
const total = (items) =>
  items.reduce((sum, item) => sum + Number(item.amount), 0);
const categories = expenses.reduce((result, item) => {
  const category = item.category || "Sem categoria";
  result[category] = (result[category] || 0) + Number(item.amount);
  return result;
}, {});
const movementRows = movements
  .slice()
  .reverse()
  .map(
    (item) =>
      `<div class="detail-item"><div><strong>${item.description || "Descrição não informada"}</strong><small>${item.date} • ${item.category || "Sem categoria"}</small></div><strong>${money(item.amount, item.currency)}</strong></div>`,
  )
  .join("");
const categoryRows = Object.entries(categories)
  .sort(([, a], [, b]) => b - a)
  .map(
    ([name, amount], index) =>
      `<div class="analysis-item"><span class="analysis-category-icon category-color-${index % 6}">${["📚", "🛒", "🍽️", "🚗", "🎟️", "📦"][index % 6]}</span><div class="analysis-category-content"><strong>${name}</strong><small>${total(expenses) ? Math.round((amount / total(expenses)) * 100) : 0}% dos gastos</small><progress value="${total(expenses) ? (amount / total(expenses)) * 100 : 0}" max="100"></progress></div><strong>${money(amount)}</strong></div>`,
  )
  .join("");
const content = {
  lancamentos: `<div class="metrics module-metrics"><article><small>Total de movimentações</small><h2>${movements.length}</h2></article><article><small>Despesas</small><h2>${money(total(expenses))}</h2></article><article><small>Receitas</small><h2>${money(total(incomes))}</h2></article></div><article class="panel module-card"><h2>Todos os registros</h2>${movementRows || "<p>Nenhum registro cadastrado.</p>"}</article>`,
  categorias: `<div class="metrics module-metrics"><article><small>Total em categorias</small><h2>${money(total(expenses))}</h2></article><article><small>Categorias utilizadas</small><h2>${Object.keys(categories).length}</h2></article></div><article class="panel module-card categories-page"><div class="module-section-heading"><div><small class="eyebrow">DISTRIBUIÇÃO</small><h2>Seus gastos por categoria</h2></div><span>Toque em uma categoria para consultar os registros.</span></div><div class="category-card-grid">${Object.entries(categories).sort(([, a], [, b]) => b - a).map(([name, amount], index) => `<article class="category-summary-card"><div class="category-summary-icon category-color-${index % 6}">${["🍽️", "🛒", "📚", "🚗", "🎟️", "📦"][index % 6]}</div><div class="category-summary-main"><strong>${name}</strong><small>${total(expenses) ? Math.round((amount / total(expenses)) * 100) : 0}% dos gastos</small><progress value="${total(expenses) ? (amount / total(expenses)) * 100 : 0}" max="100"></progress></div><strong>${money(amount)}</strong></article>`).join("") || "<p>Nenhuma categoria possui movimentações.</p>"}</div></article>`,
  orcamento: `<div class="metrics module-metrics"><article><small>Despesas atuais</small><h2>${money(total(expenses))}</h2></article><article><small>Receitas atuais</small><h2>${money(total(incomes))}</h2></article><article><small>Saldo disponível</small><h2 id="budget-balance">${money(total(incomes) - total(expenses))}</h2></article></div><article class="panel module-card"><div class="module-section-heading"><div><h2>Planejamento mensal</h2><p>Defina seu limite mensal para acompanhar o orçamento na Visão geral.</p></div><button id="open-budget" type="button">Definir planejamento</button></div><form id="budget-form" class="budget-form" hidden><label>Limite mensal<input id="budget-amount" inputmode="decimal" placeholder="Ex.: 2.500,00" required></label><div class="modal-actions"><button class="outline" id="cancel-budget" type="button">Cancelar</button><button type="submit">Salvar planejamento</button></div><small id="budget-feedback"></small></form><div id="budget-summary" class="budget-summary"></div></article>`,
  calendario: `<article class="panel module-card"><h2>Consultar movimentações</h2><div class="calendar-filters"><label>Visualizar por<select id="module-calendar-period"><option value="day">Dia</option><option value="month" selected>Mês</option><option value="year">Ano</option></select></label><label id="module-calendar-day-field">Dia<input id="module-calendar-day" type="date"></label><label id="module-calendar-month-field" hidden>Mês<select id="module-calendar-month"><option value="0">Janeiro</option><option value="1">Fevereiro</option><option value="2">Março</option><option value="3">Abril</option><option value="4">Maio</option><option value="5">Junho</option><option value="6">Julho</option><option value="7">Agosto</option><option value="8">Setembro</option><option value="9">Outubro</option><option value="10">Novembro</option><option value="11">Dezembro</option></select></label><label>Ano<select id="module-calendar-year"></select></label></div><div id="module-calendar-result" class="calendar-result"></div></article>`,
  analises: `<div class="metrics module-metrics"><article><small>Total em despesas</small><h2>${money(total(expenses))}</h2></article><article><small>Total em receitas</small><h2>${money(total(incomes))}</h2></article><article><small>Resultado</small><h2>${money(total(incomes) - total(expenses))}</h2></article></div><article class="panel module-card"><h2>Distribuição dos gastos</h2><div class="analysis-list">${categoryRows || "<p>Adicione movimentações para gerar análises.</p>"}</div></article>`,
}[page];
document.querySelector("#content").innerHTML = content;
if (page === "calendario") {
  document.querySelector("#content").innerHTML =
    `<article class="panel module-card calendar-page"><div class="calendar-toolbar"><button class="outline" id="calendar-previous">← Anterior</button><h2 id="calendar-title"></h2><button class="outline" id="calendar-next">Próximo →</button></div><div class="calendar-weekdays"><strong>Dom</strong><strong>Seg</strong><strong>Ter</strong><strong>Qua</strong><strong>Qui</strong><strong>Sex</strong><strong>Sáb</strong></div><div class="calendar-grid" id="module-calendar-grid"></div><button class="outline calendar-today" id="calendar-today">Hoje</button><div id="module-calendar-result" class="calendar-result"></div></article>`;
}
if (page === "orcamento") {
  const budgetKey = `umoni-budget-${new Date().toISOString().slice(0, 7)}`;
  const budgetForm = $("#budget-form");
  const budgetAmount = $("#budget-amount");
  const budgetSummary = $("#budget-summary");
  const renderBudget = () => {
    const amount = Number(localStorage.getItem(budgetKey) || 0);
    budgetSummary.textContent = amount ? `Limite definido: ${money(amount)}` : "Nenhum planejamento definido para este mês.";
  };
  $("#open-budget").onclick = () => { budgetForm.hidden = false; budgetAmount.focus(); };
  $("#cancel-budget").onclick = () => { budgetForm.hidden = true; };
  budgetForm.onsubmit = (event) => {
    event.preventDefault();
    const amount = Number(budgetAmount.value.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    localStorage.setItem(budgetKey, String(amount));
    budgetForm.hidden = true;
    budgetAmount.value = "";
    renderBudget();
  };
  renderBudget();
}
if (
  page === "calendario" &&
  document.querySelector("#module-calendar-period")
) {
  const today = new Date();
  const period = document.querySelector("#module-calendar-period");
  const day = document.querySelector("#module-calendar-day");
  const month = document.querySelector("#module-calendar-month");
  const year = document.querySelector("#module-calendar-year");
  const dayField = document.querySelector("#module-calendar-day-field");
  const monthField = document.querySelector("#module-calendar-month-field");
  for (
    let value = today.getFullYear() - 5;
    value <= today.getFullYear() + 1;
    value += 1
  )
    year.add(new Option(String(value), String(value)));
  day.value = today.toISOString().slice(0, 10);
  if (themeSelect?.value === "seasonal") applyTheme("seasonal");
  month.value = String(today.getMonth());
  year.value = String(today.getFullYear());
  const renderCalendar = () => {
    const selected = movements.filter((item) => {
      const date = item.dateKey || "";
      if (period.value === "day") return date === day.value;
      if (period.value === "month")
        return (
          date.slice(0, 4) === year.value &&
          Number(date.slice(5, 7)) - 1 === Number(month.value)
        );
      return date.slice(0, 4) === year.value;
    });
    document.querySelector("#module-calendar-result").innerHTML =
      selected.length
        ? `<strong>${selected.length} movimentação(ões)</strong> • Total: <strong>${money(total(selected))}</strong>${selected.map((item) => `<div class="detail-item"><div><strong>${item.description || "Descrição não informada"}</strong><small>${item.date} • ${item.category || "Sem categoria"}</small></div><strong>${money(item.amount, item.currency)}</strong></div>`).join("")}`
        : "Nenhuma movimentação encontrada para este período.";
  };
  period.onchange = () => {
    dayField.hidden = period.value !== "day";
    monthField.hidden = period.value !== "month";
    renderCalendar();
  };
  day.onchange = renderCalendar;
  month.onchange = renderCalendar;
  year.onchange = renderCalendar;
  renderCalendar();
}
if (page === "calendario") {
  let current = new Date();
  const names = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const renderMonth = () => {
    const year = current.getFullYear();
    const month = current.getMonth();
    $("#calendar-title").textContent = `${names[month]} de ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    $("#module-calendar-grid").innerHTML = Array.from(
      { length: firstDay + days },
      (_, index) => {
        if (index < firstDay) return '<div class="calendar-day empty"></div>';
        const day = index - firstDay + 1;
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const items = movements.filter((item) => item.dateKey === key);
        const dayExpenses = total(items.filter((item) => item.type !== "income"));
        const dayIncome = total(items.filter((item) => item.type === "income"));
        return `<button class="calendar-day${items.length ? " has-movements" : ""}" data-date="${key}"><span>${day}</span>${dayExpenses ? `<small class="calendar-expense">− ${money(dayExpenses)}</small>` : ""}${dayIncome ? `<small class="calendar-income">+ ${money(dayIncome)}</small>` : ""}</button>`;
      },
    ).join("");
    $("#module-calendar-grid")
      .querySelectorAll("[data-date]")
      .forEach((day) => {
        day.onclick = () => {
          const items = movements.filter(
            (item) => item.dateKey === day.dataset.date,
          );
          $("#module-calendar-result").innerHTML = items.length
            ? `<strong>Detalhes de ${new Date(`${day.dataset.date}T12:00:00`).toLocaleDateString("pt-BR")}</strong>${items
                .map(
                  (item) =>
                    `<div class="detail-item"><div><strong>${item.description || "Descrição não informada"}</strong><small>${item.date} • ${item.category || "Sem categoria"} • ${item.paymentMethod || "Não informado"}</small></div><strong>${money(item.amount, item.currency)}</strong></div>`,
                )
                .join("")}`
            : "Nenhuma movimentação neste dia.";
        };
      });
  };
  $("#calendar-previous").onclick = () => {
    current.setMonth(current.getMonth() - 1);
    renderMonth();
  };
  $("#calendar-next").onclick = () => {
    current.setMonth(current.getMonth() + 1);
    renderMonth();
  };
  $("#calendar-today").onclick = () => {
    current = new Date();
    renderMonth();
  };
  renderMonth();
}
