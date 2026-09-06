const themeSelect = document.querySelector("#theme-select");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
const savedTheme = localStorage.getItem("umoni-theme") || "light";
const seasonThemes = ["spring", "summer", "autumn", "winter"];
const southernTimezones = [
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/Montevideo",
  "America/Asuncion",
  "America/Santiago",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];
const isSouthernHemisphere = southernTimezones.some((zone) =>
  Intl.DateTimeFormat().resolvedOptions().timeZone?.startsWith(zone),
);
const applyTheme = (theme) => {
  const dashboardMonth = document.querySelector("#dashboard-month")?.value;
  const dashboardYear = document.querySelector("#dashboard-year")?.value;
  const moduleMonth = document.querySelector("#module-calendar-month")?.value;
  const moduleYear = document.querySelector("#module-calendar-year")?.value;
  const selectedDate =
    dashboardYear && dashboardMonth !== undefined
      ? `${dashboardYear}-${String(Number(dashboardMonth) + 1).padStart(2, "0")}-01`
      : moduleYear && moduleMonth !== undefined
        ? `${moduleYear}-${String(Number(moduleMonth) + 1).padStart(2, "0")}-01`
      : document.querySelector("#calendar-date")?.value ||
    document.querySelector("#module-calendar-day")?.value;
  const month = selectedDate
    ? Number(selectedDate.slice(5, 7))
    : new Date().getMonth() + 1;
  const calendarSeason = isSouthernHemisphere
    ? month <= 2 || month === 12 ? "summer" : month <= 5 ? "autumn" : month <= 8 ? "winter" : "spring"
    : month <= 2 || month === 12 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn";
  document.body.dataset.theme = seasonThemes.includes(theme)
    ? "seasonal"
    : theme;
  document.body.dataset.season = theme === "seasonal" ? calendarSeason : "none";
  document.body.style.colorScheme = theme === "night" ? "dark" : "light";
  if (themeSelect) themeSelect.value = theme;
};
applyTheme(savedTheme);
const menuToggle = document.querySelector("#menu-toggle");
const closeMobileMenu = () => document.body.classList.remove("menu-open");
menuToggle?.addEventListener("click", () =>
  document.body.classList.toggle("menu-open"),
);
document.addEventListener("click", (event) => {
  if (
    document.body.classList.contains("menu-open") &&
    !event.target.closest("aside") &&
    !event.target.closest("#menu-toggle")
  )
    closeMobileMenu();
});
themeSelect?.addEventListener("change", () => {
  localStorage.setItem("umoni-theme", themeSelect.value);
  applyTheme(themeSelect.value);
});
document.querySelector("#calendar-date")?.addEventListener("change", () => {
  if ((themeSelect?.value || savedTheme) === "seasonal") applyTheme("seasonal");
});
document
  .querySelector("#module-calendar-day")
  ?.addEventListener("change", () => {
    if ((themeSelect?.value || savedTheme) === "seasonal") applyTheme("seasonal");
  });
const updateSeasonalDashboardTheme = () => {
  if ((themeSelect?.value || savedTheme) === "seasonal") applyTheme("seasonal");
};
document
  .querySelector("#dashboard-month")
  ?.addEventListener("change", updateSeasonalDashboardTheme);
document
  .querySelector("#dashboard-year")
  ?.addEventListener("change", updateSeasonalDashboardTheme);
document.addEventListener("change", (event) => {
  if (
    ["module-calendar-day", "module-calendar-month", "module-calendar-year"].includes(
      event.target.id,
    ) && (themeSelect?.value || savedTheme) === "seasonal"
  ) {
    applyTheme("seasonal");
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.origin !== location.origin) return;
  const destination = new URL(link.href);
  const savedPeriod = localStorage.getItem("umoni-dashboard-month");
  if (savedPeriod && /^\d{4}-(0[1-9]|1[0-2])$/.test(savedPeriod) && destination.pathname.endsWith("/index.html")) {
    destination.searchParams.set("period", savedPeriod);
  }
  if (destination.pathname === location.pathname && destination.search === location.search) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  window.setTimeout(() => { window.location.href = destination.href; }, 180);
});
