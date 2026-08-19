# Hacker Scanner Prank

A fast, cinematic, mobile-first "hacker camera scanner" prank page, built for
sharing as an Instagram bio link. The moment it loads, visitors see a
full-screen futuristic camera/security HUD that scans their device, counts
down, "captures a photo," and lands on a joke reveal — all in about 7
seconds. **No camera, microphone, or personal data is ever accessed, stored,
or sent anywhere.**

## Files

```
/
├── index.html   → page structure / all 8 screens
├── style.css    → CRT terminal look, animations, responsive layout
├── script.js    → sequencing logic + safe device-info readout
└── README.md    → this file
```

## 1. Create the GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. Name it whatever you like, e.g. `hacker-prank`.
3. Choose **Public** (required for free GitHub Pages).
4. Leave "Add a README" unchecked (you already have one) and click **Create repository**.

## 2. Upload the files

**Option A — web UI (easiest):**
1. On your new repo page, click **Add file → Upload files**.
2. Drag in `index.html`, `style.css`, `script.js`, and `README.md`.
3. Click **Commit changes**.

**Option B — git command line:**
```bash
git clone https://github.com/YOUR_USERNAME/hacker-prank.git
cd hacker-prank
# copy index.html, style.css, script.js, README.md into this folder
git add .
git commit -m "Add hacker scanner prank site"
git push
```

## 3. Enable GitHub Pages

1. In your repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, choose `main` (or `master`) and folder `/ (root)`, then **Save**.
4. Wait 1–2 minutes. Your site will be live at:
   `https://YOUR_USERNAME.github.io/hacker-prank/`
5. Put that URL in your Instagram bio link.

## 4. Change the Instagram destination URL

Open `script.js` and edit the constant near the top of the file:

```js
const INSTAGRAM_URL = "https://www.instagram.com/";
```

Replace it with any profile or link you want the final button to open, e.g.
`https://www.instagram.com/your_username/`.

## 5. Which browser APIs are used to detect device info

Only standard, publicly-exposed browser properties are read — the same
information every website can see without asking permission:

- `navigator.userAgent` → used to guess OS/browser family (best-effort text parsing)
- `navigator.language` → browser language
- `navigator.onLine` → online/offline status
- `navigator.maxTouchPoints` → touch-capability hint (used for mobile/desktop guess)
- `window.screen.width` / `window.screen.height` → screen resolution
- `window.devicePixelRatio` → pixel density
- `Intl.DateTimeFormat().resolvedOptions().timeZone` → timezone

None of this data is transmitted anywhere — it's rendered directly in the
visitor's own browser and disappears when they close the tab.

## 6. Confirmation: no camera access, ever

- `script.js` never calls `navigator.mediaDevices.getUserMedia()` and never
  references `navigator.mediaDevices` at all.
- No permission prompt (camera, microphone, location, notifications, etc.)
  is triggered at any point in the experience.
- The camera HUD, scan, countdown, and "photo capture" are entirely CSS/JS
  animations — corner brackets, a moving scan line, a radar sweep, and text
  overlays. No image or video of the visitor is ever created, stored, or
  transmitted anywhere.
- The shutter "click" sound is synthesized locally in the browser with the
  Web Audio API (two short oscillator tones). No audio is recorded and the
  microphone is never touched.
- No `fetch`, `XMLHttpRequest`, `sendBeacon`, cookies, or third-party
  scripts are used. The page makes zero network requests after it loads.
- The prank is never spelled out at the start — the camera HUD and scan
  feel real in the moment — but a short, honest line ("your camera was
  never accessed") appears during the reveal so the experience stays
  privacy-safe and no one is left thinking a real photo was taken.

## Timeline

| Time | What happens |
|---|---|
| 0.0s | Full-screen camera HUD appears immediately (no intro) |
| 0.5s | Scan ticker starts ("SCANNING DEVICE...", etc.) |
| ~2.4s | Device analysis panel fades in with real browser data |
| ~3.1s | Countdown: 3 → 2 → 1 |
| ~5.3s | Screen shake + flash + synthesized shutter sound |
| ~5.7s | "CAPTURING... / PROCESSING IMAGE... / ANALYZING... / PHOTO CAPTURED" |
| ~7.2s | Big reveal: "I CAUGHT YOU 😂" → "HAHAHAHAHAHA 😈" → "I TAKE A PHOTO OF YOU 📸" |
| ~10.5s | Safety line + "Return to Instagram" button |

## Customizing

- **Colors / look:** edit the CSS custom properties at the top of `style.css` (`--green`, `--red`, `--bg`, etc.).
- **Scan / reveal text:** edit the `TICKER_MESSAGES` and reveal `lines` arrays in `script.js`.
- **Timing:** adjust the `wait(...)` millisecond values throughout `script.js`'s `main()` function.
- **Reduced motion:** visitors with `prefers-reduced-motion` enabled automatically get a faster, animation-light version.
