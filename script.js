/* ==========================================================================
   HACKER SCANNER PRANK — SCRIPT
   100% client-side. No backend. No analytics. No network requests.

   PRIVACY / SAFETY NOTE (please read before editing):
   - This script NEVER calls navigator.mediaDevices.getUserMedia().
   - This script NEVER requests camera, microphone, location, or file
     system permissions of any kind.
   - The "camera scanner" and "photo capture" steps are 100% CSS/canvas
     visual simulations. No image of the visitor is ever created,
     stored, or transmitted anywhere.
   - The only data read is information the browser already exposes to
     every website (see collectDeviceInfo() below): screen size, pixel
     ratio, language, timezone, platform hints, and online status.
     None of it is sent anywhere — it is only rendered on screen.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* CONFIGURATION — edit this to change where the final button goes     */
  /* ------------------------------------------------------------------ */
  const INSTAGRAM_URL = "https://www.instagram.com/";

  /* ------------------------------------------------------------------ */
  /* MOTION PREFERENCE                                                   */
  /* ------------------------------------------------------------------ */
  const REDUCED_MOTION =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Global speed multiplier. Tapping the boot screen sets this to a
     smaller value so the intro can be sped through. Reduced-motion
     visitors get a faster experience automatically. */
  let speedFactor = REDUCED_MOTION ? 0.25 : 1;

  const wait = (ms) =>
    new Promise((resolve) => setTimeout(resolve, Math.max(0, ms * speedFactor)));

  /* ------------------------------------------------------------------ */
  /* SCREEN NAVIGATION HELPERS                                           */
  /* ------------------------------------------------------------------ */
  const screens = Array.from(document.querySelectorAll(".screen"));

  function showScreen(id) {
    screens.forEach((s) => {
      if (s.id === id) {
        s.classList.add("active");
        s.classList.remove("leaving");
      } else {
        s.classList.remove("active");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* DEVICE INFO — reads ONLY standard, non-sensitive browser data       */
  /* ------------------------------------------------------------------ */
  function collectDeviceInfo() {
    const ua = navigator.userAgent || "";
    const uaLower = ua.toLowerCase();

    // Best-effort, non-invasive OS detection from the public User-Agent string.
    let os = "UNKNOWN";
    if (/android/.test(uaLower)) os = "ANDROID";
    else if (/iphone|ipad|ipod/.test(uaLower)) os = "iOS";
    else if (/windows/.test(uaLower)) os = "WINDOWS";
    else if (/mac os x|macintosh/.test(uaLower)) os = "MACOS";
    else if (/linux/.test(uaLower)) os = "LINUX";

    // Best-effort browser detection. Order matters (Edge/Chrome both include "Chrome").
    let browser = "UNKNOWN";
    if (/edg\//.test(uaLower)) browser = "EDGE";
    else if (/opr\/|opera/.test(uaLower)) browser = "OPERA";
    else if (/chrome\//.test(uaLower)) browser = "CHROME";
    else if (/crios\//.test(uaLower)) browser = "CHROME";
    else if (/fxios\//.test(uaLower)) browser = "FIREFOX";
    else if (/firefox\//.test(uaLower)) browser = "FIREFOX";
    else if (/safari\//.test(uaLower) && /version\//.test(uaLower)) browser = "SAFARI";

    const isMobile =
      /mobi|android|iphone|ipad|ipod/.test(uaLower) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /mac/.test(uaLower) === false);
    const deviceType = isMobile ? "MOBILE DEVICE" : "DESKTOP / LAPTOP";

    let timezone = "UNKNOWN";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UNKNOWN";
    } catch (e) {
      timezone = "UNKNOWN";
    }

    const language = (navigator.language || "UNKNOWN").toUpperCase();
    const screenRes = `${window.screen.width * window.devicePixelRatio || window.screen.width} × ${
      window.screen.height * window.devicePixelRatio || window.screen.height
    }`;
    const pixelRatio = window.devicePixelRatio || 1;
    const online = navigator.onLine ? "ONLINE" : "OFFLINE";

    return {
      os,
      browser,
      deviceType,
      screenRes,
      pixelRatio,
      language,
      timezone,
      online,
    };
  }

  const DEVICE_INFO = collectDeviceInfo();

  /* ------------------------------------------------------------------ */
  /* STEP 1 — BOOT TERMINAL                                              */
  /* ------------------------------------------------------------------ */
  const BOOT_LINES = [
    "> INITIALIZING SECURE CONNECTION...",
    "> HANDSHAKE ACCEPTED [AES-256]",
    "> CONNECTING TO REMOTE NODE...",
    "> NODE CONNECTED: 0x9F3A-NODE",
    "> ANALYZING BROWSER...",
    "> IDENTIFYING DEVICE...",
    "> INITIALIZING SYSTEM SCANNER...",
    "> STANDBY...",
  ];

  async function runBootSequence() {
    const logEl = document.getElementById("boot-log");
    const bootScreen = document.getElementById("screen-boot");
    let skip = false;

    const skipHandler = () => {
      skip = true;
      speedFactor = 0.15;
    };
    bootScreen.addEventListener("click", skipHandler, { once: true });
    bootScreen.addEventListener("touchstart", skipHandler, { once: true, passive: true });

    for (const line of BOOT_LINES) {
      await typeLine(logEl, line, skip ? 4 : 18);
      logEl.textContent += "\n";
      await wait(skip ? 60 : 320);
    }

    await wait(400);
    bootScreen.removeEventListener("click", skipHandler);
    bootScreen.removeEventListener("touchstart", skipHandler);
  }

  function typeLine(container, text, charDelay) {
    return new Promise((resolve) => {
      if (REDUCED_MOTION) {
        container.textContent += text;
        resolve();
        return;
      }
      let i = 0;
      const step = () => {
        container.textContent += text[i];
        i++;
        if (i < text.length) {
          setTimeout(step, charDelay);
        } else {
          resolve();
        }
      };
      step();
    });
  }

  /* ------------------------------------------------------------------ */
  /* STEP 2 — DEVICE SCANNER READOUT                                     */
  /* ------------------------------------------------------------------ */
  async function runDeviceScan() {
    showScreen("screen-scan");
    const readout = document.getElementById("scan-readout");
    const rows = [
      ["DEVICE TYPE", DEVICE_INFO.deviceType],
      ["OPERATING SYS", DEVICE_INFO.os],
      ["BROWSER", DEVICE_INFO.browser],
      ["SCREEN", DEVICE_INFO.screenRes],
      ["PIXEL RATIO", `${DEVICE_INFO.pixelRatio}x`],
      ["LANGUAGE", DEVICE_INFO.language],
      ["TIMEZONE", DEVICE_INFO.timezone],
      ["CONNECTION", DEVICE_INFO.online],
    ];

    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.innerHTML = `<span class="row-label">${padLabel(label)}</span><span class="row-value">${escapeHtml(
        value
      )}</span>`;
      readout.appendChild(row);
      await wait(220);
    }
    await wait(900);
  }

  function padLabel(label) {
    const target = 16;
    const dots = ".".repeat(Math.max(2, target - label.length));
    return `${label} ${dots} `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* ------------------------------------------------------------------ */
  /* STEP 3 — DEEP SCAN PROGRESS BAR                                     */
  /* ------------------------------------------------------------------ */
  const DEEP_LOG_LINES = [
    { text: "> SCANNING PORTS...", cls: "ok" },
    { text: "> CHECKING FIREWALL RULES...", cls: "ok" },
    { text: "> CROSS-REFERENCING SIGNATURE DB...", cls: "ok" },
    { text: "> ANOMALY DETECTED IN SECTOR 7", cls: "warn" },
    { text: "> RECALCULATING...", cls: "ok" },
    { text: "> COMPILING REPORT...", cls: "ok" },
  ];

  async function runDeepScan() {
    showScreen("screen-deep");
    const fill = document.getElementById("deep-progress-fill");
    const percentEl = document.getElementById("deep-progress-percent");
    const bar = document.getElementById("deep-progress-bar");
    const logEl = document.getElementById("deep-log");

    let printed = 0;
    let pct = 0;

    while (pct < 100) {
      pct += Math.floor(Math.random() * 9) + 3;
      if (pct > 100) pct = 100;
      fill.style.width = pct + "%";
      percentEl.textContent = pct + "%";
      bar.setAttribute("aria-valuenow", String(pct));

      const shouldPrint = Math.floor((pct / 100) * DEEP_LOG_LINES.length);
      while (printed < shouldPrint && printed < DEEP_LOG_LINES.length) {
        const line = DEEP_LOG_LINES[printed];
        const div = document.createElement("div");
        div.className = line.cls;
        div.textContent = line.text;
        logEl.appendChild(div);
        printed++;
      }
      await wait(90);
    }

    await wait(300);
    const finalLines = [
      { text: "SYSTEM ANALYSIS COMPLETE", cls: "ok" },
      { text: "SECURITY STATUS: UNKNOWN", cls: "warn" },
      { text: "CAMERA INTERFACE: AVAILABLE", cls: "ok" },
    ];
    for (const line of finalLines) {
      const div = document.createElement("div");
      div.className = line.cls;
      div.textContent = line.text;
      logEl.appendChild(div);
      await wait(260);
    }
    await wait(900);
  }

  /* ------------------------------------------------------------------ */
  /* STEP 4 — FAKE CAMERA SCANNER (VISUAL SIMULATION ONLY)                */
  /* No navigator.mediaDevices is ever referenced in this file.          */
  /* ------------------------------------------------------------------ */
  async function runCameraSequence() {
    showScreen("screen-camera");
    const hudFocus = document.getElementById("hud-focus");
    const hudSignal = document.getElementById("hud-signal");
    const countdownEl = document.getElementById("countdown");
    const flashLayer = document.getElementById("flash-layer");

    await wait(700);
    hudFocus.textContent = "LOCKED";

    const signalFrames = ["█░░░░░", "███░░░", "█████░", "██████"];
    for (const frame of signalFrames) {
      hudSignal.textContent = frame;
      await wait(180);
    }

    await wait(500);

    for (const num of ["3", "2", "1"]) {
      countdownEl.textContent = num;
      countdownEl.style.opacity = "1";
      countdownEl.style.transform = "scale(1)";
      await wait(650);
      countdownEl.style.opacity = "0";
      countdownEl.style.transform = "scale(0.6)";
      await wait(150);
    }

    // Camera-style flash animation (pure CSS, no real capture happens).
    flashLayer.classList.add("flash-active");
    await wait(450);
    flashLayer.classList.remove("flash-active");
  }

  /* ------------------------------------------------------------------ */
  /* STEP 5 — FAKE PHOTO CAPTURE (generated abstract placeholder)        */
  /* ------------------------------------------------------------------ */
  function drawAbstractAvatar(canvas) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#020a03");
    grad.addColorStop(1, "#03140a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Abstract "silhouette" made of layered translucent shapes — this is
    // a generated placeholder graphic, never a real photo of the visitor.
    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.fillStyle = "rgba(0,255,102,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.05, w * 0.28, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,255,102,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.22, w * 0.16, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Scanline texture over the placeholder
    ctx.strokeStyle = "rgba(0,255,102,0.08)";
    for (let y = 0; y < h; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Random static speckle for a "digitized" feel
    ctx.fillStyle = "rgba(0,255,102,0.15)";
    for (let i = 0; i < 140; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 1, 1);
    }

    // Border glow ring
    ctx.strokeStyle = "rgba(0,255,102,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);
  }

  async function runCaptureSequence() {
    showScreen("screen-capture");
    const canvas = document.getElementById("fake-photo-canvas");
    const fill = document.getElementById("capture-progress-fill");
    const logEl = document.getElementById("capture-log");

    drawAbstractAvatar(canvas);

    let pct = 0;
    while (pct < 100) {
      pct += Math.floor(Math.random() * 14) + 6;
      if (pct > 100) pct = 100;
      fill.style.width = pct + "%";
      await wait(70);
    }

    const div = document.createElement("div");
    div.className = "ok";
    div.textContent = "IMAGE PROCESSING... 100%";
    logEl.appendChild(div);
    await wait(1000);
  }

  /* ------------------------------------------------------------------ */
  /* STEP 6 — BIG PRANK REVEAL                                           */
  /* ------------------------------------------------------------------ */
  async function runReveal() {
    showScreen("screen-reveal");
    const ids = ["reveal-1", "reveal-2", "reveal-3"];
    for (const id of ids) {
      const el = document.getElementById(id);
      el.classList.add("show");
      await wait(1300);
      el.classList.remove("show");
      el.style.display = "none";
      await wait(150);
    }

    const kidding = document.getElementById("reveal-4");
    kidding.classList.add("show");
    await wait(700);

    const sub = document.getElementById("reveal-sub");
    sub.classList.add("show");
    await wait(2200);
  }

  /* ------------------------------------------------------------------ */
  /* STEP 7 — FINAL DEVICE REPORT                                        */
  /* ------------------------------------------------------------------ */
  function renderDeviceReport() {
    const box = document.getElementById("report-box");
    const lines = [
      "╔════════ DEVICE REPORT ════════╗",
      "",
      `${padLabel("OS")}${DEVICE_INFO.os}`,
      `${padLabel("BROWSER")}${DEVICE_INFO.browser}`,
      `${padLabel("SCREEN")}${DEVICE_INFO.screenRes}`,
      `${padLabel("LANGUAGE")}${DEVICE_INFO.language}`,
      `${padLabel("TIMEZONE")}${DEVICE_INFO.timezone}`,
      `${padLabel("DEVICE TYPE")}${DEVICE_INFO.deviceType}`,
      "",
      "╚════════════════════════════════╝",
    ];
    box.textContent = lines.join("\n");
  }

  async function runReport() {
    showScreen("screen-report");
    renderDeviceReport();
    await wait(2600);
  }

  /* ------------------------------------------------------------------ */
  /* STEP 8 — FINAL MESSAGE / CTA                                        */
  /* ------------------------------------------------------------------ */
  function runFinal() {
    showScreen("screen-final");
    const btn = document.getElementById("return-btn");
    btn.addEventListener("click", () => {
      window.location.href = INSTAGRAM_URL;
    });
  }

  /* ------------------------------------------------------------------ */
  /* MAIN SEQUENCE                                                       */
  /* ------------------------------------------------------------------ */
  async function main() {
    try {
      await runBootSequence();
      await runDeviceScan();
      await runDeepScan();
      await runCameraSequence();
      await runCaptureSequence();
      await runReveal();
      await runReport();
      runFinal();
    } catch (err) {
      // Fail safe: if anything unexpected happens, jump straight to the
      // harmless final screen rather than leaving a blank page.
      console.error("Prank sequence error (non-fatal):", err);
      runFinal();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
