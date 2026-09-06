import { useEffect, useState } from "react";

const themes = ["light", "night", "seasonal"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function App() {
  const now = new Date();
  const [theme, setTheme] = useState(() => localStorage.getItem("umoni-theme") || "light");
  const [month, setMonth] = useState(now.getMonth());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("umoni-theme", theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  return <div className="app-shell">
    <aside className={menuOpen ? "open" : ""}>
      <div className="brand"><span>U</span><strong>umoni</strong></div>
      <nav>{["Visão geral", "Lançamentos", "Categorias", "Orçamento", "Calendário", "Análises"].map((item, index) => <a className={index === 0 ? "active" : ""} href="#" key={item} onClick={() => setMenuOpen(false)}><i>{["⌂", "▤", "▣", "◉", "▦", "▥"][index]}</i>{item}</a>)}</nav>
      <div className="settings"><a href="#">⚙ Configurações</a><label>Aparência<select value={theme} onChange={(event) => setTheme(event.target.value)}>{themes.map((item) => <option value={item} key={item}>{item === "light" ? "Claro" : item === "night" ? "Noturno" : "Estação do ano"}</option>)}</select></label></div>
    </aside>
    <main>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <header><div><small>06 DE SETEMBRO</small><h1>Olá, Natalia.</h1><p>Veja a história do seu dinheiro com mais clareza.</p></div><div className="period"><label>Resumo de</label><select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{monthNames.map((item, index) => <option value={index} key={item}>{item} de {now.getFullYear()}</option>)}</select><button>+ Novo gasto</button></div></header>
      <section className="metrics">{[["Total gasto", "R$ 81,36"], ["Orçamento restante", "R$ 0,00"], ["Maior categoria", "Estudos"], ["Lançamentos", "3"]].map(([label, value]) => <article key={label}><small>{label}</small><h2>{value}</h2><p>{label === "Maior categoria" ? "R$ 50,00 no mês" : label === "Lançamentos" ? "lançamentos registrados" : "Acompanhe seu resumo mensal"}</p></article>)}</section>
      <section className="panel"><h2>Seu resumo financeiro</h2><div className="empty-state">Os dados de {monthNames[month].toLowerCase()} aparecerão aqui.</div></section>
    </main>
  </div>;
}

export default App;
