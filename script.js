/* ==========================================================================
   HACKER SCANNER PRANK — SCRIPT (fast/cinematic edition)
   100% client-side. No backend. No analytics. No network requests.

   PRIVACY / SAFETY NOTE (please read before editing):
   - This script NEVER calls navigator.mediaDevices.getUserMedia().
   - This script NEVER requests camera, microphone, location, or file
     system permissions of any kind.
   - The "camera scanner" and "photo capture" are 100% CSS/JS visual
     simulations. No image of the visitor is ever created, stored, or
     transmitted anywhere.
   - The only data read is information the browser already exposes to
     every website (see collectDeviceInfo() below): user agent, screen
     size, pixel ratio, language, platform, timezone, and online status.
     None of it is sent anywhere — it is only rendered on screen.
   - The shutter "sound" is synthesized locally with the Web Audio API
     (a couple of short oscillator clicks). No audio/video is recorded,
     and the microphone is never touched.
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

  const speedFactor = REDUCED_MOTION ? 0.4 : 1;
  const wait = (ms) =>
    new Promise((resolve) => setTimeout(resolve, Math.max(0, ms * speedFactor)));

  /* ------------------------------------------------------------------ */
  /* ELEMENTS                                                             */
  /* ------------------------------------------------------------------ */
  const el = {
    app: document.getElementById("app"),
    liveScanLabel: document.getElementById("live-scan-label"),
    scanTicker: document.getElementById("scan-ticker"),
    dataPanel: document.getElementById("data-panel"),
    crosshair: document.getElementById("crosshair"),
    focusRing: document.getElementById("focus-ring"),
    countdown: document.getElementById("countdown"),
    captureStatus: document.getElementById("capture-status"),
    revealOverlay: document.getElementById("reveal-overlay"),
    revealText: document.getElementById("reveal-text"),
    revealSafeNote: document.getElementById("reveal-safe-note"),
    flashLayer: document.getElementById("flash-layer"),
    finalScreen: document.getElementById("final-screen"),
    returnBtn: document.getElementById("return-btn"),
  };

  /* ------------------------------------------------------------------ */
  /* LOCALLY-SYNTHESIZED SHUTTER SOUND (Web Audio API, no recording)     */
  /* ------------------------------------------------------------------ */
  let audioCtx = null;

  function getAudioContext() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      audioCtx = new Ctx();
    } catch (e) {
      audioCtx = null;
    }
    return audioCtx;
  }

  function playClick(freq, delaySec, durationSec, gainValue) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + delaySec;
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + durationSec);
    osc.start(start);
    osc.stop(start + durationSec + 0.02);
  }

  function playShutterSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Two quick clicks approximate a mechanical shutter — synthesized locally.
    playClick(1800, 0, 0.045, 0.15);
    playClick(700, 0.05, 0.08, 0.12);
  }

  function playBeep() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    playClick(1200, 0, 0.06, 0.08);
  }

  // Some browsers require a user gesture before audio can play. Unlock
  // silently on first tap/touch, without requesting any permission.
  function unlockAudioOnce() {
    getAudioContext();
    window.removeEventListener("pointerdown", unlockAudioOnce);
    window.removeEventListener("touchstart", unlockAudioOnce);
  }
  window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
  window.addEventListener("touchstart", unlockAudioOnce, { once: true, passive: true });

  /* ------------------------------------------------------------------ */
  /* DEVICE INFO — reads ONLY standard, non-sensitive browser data       */
  /* ------------------------------------------------------------------ */
  function collectDeviceInfo() {
    const ua = navigator.userAgent || "";
    const uaLower = ua.toLowerCase();

    let os = "UNKNOWN";
    if (/android/.test(uaLower)) os = "ANDROID";
    else if (/iphone|ipad|ipod/.test(uaLower)) os = "iOS";
    else if (/windows/.test(uaLower)) os = "WINDOWS";
    else if (/mac os x|macintosh/.test(uaLower)) os = "MACOS";
    else if (/linux/.test(uaLower)) os = "LINUX";

    let browser = "UNKNOWN";
    if (/edg\//.test(uaLower)) browser = "EDGE";
    else if (/opr\/|opera/.test(uaLower)) browser = "OPERA";
    else if (/crios\//.test(uaLower)) browser = "CHROME";
    else if (/chrome\//.test(uaLower)) browser = "CHROME";
    else if (/fxios\//.test(uaLower)) browser = "FIREFOX";
    else if (/firefox\//.test(uaLower)) browser = "FIREFOX";
    else if (/safari\//.test(uaLower) && /version\//.test(uaLower)) browser = "SAFARI";

    const isMobile =
      /mobi|android|iphone|ipad|ipod/.test(uaLower) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && !/mac/.test(uaLower));
    const deviceType = isMobile ? "MOBILE" : "DESKTOP";

    let timezone = "UNKNOWN";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UNKNOWN";
    } catch (e) {
      timezone = "UNKNOWN";
    }

    const language = navigator.language || "UNKNOWN";
    const platform = navigator.platform || "UNKNOWN";
    const screenRes = `${window.screen.width} × ${window.screen.height}`;
    const dpr = window.devicePixelRatio || 1;
    const online = navigator.onLine ? "ONLINE" : "OFFLINE";
    const model = "UNKNOWN"; // Never invented — browsers don't reliably expose this.

    return { os, browser, deviceType, model, screenRes, dpr, language, platform, timezone, online };
  }

  const DEVICE_INFO = collectDeviceInfo();

  function padRow(label, value) {
    const target = 14;
    const dots = ".".repeat(Math.max(2, target - label.length));
    return ` ${label} ${dots} ${value}`;
  }

  function buildDataPanelText() {
    const lines = [
      "╔══════════════════════════════╗",
      "       DEVICE ANALYSIS",
      "╠══════════════════════════════╣",
      padRow("OS", DEVICE_INFO.os),
      padRow("BROWSER", DEVICE_INFO.browser),
      padRow("DEVICE", DEVICE_INFO.deviceType),
      padRow("MODEL", DEVICE_INFO.model),
      padRow("SCREEN", DEVICE_INFO.screenRes),
      padRow("DPI", `${DEVICE_INFO.dpr}`),
      padRow("LANGUAGE", DEVICE_INFO.language),
      padRow("PLATFORM", DEVICE_INFO.platform),
      padRow("TIMEZONE", DEVICE_INFO.timezone),
      padRow("STATUS", DEVICE_INFO.online),
      "╚══════════════════════════════╝",
    ];
    return lines.join("\n");
  }

  /* ------------------------------------------------------------------ */
  /* SCAN TICKER MESSAGES                                                */
  /* ------------------------------------------------------------------ */
  const TICKER_MESSAGES = [
    "SCANNING DEVICE...",
    "CAMERA INTERFACE DETECTED",
    "ANALYZING HARDWARE...",
    "READING DEVICE PARAMETERS...",
    "IDENTIFYING SYSTEM...",
  ];

  async function runTicker() {
    el.scanTicker.classList.add("show");
    for (const msg of TICKER_MESSAGES) {
      el.scanTicker.textContent = msg;
      await wait(400);
    }
  }

  /* ------------------------------------------------------------------ */
  /* MAIN TIMELINE                                                       */
  /* Target timeline (per spec):                                         */
  /*   0.0s  camera HUD visible (already true on load)                   */
  /*   0.5s  device scan starts                                          */
  /*   2-3s  device info appears                                         */
  /*   3s    countdown starts                                            */
  /*   3-6s  3 -> 2 -> 1                                                 */
  /*   6s    flash                                                       */
  /*   6.5s  PHOTO CAPTURED                                              */
  /*   7s    I CAUGHT YOU                                                */
  /* ------------------------------------------------------------------ */
  async function main() {
    // Camera HUD is already visible immediately (no JS needed for that).
    await wait(500);

    // Scan phase (~2 seconds of ticker messages).
    const tickerPromise = runTicker();
    el.crosshair.classList.add("show");
    await wait(1900);

    // Data panel reveal.
    el.dataPanel.textContent = buildDataPanelText();
    el.dataPanel.setAttribute("aria-hidden", "false");
    el.dataPanel.classList.add("show");
    playBeep();
    await tickerPromise;
    el.scanTicker.classList.remove("show");

    await wait(700);

    // Countdown.
    el.focusRing.classList.add("show");
    for (const num of ["3", "2", "1"]) {
      el.countdown.textContent = num;
      el.countdown.classList.add("show");
      playBeep();
      await wait(700);
      el.countdown.classList.remove("show");
      await wait(120);
    }
    el.focusRing.classList.remove("show");

    // Screen shake + flash + shutter sound.
    el.app.classList.add("shake");
    playShutterSound();
    el.flashLayer.classList.add("flash-active");
    await wait(350);
    el.app.classList.remove("shake");
    el.flashLayer.classList.remove("flash-active");

    // Capture status messages.
    const captureMessages = ["CAPTURING...", "PROCESSING IMAGE...", "ANALYZING...", "PHOTO CAPTURED"];
    for (const msg of captureMessages) {
      el.captureStatus.textContent = msg;
      el.captureStatus.classList.remove("show");
      // Force reflow so the pop-in animation replays for each message.
      void el.captureStatus.offsetWidth;
      el.captureStatus.classList.add("show");
      await wait(380);
    }
    await wait(250);
    el.captureStatus.classList.remove("show");

    // Big reveal.
    await runReveal();

    // Final CTA.
    await wait(2600);
    showFinalScreen();
  }

  async function runReveal() {
    el.revealOverlay.classList.add("show");
    el.revealOverlay.setAttribute("aria-hidden", "false");

    const lines = ["I CAUGHT YOU 😂", "HAHAHAHAHAHA 😈", "I TAKE A PHOTO OF YOU 📸"];
    for (const line of lines) {
      el.revealText.textContent = line;
      el.revealText.classList.remove("pop");
      void el.revealText.offsetWidth;
      el.revealText.classList.add("pop");
      await wait(1150);
    }

    // Small final line so the experience stays privacy-safe and honest,
    // shown after the joke lands rather than spoiling it up front.
    el.revealSafeNote.textContent = "Relax — your camera was never accessed. Just a visual prank.";
    el.revealSafeNote.classList.add("show");
    await wait(1600);
  }

  function showFinalScreen() {
    el.finalScreen.classList.add("active");
    el.finalScreen.setAttribute("aria-hidden", "false");
    el.returnBtn.addEventListener("click", () => {
      window.location.href = INSTAGRAM_URL;
    });
  }

  /* ------------------------------------------------------------------ */
  /* BOOT                                                                 */
  /* ------------------------------------------------------------------ */
  function start() {
    main().catch((err) => {
      // Fail safe: never leave a blank/stuck screen.
      console.error("Prank sequence error (non-fatal):", err);
      showFinalScreen();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
