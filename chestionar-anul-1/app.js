"use strict";

// După publicarea scriptului Google Apps Script, lipește URL-ul /exec între ghilimele.
const API_URL = "";
const LOCAL_STORAGE_KEY = "chestionar-anul-1-demo-responses";

const scales = {
  importance6: [
    ["1", "Într-o măsură foarte mare"], ["2", "În mare măsură"],
    ["3", "Într-o măsură medie"], ["4", "În mică măsură"],
    ["5", "Într-o măsură foarte mică sau deloc"], ["6", "Nu știu / Nu răspund"]
  ],
  abroad5: [
    ["1", "Într-o măsură foarte mare"], ["2", "Într-o măsură mare"],
    ["3", "Într-o măsură mică"], ["4", "Într-o măsură foarte mică"],
    ["5", "Nu știu / Nu răspund / Nu este cazul"]
  ]
};

const sections = [
  {
    code: "S1", type: "single", name: "S1", title: "Specializarea",
    options: [["1", "Sociologie"], ["2", "Asistență Socială"], ["3", "Resurse Umane"]]
  },
  {
    code: "S2", type: "matrix", title: "Ți-ai fi dorit să fii student(ă) la altă universitate, facultate sau specializare?",
    help: "Alege un răspuns pe fiecare linie.", scale: [["1", "Da"], ["2", "Nu"]],
    items: [
      ["S2_U", "La altă universitate"],
      ["S2_S", "La altă specializare"]
    ]
  },
  {
    code: "S3", type: "matrix", title: "Cât de mult au contat următoarele pentru decizia de a te înscrie la această specializare și universitate?",
    help: "Alege un singur răspuns pe fiecare linie.", scale: scales.importance6,
    items: [
      ["S3_1", "Sfaturile părinților"],
      ["S3_2", "Opiniile colegilor și prietenilor"],
      ["S3_3", "Sfaturile profesorilor din liceu"],
      ["S3_4", "Mass-media: ziare, radio, televiziune"],
      ["S3_5", "Promovarea făcută de universitate în școli"],
      ["S3_6", "Știri și opinii găsite pe internet"],
      ["S3_7", "Opiniile unor prieteni care sunt sau au fost studenți la Universitatea din Oradea"],
      ["S3_8", "Recomandările primite la universitate cu ocazia admiterii"]
    ]
  },
  {
    code: "S4", type: "single", name: "S4", title: "Când te-ai hotărât să te înscrii la specializarea la care ești înscris(ă) acum?",
    options: [
      ["1", "Cu cel puțin un an înainte de admitere"], ["2", "Cu cel puțin jumătate de an înainte de admitere"],
      ["3", "Cu cel puțin o lună înainte de admitere"], ["4", "Cu o săptămână înainte de admitere"],
      ["5", "În perioada admiterii"], ["6", "Chiar la admitere"]
    ]
  },
  {
    code: "S5", type: "matrix", title: "Ce așteptări ai cu privire la programul de studiu sau specializarea la care ești acum în anul întâi?",
    help: "Arată în ce măsură ești de acord cu fiecare afirmație.", scale: scales.importance6,
    items: [
      ["S5_1", "Această specializare este exact ce mi-am dorit pentru pregătirea mea universitară"],
      ["S5_2", "Prin această specializare voi avea perspective bune de angajare"],
      ["S5_3", "Voi absolvi această specializare cu succes"],
      ["S5_4", "Am ales această specializare gândindu-mă mai ales la disciplina la care am fost foarte bun(ă) în liceu"],
      ["S5_5", "Îmi doresc să am rezultate bune la învățătură"]
    ]
  },
  {
    code: "S6", type: "matrix", title: "Cât de mult au contat următoarele aspecte pentru decizia de înscriere la facultate?",
    help: "Alege un singur răspuns pe fiecare linie.", scale: [
      ["1", "Foarte mult"], ["2", "Mult"], ["3", "Nici mult, nici puțin"],
      ["4", "Puțin"], ["5", "Puțin sau deloc"], ["6", "Nu știu / Nu răspund"]
    ],
    items: [
      ["S6_1", "Oradea este relativ aproape de casă"],
      ["S6_2", "Am intrat la facultate pe un loc bugetat"],
      ["S6_3", "Am primit cămin"],
      ["S6_4", "Obțin diploma în doar trei ani"],
      ["S6_5", "Sper să am timp să mai fac și altceva în timpul studiilor"]
    ]
  },
  {
    code: "S7", type: "matrix", title: "În ce măsură ai intenția de a pleca în străinătate în timpul facultății sau după finalizarea studiilor?",
    help: "Alege un singur răspuns pe fiecare linie.", scale: scales.abroad5,
    items: [
      ["S7_1", "În timpul facultății, cu o bursă de mobilitate"],
      ["S7_2", "În timpul facultății, pentru angajare sau afaceri"],
      ["S7_3", "După absolvire, pentru continuarea studiilor"],
      ["S7_4", "După finalizarea studiilor, pentru angajare sau afaceri"]
    ]
  },
  {
    code: "S8", type: "single", name: "S8", title: "La câte universități ți-ai depus dosarul la admitere?",
    options: [["1", "La o universitate"], ["2", "La două universități"], ["3", "La trei universități"], ["4", "La patru sau mai multe universități"]]
  },
  {
    code: "S9", type: "single", name: "S9", title: "La câte specializări ți-ai depus dosarul la admitere?",
    options: [["1", "La o specializare"], ["2", "La două specializări"], ["3", "La trei specializări"], ["4", "La patru sau mai multe specializări"]]
  },
  {
    code: "S10", type: "single", name: "S10", title: "În ce măsură cunoșteai, înainte de admitere, conținutul programului de studiu și al domeniului la care te-ai înscris?",
    options: [["4", "În foarte mare măsură"], ["3", "În mare măsură"], ["2", "În mică măsură"], ["1", "Foarte puțin sau deloc"], ["9", "Nu pot aprecia"]]
  },
  {
    code: "D1", type: "single", name: "SEX", title: "Sexul",
    options: [["1", "Masculin"], ["2", "Feminin"], ["9", "Prefer să nu răspund"]]
  },
  {
    code: "D2", type: "number", name: "BAC_YEAR", title: "În ce an ai promovat examenul de bacalaureat?",
    min: 1950, max: new Date().getFullYear()
  }
];

const variables = {};
sections.forEach(section => {
  if (section.type === "single") variables[section.name] = { code: section.code, title: section.title, options: section.options };
  else if (section.type === "number") variables[section.name] = { code: section.code, title: section.title, options: [], dynamic: true };
  else section.items.forEach(([name, label], index) => {
    variables[name] = { code: `${section.code}.${index + 1}`, title: label, options: section.scale };
  });
});

const form = document.getElementById("surveyForm");
const questionsEl = document.getElementById("questions");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");
const surveyPanel = document.getElementById("surveyPanel");
const successPanel = document.getElementById("successPanel");
let dashboardKey = "";
let dashboardData = null;

function academicYear(date = new Date()) {
  const year = date.getFullYear();
  const start = date.getMonth() >= 7 ? year : year - 1;
  return `${start}–${start + 1}`;
}

function optionMarkup(name, value, label, scale = false) {
  return `<label class="${scale ? "scale-option" : "option"}">
    <input type="radio" name="${name}" value="${value}" required>
    ${scale ? `<b>${value}</b><span>${label}</span>` : `<span>${label}</span>`}
  </label>`;
}

function renderSection(section) {
  const title = `<legend><span class="question-title"><span class="question-code">${section.code}</span><span>${section.title}</span></span></legend>`;
  const help = section.help ? `<p class="question-help">${section.help}</p>` : "";
  if (section.type === "single") {
    return `<fieldset class="question-card" data-section="${section.code}">${title}${help}<div class="options">${section.options.map(([value, label]) => optionMarkup(section.name, value, label)).join("")}</div></fieldset>`;
  }
  if (section.type === "number") {
    return `<fieldset class="question-card" data-section="${section.code}">${title}${help}<div class="number-field"><label for="${section.name}">Scrie anul folosind patru cifre</label><input id="${section.name}" type="number" name="${section.name}" min="${section.min}" max="${section.max}" step="1" inputmode="numeric" placeholder="De exemplu: ${section.max}" required></div></fieldset>`;
  }
  return `<fieldset class="question-card" data-section="${section.code}">${title}${help}${section.items.map(([name, label], index) => `
    <div class="subquestion" data-input-group="${name}">
      <h3>${section.code}.${index + 1}. ${label}</h3>
      <div class="scale-options">${section.scale.map(([value, scaleLabel]) => optionMarkup(name, value, scaleLabel, true)).join("")}</div>
    </div>`).join("")}</fieldset>`;
}

function renderSurvey() {
  questionsEl.innerHTML = sections.map(renderSection).join("");
  document.querySelectorAll("[data-cohort-label]").forEach(el => { el.textContent = academicYear(); });
  if (!API_URL) {
    const notice = document.getElementById("storageNotice");
    notice.hidden = false;
    notice.innerHTML = "<strong>Mod demonstrativ:</strong> până când este introdus URL-ul Google Apps Script, răspunsurile sunt păstrate numai în acest browser. Instrucțiunile de conectare sunt în fișierul README.";
  }
}

function updateProgress() {
  const requiredGroups = Object.keys(variables);
  const answered = requiredGroups.filter(hasAnswer).length;
  const consent = form.elements.consent.checked ? 1 : 0;
  const percent = Math.round(((answered + consent) / (requiredGroups.length + 1)) * 100);
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressLabel").textContent = `${percent}%`;
  document.getElementById("progressDetail").textContent = answered === requiredGroups.length
    ? "Toate întrebările au răspuns. Confirmă acordul și trimite formularul."
    : `${answered} din ${requiredGroups.length} răspunsuri completate.`;
  formStatus.textContent = "";
  document.querySelectorAll(".question-card.invalid").forEach(card => card.classList.remove("invalid"));
}

function hasAnswer(name) {
  const checked = form.querySelector(`input[name="${name}"]:checked`);
  if (checked) return true;
  const field = form.elements[name];
  return Boolean(field && field.type !== "radio" && String(field.value).trim());
}

function collectResponse() {
  const data = new FormData(form);
  const response = {
    submissionId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    clientTimestamp: new Date().toISOString(),
    cohort: academicYear()
  };
  Object.keys(variables).forEach(name => { response[name] = data.get(name); });
  return response;
}

function validateForm() {
  const missing = Object.keys(variables).filter(name => !hasAnswer(name));
  document.querySelectorAll(".question-card").forEach(card => card.classList.remove("invalid"));
  missing.forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input) input.closest(".question-card").classList.add("invalid");
  });
  if (missing.length) {
    formStatus.textContent = `Mai sunt ${missing.length} răspunsuri de completat.`;
    const first = form.querySelector(`[name="${missing[0]}"]`);
    first.closest(".question-card").scrollIntoView({ behavior: "smooth", block: "center" });
    first.focus({ preventScroll: true });
    return false;
  }
  if (!form.elements.consent.checked) {
    formStatus.textContent = "Este necesar acordul pentru înregistrarea răspunsului.";
    form.elements.consent.focus();
    return false;
  }
  const bacYear = Number(form.elements.BAC_YEAR.value);
  if (!Number.isInteger(bacYear) || bacYear < 1950 || bacYear > new Date().getFullYear()) {
    const card = form.elements.BAC_YEAR.closest(".question-card");
    card.classList.add("invalid");
    formStatus.textContent = `Anul bacalaureatului trebuie să fie între 1950 și ${new Date().getFullYear()}.`;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    form.elements.BAC_YEAR.focus({ preventScroll: true });
    return false;
  }
  return true;
}

async function saveResponse(response) {
  if (!API_URL) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    saved.push({ ...response, serverTimestamp: new Date().toISOString() });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));
    return { ok: true, mode: "demo", timestamp: new Date().toISOString() };
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(response),
    redirect: "follow"
  });
  if (!res.ok) throw new Error("Serverul nu a acceptat răspunsul.");
  const result = await res.json();
  if (!result.ok) throw new Error(result.error || "Răspunsul nu a putut fi salvat.");
  return result;
}

form.addEventListener("change", updateProgress);
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (form.elements.website.value || !validateForm()) return;
  submitButton.disabled = true;
  submitButton.textContent = "Se înregistrează…";
  try {
    const result = await saveResponse(collectResponse());
    surveyPanel.hidden = true;
    successPanel.hidden = false;
    const savedAt = new Date(result.timestamp || Date.now());
    document.getElementById("successTimestamp").textContent = `Răspunsul a fost înregistrat la ${savedAt.toLocaleString("ro-RO")} ${result.mode === "demo" ? "în modul demonstrativ local." : "."}`;
    successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    formStatus.textContent = `${error.message} Răspunsurile au rămas în formular; încearcă din nou.`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Trimite răspunsurile";
  }
});

document.getElementById("newResponseButton").addEventListener("click", () => {
  form.reset();
  successPanel.hidden = true;
  surveyPanel.hidden = false;
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function switchView() {
  const dashboard = location.hash === "#dashboard";
  document.getElementById("surveyView").hidden = dashboard;
  document.getElementById("dashboardView").hidden = !dashboard;
  document.querySelectorAll("[data-view-link]").forEach(link => {
    link.classList.toggle("active", (link.dataset.viewLink === "dashboard") === dashboard);
  });
  if (dashboard && !API_URL) loadDashboard();
  window.scrollTo({ top: 0 });
}

function aggregateLocal(cohort = "") {
  const rows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  const allCohorts = {};
  rows.forEach(row => { allCohorts[row.cohort] = (allCohorts[row.cohort] || 0) + 1; });
  const filtered = cohort ? rows.filter(row => row.cohort === cohort) : rows;
  const aggregate = {};
  Object.entries(variables).forEach(([name, variable]) => {
    const counts = {};
    variable.options.forEach(([value]) => { counts[value] = 0; });
    filtered.forEach(row => {
      if (row[name] == null || row[name] === "") return;
      if (variable.dynamic && counts[row[name]] == null) counts[row[name]] = 0;
      if (counts[row[name]] != null) counts[row[name]] += 1;
    });
    aggregate[name] = { counts };
  });
  const latest = filtered.map(row => row.serverTimestamp || row.clientTimestamp).sort().at(-1) || null;
  return { ok: true, total: filtered.length, latest, cohorts: allCohorts, variables: aggregate, mode: "demo" };
}

async function fetchDashboard(cohort = "") {
  if (!API_URL) return aggregateLocal(cohort);
  const url = new URL(API_URL);
  url.searchParams.set("action", "dashboard");
  url.searchParams.set("key", dashboardKey);
  if (cohort) url.searchParams.set("cohort", cohort);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error("Dashboardul nu a putut fi încărcat.");
  const result = await res.json();
  if (!result.ok) throw new Error(result.error || "Cheia este greșită sau datele nu sunt disponibile.");
  return result;
}

function populateFilters(data) {
  const cohortFilter = document.getElementById("cohortFilter");
  const currentCohort = cohortFilter.value;
  cohortFilter.innerHTML = `<option value="">Toți anii</option>${Object.keys(data.cohorts || {}).sort().reverse().map(cohort => `<option value="${cohort}">${cohort}</option>`).join("")}`;
  cohortFilter.value = currentCohort;
  const variableFilter = document.getElementById("variableFilter");
  if (!variableFilter.options.length) {
    variableFilter.innerHTML = Object.entries(variables).map(([name, variable]) => `<option value="${name}">${variable.code} · ${variable.title}</option>`).join("");
  }
}

function renderChart(variableName) {
  const variable = variables[variableName];
  const result = dashboardData.variables[variableName] || { counts: {} };
  const chartOptions = variable.dynamic
    ? Object.keys(result.counts || {}).sort((a, b) => Number(b) - Number(a)).map(value => [value, value])
    : variable.options;
  const rows = chartOptions.map(([value, label]) => [label, Number(result.counts[value] || 0)]);
  const total = rows.reduce((sum, [, count]) => sum + count, 0);
  document.getElementById("chartCode").textContent = variable.code;
  document.getElementById("chartTitle").textContent = variable.title;
  document.getElementById("chartN").textContent = `N = ${total}`;
  const chart = document.getElementById("barChart");
  chart.innerHTML = rows.map(([label, count]) => {
    const percent = total ? (count / total) * 100 : 0;
    return `<div class="bar-row"><div class="bar-label">${label}</div><div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div><div class="bar-value">${count} · ${percent.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%</div></div>`;
  }).join("");
  document.getElementById("chartEmpty").hidden = total > 0;
  chart.hidden = total === 0;
  chart.setAttribute("aria-label", `${variable.title}. ${rows.map(([label, count]) => `${label}: ${count}`).join("; ")}`);
}

function renderDashboard(data) {
  dashboardData = data;
  populateFilters(data);
  document.getElementById("dashboardLogin").hidden = true;
  document.getElementById("dashboardContent").hidden = false;
  document.getElementById("responseCount").textContent = Number(data.total || 0).toLocaleString("ro-RO");
  const cohort = document.getElementById("cohortFilter").value;
  document.getElementById("responseScope").textContent = cohort || "Toți anii";
  document.getElementById("latestResponse").textContent = data.latest ? new Date(data.latest).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "—";
  document.getElementById("cohortCount").textContent = Object.keys(data.cohorts || {}).length;
  document.getElementById("cohortTable").innerHTML = `<table class="cohort-table"><thead><tr><th>An universitar</th><th>Răspunsuri</th></tr></thead><tbody>${Object.entries(data.cohorts || {}).sort(([a], [b]) => b.localeCompare(a)).map(([name, count]) => `<tr><td>${name}</td><td>${Number(count).toLocaleString("ro-RO")}</td></tr>`).join("") || `<tr><td colspan="2">Nu există încă răspunsuri.</td></tr>`}</tbody></table>`;
  renderChart(document.getElementById("variableFilter").value || Object.keys(variables)[0]);
}

async function loadDashboard() {
  const status = document.getElementById("dashboardLoginStatus");
  status.textContent = "Se încarcă…";
  try {
    const data = await fetchDashboard(document.getElementById("cohortFilter").value);
    renderDashboard(data);
    status.textContent = "";
  } catch (error) {
    document.getElementById("dashboardLogin").hidden = false;
    document.getElementById("dashboardContent").hidden = true;
    status.textContent = error.message;
  }
}

document.getElementById("dashboardLoginForm").addEventListener("submit", event => {
  event.preventDefault();
  dashboardKey = document.getElementById("dashboardKey").value;
  loadDashboard();
});
document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);
document.getElementById("cohortFilter").addEventListener("change", loadDashboard);
document.getElementById("variableFilter").addEventListener("change", event => renderChart(event.target.value));
window.addEventListener("hashchange", switchView);

renderSurvey();
updateProgress();
switchView();
