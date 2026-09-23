"use strict";

const resultFile = document.getElementById("result-file");
const resultsSection = document.getElementById("device-results");
const errorPanel = document.getElementById("device-error");
const errorMessage = document.getElementById("device-error-message");
const browserConsent = document.getElementById("browser-consent");
const runBrowserCheck = document.getElementById("run-browser-check");
const browserResults = document.getElementById("browser-diagnostic-results");
let browserDiagnosticData = null;

function clear(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pass") return "status-pass";
  if (normalized === "fail") return "status-fail";
  return "status-observed";
}

function badge(status, text = status) {
  const element = document.createElement("span");
  element.className = `badge ${statusClass(status)}`;
  element.textContent = text;
  return element;
}

function metric(value, label) {
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

function validate(data) {
  if (!data || data.schemaVersion !== "nettrace-device-check-v1") throw new Error("This is not a supported NetTrace device-check result.");
  if (data.consent !== true) throw new Error("The result does not record device-owner consent.");
  if (!Array.isArray(data.checks) || data.checks.length < 5) throw new Error("The result is missing required checks.");
  if (!data.privacy || data.privacy.uploaded !== false || data.privacy.publicNetworkContacted !== false || data.privacy.settingsChanged !== false) {
    throw new Error("The result does not satisfy the NetTrace privacy contract.");
  }
}

function render(data) {
  validate(data);
  errorPanel.hidden = true;
  resultsSection.hidden = false;

  const overall = document.getElementById("device-overall-status");
  overall.className = `status-pill ${statusClass(data.overallStatus)}`;
  overall.textContent = `Overall ${data.overallStatus}`;

  const metrics = document.getElementById("device-metrics");
  clear(metrics);
  metrics.append(
    metric(data.summary.passed, "Passed"),
    metric(data.summary.warnings, "Warnings"),
    metric(data.summary.failed, "Failed"),
    metric(data.checks.length, "Checks run")
  );

  const environment = document.getElementById("device-environment");
  clear(environment);
  (data.environment || []).forEach((item) => {
    const card = document.createElement("article");
    card.className = "environment-card";
    const copy = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = item.name;
    const value = document.createElement("p");
    value.textContent = item.value;
    copy.append(heading, value);
    card.append(copy, badge(item.status));
    environment.append(card);
  });

  const table = document.getElementById("device-check-table");
  clear(table);
  data.checks.forEach((item) => {
    const row = document.createElement("tr");
    for (const value of [item.name, item.category]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    const status = document.createElement("td");
    status.append(badge(item.status));
    const detail = document.createElement("td");
    detail.textContent = item.detail;
    row.append(status, detail);
    table.append(row);
  });

  const privacy = document.getElementById("device-privacy-list");
  clear(privacy);
  const labels = {
    uploaded: "No data uploaded",
    publicNetworkContacted: "No public network contacted",
    settingsChanged: "No settings changed",
    usernameStored: "No username stored",
    hostnameStored: "No hostname stored",
    networkAddressesStored: "No network addresses stored",
    credentialsOrFilesCollected: "No credentials or personal files collected",
  };
  Object.entries(labels).forEach(([key, label]) => {
    const passed = data.privacy[key] === false;
    const row = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "check-icon";
    icon.textContent = passed ? "✓" : "!";
    const text = document.createElement("strong");
    text.textContent = label;
    row.append(icon, text);
    privacy.append(row);
  });
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showError(error) {
  resultsSection.hidden = true;
  errorPanel.hidden = false;
  errorMessage.textContent = error instanceof Error ? error.message : String(error);
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return "Unavailable";
  const gib = value / (1024 ** 3);
  return `${gib.toFixed(gib >= 10 ? 0 : 1)} GiB`;
}

function addBrowserResult(results, category, property, value, available = true) {
  results.push({
    category,
    property,
    value: value === undefined || value === null || value === "" ? "Unavailable" : String(value),
    available,
  });
}

async function collectBrowserDiagnostics() {
  const results = [];
  let highEntropy = null;
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      highEntropy = await navigator.userAgentData.getHighEntropyValues([
        "architecture",
        "bitness",
        "formFactors",
        "fullVersionList",
        "model",
        "platformVersion",
        "wow64",
      ]);
    } catch (_error) {
      highEntropy = null;
    }
  }

  addBrowserResult(results, "Platform", "Operating-system hint", highEntropy?.platform || navigator.userAgentData?.platform || navigator.platform || "Unavailable", Boolean(highEntropy?.platform || navigator.userAgentData?.platform || navigator.platform));
  addBrowserResult(results, "Platform", "Platform version hint", highEntropy?.platformVersion, Boolean(highEntropy?.platformVersion));
  addBrowserResult(results, "Platform", "CPU architecture hint", highEntropy?.architecture, Boolean(highEntropy?.architecture));
  addBrowserResult(results, "Platform", "Architecture bitness hint", highEntropy?.bitness, Boolean(highEntropy?.bitness));
  addBrowserResult(results, "Platform", "Mobile device", navigator.userAgentData?.mobile ?? /Mobi/i.test(navigator.userAgent), true);
  addBrowserResult(results, "Hardware", "Logical processor threads available to browser", navigator.hardwareConcurrency, Number.isFinite(navigator.hardwareConcurrency));
  addBrowserResult(results, "Hardware", "Approximate device memory", navigator.deviceMemory ? `${navigator.deviceMemory} GiB` : undefined, Boolean(navigator.deviceMemory));
  addBrowserResult(results, "Hardware", "Touch points", navigator.maxTouchPoints, Number.isFinite(navigator.maxTouchPoints));
  addBrowserResult(results, "Display", "Screen resolution", `${screen.width} × ${screen.height}`, true);
  addBrowserResult(results, "Display", "Available screen area", `${screen.availWidth} × ${screen.availHeight}`, true);
  addBrowserResult(results, "Display", "Color depth", `${screen.colorDepth}-bit`, true);
  addBrowserResult(results, "Display", "Device pixel ratio", window.devicePixelRatio, true);
  addBrowserResult(results, "Locale", "Language", navigator.language, Boolean(navigator.language));
  addBrowserResult(results, "Locale", "Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone, true);
  addBrowserResult(results, "Browser", "Cookies enabled", navigator.cookieEnabled, true);
  addBrowserResult(results, "Browser", "Online state", navigator.onLine, true);
  addBrowserResult(results, "Browser", "Browser brands", highEntropy?.fullVersionList?.map((item) => `${item.brand} ${item.version}`).join(", ") || navigator.userAgentData?.brands?.map((item) => `${item.brand} ${item.version}`).join(", "), Boolean(highEntropy?.fullVersionList || navigator.userAgentData?.brands));

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  addBrowserResult(results, "Network", "Effective connection type", connection?.effectiveType, Boolean(connection?.effectiveType));
  addBrowserResult(results, "Network", "Estimated downlink", connection?.downlink ? `${connection.downlink} Mbps` : undefined, Number.isFinite(connection?.downlink));
  addBrowserResult(results, "Network", "Estimated round-trip time", Number.isFinite(connection?.rtt) ? `${connection.rtt} ms` : undefined, Number.isFinite(connection?.rtt));
  addBrowserResult(results, "Network", "Data saver enabled", connection?.saveData, typeof connection?.saveData === "boolean");

  if (navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      addBrowserResult(results, "Storage", "Site storage quota estimate", formatBytes(estimate.quota), Number.isFinite(estimate.quota));
      addBrowserResult(results, "Storage", "Site storage currently used", formatBytes(estimate.usage), Number.isFinite(estimate.usage));
    } catch (_error) {
      addBrowserResult(results, "Storage", "Site storage estimate", undefined, false);
    }
  } else {
    addBrowserResult(results, "Storage", "Site storage estimate", undefined, false);
  }

  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      addBrowserResult(results, "Battery", "Charge level", `${Math.round(battery.level * 100)}%`, true);
      addBrowserResult(results, "Battery", "Charging", battery.charging, true);
    } catch (_error) {
      addBrowserResult(results, "Battery", "Battery API", undefined, false);
    }
  } else {
    addBrowserResult(results, "Battery", "Battery API", undefined, false);
  }

  const capabilities = {
    WebAssembly: typeof WebAssembly !== "undefined",
    WebGL2: Boolean(document.createElement("canvas").getContext("webgl2")),
    WebRTC: typeof RTCPeerConnection !== "undefined",
    "Service workers": "serviceWorker" in navigator,
    IndexedDB: "indexedDB" in window,
    "Local storage": "localStorage" in window,
  };
  Object.entries(capabilities).forEach(([name, value]) => addBrowserResult(results, "Capabilities", name, value, true));

  return {
    schemaVersion: "nettrace-browser-check-v1",
    generatedAt: new Date().toISOString(),
    consent: true,
    uploaded: false,
    limitations: [
      "No BIOS, firmware, serial number or motherboard information",
      "No installed applications, services, processes, logs, WSL or private files",
      "No private IP, MAC, DNS, gateway, Wi-Fi or router information",
      "Values may be reduced or unavailable due to browser privacy protections",
    ],
    results,
  };
}

function renderBrowserDiagnostics(data) {
  const table = document.getElementById("browser-diagnostic-table");
  clear(table);
  data.results.forEach((item) => {
    const row = document.createElement("tr");
    for (const value of [item.category, item.property, item.value]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    const available = document.createElement("td");
    available.append(badge(item.available ? "PASS" : "WARN", item.available ? "Available" : "Restricted"));
    row.append(available);
    table.append(row);
  });
  browserResults.hidden = false;
  browserResults.scrollIntoView({ behavior: "smooth", block: "start" });
}

resultFile.addEventListener("change", async () => {
  const file = resultFile.files?.[0];
  if (!file) return;
  if (file.size > 1_000_000) {
    showError(new Error("The selected JSON file is unexpectedly large."));
    return;
  }
  try {
    const data = JSON.parse(await file.text());
    render(data);
  } catch (error) {
    showError(error);
  }
});

browserConsent.addEventListener("change", () => {
  runBrowserCheck.disabled = !browserConsent.checked;
});

runBrowserCheck.addEventListener("click", async () => {
  if (!browserConsent.checked) return;
  runBrowserCheck.disabled = true;
  runBrowserCheck.textContent = "Checking…";
  try {
    browserDiagnosticData = await collectBrowserDiagnostics();
    renderBrowserDiagnostics(browserDiagnosticData);
  } catch (error) {
    showError(error);
  } finally {
    runBrowserCheck.textContent = "Run browser diagnostics";
    runBrowserCheck.disabled = !browserConsent.checked;
  }
});

document.getElementById("download-browser-results").addEventListener("click", () => {
  if (!browserDiagnosticData) return;
  const blob = new Blob([`${JSON.stringify(browserDiagnosticData, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nettrace-browser-results.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

document.getElementById("theme-button").addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("nettrace-theme", next);
});

const savedTheme = localStorage.getItem("nettrace-theme");
if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
