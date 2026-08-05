const STATUS_LABELS = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  hold: "Hold",
};

const PATH_LABELS = {
  done: "Done",
  in_progress: "In progress",
  at_risk: "At risk",
  not_started: "Not started",
  na: "N/A",
};

const grid = document.getElementById("card-grid");
const detail = document.getElementById("detail");
const detailBody = document.getElementById("detail-body");
const detailClose = document.getElementById("detail-close");
const portfolioUpdated = document.getElementById("portfolio-updated");
const heroLede = document.getElementById("hero-lede");

let projects = [];
let selectedId = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusPill(status) {
  const key = STATUS_LABELS[status] ? status : "hold";
  return `<span class="status-pill ${key}">${STATUS_LABELS[key]}</span>`;
}

function dimChip(label, status) {
  const key = STATUS_LABELS[status] ? status : "hold";
  return `<span class="dim-chip"><span class="rag rag-${key}" aria-hidden="true"></span>${escapeHtml(label)}</span>`;
}

function pathStatus(status) {
  const key = PATH_LABELS[status] ? status : "not_started";
  return `<span class="path-status ${key}">${PATH_LABELS[key]}</span>`;
}

function renderCards() {
  grid.innerHTML = projects
    .map((project) => {
      const selected = project.id === selectedId ? " is-selected" : "";
      const date = project.eventDateLabel || formatDate(project.eventDate) || "Date TBD";
      return `
        <button
          type="button"
          class="project-card${selected}"
          role="listitem"
          data-id="${escapeHtml(project.id)}"
          aria-pressed="${project.id === selectedId ? "true" : "false"}"
        >
          <div class="card-top">
            <div>
              <p class="card-eyebrow">${escapeHtml(project.season || "")}</p>
              <h3 class="card-title">${escapeHtml(project.name)}</h3>
            </div>
            ${statusPill(project.overall)}
          </div>
          <p class="card-date">${escapeHtml(date)}</p>
          <p class="card-summary">${escapeHtml(project.summary)}</p>
          <div class="card-dims" aria-label="Dimension statuses">
            ${dimChip("Finance", project.finance?.status)}
            ${dimChip("Staffing", project.staffing?.status)}
            ${dimChip("Critical path", criticalPathAggregate(project))}
          </div>
        </button>
      `;
    })
    .join("");
}

function criticalPathAggregate(project) {
  const items = project.criticalPath || [];
  if (items.some((item) => item.status === "at_risk")) return "red";
  if (items.some((item) => item.status === "not_started" || item.status === "in_progress")) {
    return project.overall === "red" ? "red" : "yellow";
  }
  if (items.length && items.every((item) => item.status === "done" || item.status === "na")) {
    return "green";
  }
  return project.overall || "hold";
}

function seatList(title, items) {
  if (!items?.length) return "";
  return `
    <div>
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderDetail(project) {
  if (!project) {
    detail.hidden = true;
    detailBody.innerHTML = "";
    return;
  }

  const date = project.eventDateLabel || formatDate(project.eventDate) || "Date TBD";
  const nextGate = project.nextGate?.label
    ? `<div class="next-gate"><strong>Next gate</strong>${escapeHtml(project.nextGate.label)}${
        project.nextGate.date ? ` · ${escapeHtml(formatDate(project.nextGate.date))}` : ""
      }</div>`
    : "";

  const links = (project.links || [])
    .filter((link) => link.url && /^https?:\/\//i.test(link.url))
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(link.label || link.url)}</a>`
    )
    .join("");

  const pathItems = (project.criticalPath || [])
    .map(
      (item) => `
        <li class="path-item">
          ${pathStatus(item.status)}
          <span class="path-label">${escapeHtml(item.label)}</span>
        </li>
      `
    )
    .join("");

  detailBody.innerHTML = `
    <header class="detail-header">
      <p class="card-eyebrow">${escapeHtml(project.season || "")}</p>
      <h2>${escapeHtml(project.name)} ${statusPill(project.overall)}</h2>
      <p class="detail-meta">${escapeHtml(date)}</p>
      <p class="detail-summary">${escapeHtml(project.summary)}</p>
      ${nextGate}
    </header>

    <div class="dim-grid">
      <article class="dim-card">
        <h3>Finance ${statusPill(project.finance?.status)}</h3>
        <p class="gate-label">${escapeHtml(project.finance?.gate || "Gate")}</p>
        <p>${escapeHtml(project.finance?.note || "")}</p>
      </article>
      <article class="dim-card">
        <h3>Staffing ${statusPill(project.staffing?.status)}</h3>
        <p>${escapeHtml(project.staffing?.note || "")}</p>
        <div class="seat-lists">
          ${seatList("Filled / named", project.staffing?.filled)}
          ${seatList("Open", project.staffing?.open)}
        </div>
      </article>
    </div>

    <section class="critical-path" aria-labelledby="critical-path-title">
      <h3 id="critical-path-title">Critical path</h3>
      <ul class="path-list">${pathItems}</ul>
    </section>

    ${links ? `<div class="detail-links">${links}</div>` : ""}
    <p class="detail-updated">Project updated ${escapeHtml(formatDate(project.lastUpdated) || project.lastUpdated || "—")}</p>
  `;

  detail.hidden = false;
}

function selectProject(id, { scroll = true } = {}) {
  selectedId = id;
  const project = projects.find((item) => item.id === id) || null;
  renderCards();
  renderDetail(project);
  if (scroll && project) {
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (project) {
    history.replaceState(null, "", `#${project.id}`);
  } else {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function bindEvents() {
  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    const id = card.dataset.id;
    if (id === selectedId) {
      selectProject(null, { scroll: false });
      return;
    }
    selectProject(id);
  });

  detailClose.addEventListener("click", () => {
    selectProject(null, { scroll: false });
  });
}

async function init() {
  try {
    const res = await fetch("./data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
    const data = await res.json();
    projects = Array.isArray(data.projects) ? data.projects : [];

    if (data.subtitle && heroLede) {
      heroLede.textContent = data.subtitle;
    }

    if (data.updated) {
      portfolioUpdated.hidden = false;
      portfolioUpdated.textContent = `Updated ${formatDate(data.updated)}`;
    }

    bindEvents();
    renderCards();

    const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (hashId && projects.some((project) => project.id === hashId)) {
      selectProject(hashId, { scroll: true });
    }
  } catch (error) {
    grid.innerHTML = `<div class="error-banner" role="alert">Could not load project data. ${escapeHtml(error.message)}</div>`;
  }
}

init();
