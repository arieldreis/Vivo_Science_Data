const DADOS = [
  { id: 301, transportadora: "RotaMax", regiao: "Sudeste", prazo: 3, real: 7 },
  { id: 302, transportadora: "ViaCargo", regiao: "Sul", prazo: 5, real: 5 },
  {
    id: 303,
    transportadora: "FlashLog",
    regiao: "Nordeste",
    prazo: 4,
    real: 9,
  },
  { id: 304, transportadora: "RotaMax", regiao: "Norte", prazo: 6, real: 4 },
  {
    id: 305,
    transportadora: "ViaCargo",
    regiao: "Centro-Oeste",
    prazo: 2,
    real: 6,
  },
  { id: 306, transportadora: "FlashLog", regiao: "Sul", prazo: 5, real: 12 },
  { id: 307, transportadora: "RotaMax", regiao: "Sul", prazo: 6, real: 9 },
  { id: 308, transportadora: "ViaCargo", regiao: "Sudeste", prazo: 3, real: 4 },
  { id: 309, transportadora: "FlashLog", regiao: "Norte", prazo: 5, real: 5 },
  {
    id: 310,
    transportadora: "ViaCargo",
    regiao: "Nordeste",
    prazo: 4,
    real: 8,
  },
];

const CORES_T = {
  RotaMax: "#818cf8",
  ViaCargo: "#38bdf8",
  FlashLog: "#fb7185",
};
const CORES_R = {
  Sudeste: "#a78bfa",
  Sul: "#34d399",
  Nordeste: "#f59e0b",
  Norte: "#60a5fa",
  "Centro-Oeste": "#f472b6",
};

function status(d) {
  return d.real > d.prazo ? "atrasado" : "no-prazo";
}
function excesso(d) {
  return Math.max(0, d.real - d.prazo);
}

function filtrar() {
  const t = document.getElementById("filtro-transportadora").value;
  const r = document.getElementById("filtro-regiao").value;
  const s = document.getElementById("filtro-status").value;
  return DADOS.filter(
    (d) =>
      (t === "todas" || d.transportadora === t) &&
      (r === "todas" || d.regiao === r) &&
      (s === "todos" || status(d) === s),
  );
}

function aplicarFiltros() {
  const dados = filtrar();
  renderKPIs(dados);
  renderBarras(dados);
  renderRanking(dados);
  renderTabela(dados);
  renderAlerta(dados);
}

function renderKPIs(dados) {
  const total = dados.length;
  const atrasadas = dados.filter((d) => status(d) === "atrasado");
  const noPrazo = dados.filter((d) => status(d) === "no-prazo");
  const excessos = atrasadas.map(excesso);
  const mediaAtraso = excessos.length
    ? (excessos.reduce((a, b) => a + b, 0) / excessos.length).toFixed(1)
    : "0.0";

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-atrasadas").textContent = atrasadas.length;
  document.getElementById("kpi-prazo").textContent = noPrazo.length;
  document.getElementById("kpi-atraso-medio").textContent = mediaAtraso + "d";
  document.getElementById("kpi-pct-atraso").textContent = total
    ? Math.round((atrasadas.length / total) * 100) + "% do total"
    : "—";
  document.getElementById("kpi-pct-prazo").textContent = total
    ? Math.round((noPrazo.length / total) * 100) + "% do total"
    : "—";
}

function renderBarras(dados) {
  // por transportadora
  const byT = {};
  const totalByT = {};
  dados.forEach((d) => {
    if (!byT[d.transportadora]) {
      byT[d.transportadora] = 0;
      totalByT[d.transportadora] = 0;
    }
    totalByT[d.transportadora]++;
    if (status(d) === "atrasado") byT[d.transportadora]++;
  });
  const maxT = Math.max(...Object.values(totalByT), 1);
  const elT = document.getElementById("bar-transportadora");
  elT.innerHTML = Object.entries(totalByT)
    .sort((a, b) => b[1] - a[1])
    .map(([name, tot]) => {
      const atr = byT[name] || 0;
      const pct = Math.round((atr / tot) * 100);
      const w = Math.round((tot / maxT) * 100);
      return `<div class="bar-item">
      <div class="bar-meta">
        <span class="name">${name}</span>
        <span class="val">${atr}/${tot} atrasadas (${pct}%)</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${w}%;background:${CORES_T[name] || "#888"}"></div>
      </div>
    </div>`;
    })
    .join("");

  // por região
  const byR = {};
  const totalByR = {};
  dados.forEach((d) => {
    if (!byR[d.regiao]) {
      byR[d.regiao] = 0;
      totalByR[d.regiao] = 0;
    }
    totalByR[d.regiao]++;
    if (status(d) === "atrasado") byR[d.regiao]++;
  });
  const maxR = Math.max(...Object.values(totalByR), 1);
  const elR = document.getElementById("bar-regiao");
  elR.innerHTML = Object.entries(totalByR)
    .sort((a, b) => b[1] - a[1])
    .map(([name, tot]) => {
      const atr = byR[name] || 0;
      const pct = Math.round((atr / tot) * 100);
      const w = Math.round((tot / maxR) * 100);
      return `<div class="bar-item">
      <div class="bar-meta">
        <span class="name">${name}</span>
        <span class="val">${atr}/${tot} atrasadas (${pct}%)</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${w}%;background:${CORES_R[name] || "#888"}"></div>
      </div>
    </div>`;
    })
    .join("");
}

function renderRanking(dados) {
  const atrasadas = dados
    .filter((d) => status(d) === "atrasado")
    .sort((a, b) => excesso(b) - excesso(a))
    .slice(0, 5);

  const el = document.getElementById("rank-critico");
  if (!atrasadas.length) {
    el.innerHTML =
      '<div style="color:var(--muted);font-size:13px;">Nenhuma entrega atrasada na seleção.</div>';
    return;
  }
  el.innerHTML = atrasadas
    .map((d, i) => {
      const cls = i === 0 ? "r1" : i === 1 ? "r2" : "r3";
      return `<div class="rank-item ${cls}">
      <div class="rank-num">#${i + 1}</div>
      <div class="rank-name">Entrega ${d.id}<br>
        <span style="font-size:11px;color:var(--muted)">${d.transportadora} · ${d.regiao}</span>
      </div>
      <div class="rank-val">+${excesso(d)}d</div>
    </div>`;
    })
    .join("");
}

function renderTabela(dados) {
  const sorted = [...dados].sort((a, b) => excesso(b) - excesso(a));
  const tbody = document.getElementById("tabela-body");
  tbody.innerHTML = sorted
    .map((d) => {
      const st = status(d);
      const ex = excesso(d);
      const tagClass = "tag-" + d.transportadora.toLowerCase();
      const badgeClass =
        st === "atrasado" ? (ex >= 5 ? "critico" : "atrasado") : "no-prazo";
      const badgeLabel =
        st === "atrasado" ? (ex >= 5 ? "⚠ Crítico" : "Atrasado") : "✓ No Prazo";
      return `<tr>
      <td style="font-family:var(--mono);font-size:12px;color:var(--muted)">${d.id}</td>
      <td><span class="tag-transportadora ${tagClass}">${d.transportadora}</span></td>
      <td style="font-size:13px">${d.regiao}</td>
      <td style="font-family:var(--mono);text-align:center">${d.prazo}</td>
      <td style="font-family:var(--mono);text-align:center">${d.real}</td>
      <td style="font-family:var(--mono);text-align:center;color:${ex > 0 ? "var(--danger)" : "var(--ok)"};font-weight:600">
        ${ex > 0 ? "+" + ex + " d" : "—"}
      </td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
    </tr>`;
    })
    .join("");
}

function renderAlerta(dados) {
  const atrasadas = dados.filter((d) => status(d) === "atrasado");
  const criticas = atrasadas.filter((d) => excesso(d) >= 5);
  const strip = document.getElementById("alert-strip");
  const txt = document.getElementById("alert-text");

  if (!atrasadas.length) {
    strip.style.display = "none";
    return;
  }
  strip.style.display = "flex";

  let msg = `<strong>${atrasadas.length} entrega(s) atrasada(s)</strong> na seleção atual.`;
  if (criticas.length) {
    const ids = criticas.map((d) => `<strong>#${d.id}</strong>`).join(", ");
    msg += ` ${criticas.length} delas são <strong>críticas</strong> (≥5 dias de excesso): ${ids}.`;
  }
  // pior transportadora
  const byT = {};
  atrasadas.forEach((d) => {
    byT[d.transportadora] = (byT[d.transportadora] || 0) + 1;
  });
  const piorT = Object.entries(byT).sort((a, b) => b[1] - a[1])[0];
  if (piorT)
    msg += ` Transportadora com mais atrasos: <strong>${piorT[0]}</strong> (${piorT[1]}).`;

  txt.innerHTML = msg;
}

// Relógio
function tick() {
  const n = new Date();
  document.getElementById("clock").textContent =
    n.toLocaleDateString("pt-BR") + " " + n.toLocaleTimeString("pt-BR");
}
tick();
setInterval(tick, 1000);

// Boot
aplicarFiltros();
