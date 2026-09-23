"use strict";

const SVG_NS = "http://www.w3.org/2000/svg";

const byId = (id) => document.getElementById(id);

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "pass") return "status-pass";
  if (value === "fail") return "status-fail";
  return "status-observed";
}

function createBadge(status, label = status) {
  const element = document.createElement("span");
  element.className = `badge ${statusClass(status)}`;
  element.textContent = label;
  return element;
}

function clear(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function metricCard(value, label) {
  const card = document.createElement("article");
  card.className = "metric-card";
  const number = document.createElement("span");
  number.className = "metric-value";
  number.textContent = String(value);
  const text = document.createElement("span");
  text.className = "metric-label";
  text.textContent = label;
  card.append(number, text);
  return card;
}

function renderMetrics(metrics) {
  const grid = byId("metric-grid");
  clear(grid);
  const values = [
    [metrics.scenariosPassed, "Scenarios passed"],
    [metrics.validationChecks, "Validation checks"],
    [metrics.designChecks, "Design checks"],
    [metrics.evidenceItems, "Evidence links"],
  ];
  values.forEach(([value, label]) => grid.append(metricCard(value, label)));
}

function renderEnvironment(items) {
  const grid = byId("environment-grid");
  clear(grid);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "environment-card";
    const copy = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = item.name;
    const detail = document.createElement("p");
    detail.textContent = item.value;
    copy.append(heading, detail);
    card.append(copy, createBadge(item.status));
    grid.append(card);
  });
}

function renderTimeline(items) {
  const timeline = byId("phase-timeline");
  clear(timeline);
  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = "phase-card";
    const number = document.createElement("span");
    number.className = "phase-number";
    number.textContent = item.phase;
    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const detail = document.createElement("p");
    detail.textContent = item.detail;
    row.append(number, heading, detail);
    timeline.append(row);
  });
}

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}

function renderArchitecture(architecture) {
  const svg = byId("architecture-svg");
  clear(svg);
  svg.setAttribute("viewBox", architecture.viewBox || "0 0 1120 620");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const title = svgElement("title", { id: "diagram-title" });
  title.textContent = "NetTrace local connection and trust-boundary diagram";
  const description = svgElement("desc", { id: "diagram-description" });
  description.textContent = "Windows host connects to Ubuntu WSL2 and loopback test services. External traffic is disabled by default, and sanitized evidence remains inside the local trust boundary.";
  svg.append(title, description);

  const defs = svgElement("defs");
  ["trusted", "local", "evidence", "blocked"].forEach((kind) => {
    const marker = svgElement("marker", {
      id: `arrow-${kind}`,
      markerWidth: 10,
      markerHeight: 10,
      refX: 8,
      refY: 3,
      orient: "auto",
      markerUnits: "strokeWidth",
    });
    const arrow = svgElement("path", { d: "M0,0 L0,6 L9,3 z", class: `arrow-${kind}` });
    marker.append(arrow);
    defs.append(marker);
  });
  svg.append(defs);

  architecture.boundaries.forEach((boundary) => {
    const rect = svgElement("rect", {
      x: boundary.x,
      y: boundary.y,
      width: boundary.width,
      height: boundary.height,
      class: `diagram-boundary ${boundary.kind}`,
    });
    const label = svgElement("text", {
      x: boundary.x + 18,
      y: boundary.y + 27,
      class: "boundary-label",
    });
    label.textContent = boundary.label;
    svg.append(rect, label);
  });

  const nodes = new Map(architecture.nodes.map((node) => [node.id, node]));
  architecture.edges.forEach((edge) => {
    const source = nodes.get(edge.from);
    const target = nodes.get(edge.to);
    if (!source || !target) return;
    const leftToRight = source.x < target.x;
    const startX = leftToRight ? source.x + source.width : source.x + source.width / 2;
    const startY = source.y + source.height / 2;
    const endX = leftToRight ? target.x : target.x + target.width / 2;
    const endY = target.y + target.height / 2;
    const middleX = (startX + endX) / 2;
    const path = svgElement("path", {
      d: `M ${startX} ${startY} C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}`,
      class: `diagram-edge ${edge.kind}`,
      "marker-end": `url(#arrow-${edge.kind})`,
    });
    const label = svgElement("text", {
      x: middleX,
      y: (startY + endY) / 2 - 8,
      "text-anchor": "middle",
      class: "edge-label",
    });
    label.textContent = edge.label;
    svg.append(path, label);
  });

  architecture.nodes.forEach((node) => {
    const group = svgElement("g", { class: `diagram-node ${node.kind}` });
    const rect = svgElement("rect", { x: node.x, y: node.y, width: node.width, height: node.height });
    const titleText = svgElement("text", {
      x: node.x + node.width / 2,
      y: node.y + 31,
      "text-anchor": "middle",
      class: "node-title",
    });
    titleText.textContent = node.label;
    group.append(rect, titleText);
    (node.detail || []).forEach((line, index) => {
      const detail = svgElement("text", {
        x: node.x + node.width / 2,
        y: node.y + 58 + index * 20,
        "text-anchor": "middle",
        class: "node-detail",
      });
      detail.textContent = line;
      group.append(detail);
    });
    svg.append(group);
  });
}

function renderDesignChecks(items) {
  const list = byId("design-checks");
  clear(list);
  items.forEach((item) => {
    const row = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "check-icon";
    icon.textContent = item.status === "PASS" ? "✓" : "!";
    const copy = document.createElement("span");
    const heading = document.createElement("strong");
    heading.textContent = item.name;
    const detail = document.createElement("small");
    detail.textContent = item.detail;
    copy.append(heading, detail);
    row.append(icon, copy);
    list.append(row);
  });
}

function renderScenarios(items) {
  const grid = byId("scenario-grid");
  clear(grid);
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "scenario-card";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `Scenario ${index + 1}`;
    const heading = document.createElement("h3");
    heading.textContent = item.scenario;
    const symptom = document.createElement("p");
    symptom.textContent = item.symptom || "Controlled local failure.";
    const rootCause = document.createElement("p");
    rootCause.textContent = `Root cause: ${item.root_cause || "Documented in the support ticket."}`;
    const states = document.createElement("div");
    states.className = "scenario-state";
    states.append(
      createBadge(item.status),
      createBadge(item.failure_reproduced ? "PASS" : "FAIL", "Failure reproduced"),
      createBadge(item.repaired ? "PASS" : "FAIL", "Recovery verified")
    );
    card.append(eyebrow, heading, symptom, rootCause, states);
    grid.append(card);
  });
}

function renderValidation(items) {
  const table = byId("validation-table");
  clear(table);
  items.forEach((item) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = item.name;
    const detail = document.createElement("td");
    detail.textContent = item.detail;
    const status = document.createElement("td");
    status.append(createBadge(item.status));
    row.append(name, detail, status);
    table.append(row);
  });
}

function renderEvidence(items) {
  const grid = byId("evidence-grid");
  clear(grid);
  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "evidence-card";
    link.href = item.href;
    const type = document.createElement("span");
    type.className = "evidence-type";
    type.textContent = item.type;
    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const arrow = document.createElement("span");
    arrow.textContent = "Open artifact →";
    link.append(type, heading, arrow);
    grid.append(link);
  });
}

function renderSources(items) {
  const list = byId("source-list");
  clear(list);
  items.forEach((item) => {
    const row = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = item.title;
    row.append(link);
    list.append(row);
  });
}

function render(data) {
  byId("project-name").textContent = data.project.name;
  byId("project-subtitle").textContent = data.project.subtitle;
  byId("project-scope").textContent = data.project.scope;
  byId("branch-value").textContent = data.project.branch;
  byId("commit-value").textContent = data.generatedFromCommit;
  byId("generated-value").textContent = new Date(data.generatedAt).toLocaleString();

  const status = byId("overall-status");
  status.className = `status-pill ${statusClass(data.project.status)}`;
  status.textContent = `Overall ${data.project.status}`;

  const totalChecks = data.validation.length + data.designChecks.length + data.scenarios.length;
  const passedChecks = [
    ...data.validation,
    ...data.designChecks,
    ...data.scenarios,
  ].filter((item) => item.status === "PASS").length;
  const percentage = totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0;
  byId("completion-meter-fill").style.width = `${percentage}%`;
  byId("completion-label").textContent = `${passedChecks} of ${totalChecks} gates passed (${percentage}%)`;

  renderMetrics(data.metrics);
  renderEnvironment(data.environment);
  renderTimeline(data.timeline);
  renderArchitecture(data.architecture);
  renderDesignChecks(data.designChecks);
  renderScenarios(data.scenarios);
  renderValidation(data.validation);
  renderEvidence(data.evidence);
  renderSources(data.researchSources);
}

function showError(error) {
  byId("error-panel").hidden = false;
  byId("error-message").textContent = error instanceof Error ? error.message : String(error);
  const status = byId("overall-status");
  status.className = "status-pill status-fail";
  status.textContent = "Load failed";
}

async function loadDashboard() {
  try {
    const response = await fetch(`data/lab-results.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} while loading dashboard data`);
    const data = await response.json();
    render(data);
  } catch (error) {
    showError(error);
  }
}

byId("print-button").addEventListener("click", () => window.print());
byId("theme-button").addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("nettrace-theme", next);
});

const savedTheme = localStorage.getItem("nettrace-theme");
if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;

loadDashboard();
