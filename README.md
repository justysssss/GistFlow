# Gistflow – Smart Page Summarizer (MV3)

On-device first (Chrome AI APIs), Gemini fallback. Injected sidebar with Summary, Key Points, Focus Mode, and a Helper chat.

## APIs you need
- On-device: Chrome AI APIs (Summarizer/Prompt/Rewriter). Used automatically when available in Chrome Canary/Dev with appropriate flags. No keys needed.
- Fallback: Gemini API (Google AI Studio). One API key is sufficient.

### Get a Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Put it into one of these places:
   - Extension Options page field “Gemini API Key” (recommended for extension runtime)
   - Or create a local `.env` file with `VITE_GEMINI_API_KEY=...` for dev-only fallback

## Dev without building (just verify files)
We won’t run `npm run dev` yet. To check extension wiring:
1. Run `npm install` if you haven’t already.
2. Build once to generate the MV3 bundle:
   - Note: Building is required to produce `dist/` for loading unpacked.

## How to build and load in Chrome
1. Build
```powershell
npm run build
```
2. Load in Chrome
- Open `chrome://extensions`
- Enable Developer mode
- Click “Load unpacked” and select the `dist` folder
- Click the extension icon → Open Sidebar → Try TL;DR/Key Points/Focus

## Chrome AI (on-device) notes
If using Chrome Canary/Dev: ensure on-device APIs are available. Some releases require flags; search for “chrome on-device ai summarizer flag” if needed. The code automatically falls back to Gemini when on-device APIs are absent.

## Folder structure
- `public/manifest.json` – MV3 manifest
- `src/background/index.ts` – Service worker
- `src/content/index.ts` – Injected sidebar + actions
- `src/popup/*` – Popup UI to open sidebar
- `src/options/*` – Options UI to set tone and Gemini key
- `src/ai/client.ts` – On-device first, Gemini fallback

## Troubleshooting
- If `vite build` fails with Node version errors, upgrade Node to 20.19+ or 22.12+
- If popup “Open Sidebar” does nothing, check `chrome://extensions` → “Errors” for the extension
- CSP-heavy pages may block styles; the injected UI uses inline styles to keep friction low

*** Security
- API key is stored via `chrome.storage.sync` by the Options page.
- Key is only used when on-device AI is not available.

## License
MIT# Gistflow – Smart Page Summarizer (Chrome Extension)

On-device AI first (Chrome AI APIs) with cloud fallback (Gemini via Google AI Studio). TL;DR, Key Points, Action Notes, and Focus Mode.

## Features
- Summary (TLDR) for current page
- Key Points with checkboxes
- Focus Mode rewrite in your preferred tone
- Helper chat: ask questions about the current page and get answers using its content
- Settings shortcut from the sidebar header (gear icon)
- On-device AI (Gemini Nano) when available; Gemini API fallback

## Tech Stack
- Chrome Extension MV3 + React + TypeScript + Vite
- Content script injects a small sidebar
- Options page stores tone and Gemini API key in `chrome.storage`

## API Setup
- On-device: available in recent Chrome builds when `chrome://flags/#optimization-guide-on-device-model` is enabled and the model is downloaded.
- Fallback: Gemini API key from Google AI Studio
  1. Go to https://aistudio.google.com
  2. Create an API key
  3. In the extension Options page, paste it into “Gemini API Key (fallback)”.
  4. For local dev builds, you can also set `VITE_GEMINI_API_KEY` in a `.env` file (see `.env.example`).

## Local Development
```powershell
cd d:\Coding\gistflow\gistflow-ext
npm install
npm run build
```

Load in Chrome:
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click “Load unpacked” and select the `dist` folder
4. Open any page → click the extension icon → Open Sidebar
  - Tabs: Summary, Key Points, Focus Mode, Helper

## Project Structure
- `public/manifest.json` – MV3 manifest
- `src/background/index.ts` – service worker
- `src/content/index.ts` – content script + injected sidebar
- `src/popup/*` – popup UI
- `src/options/*` – options UI (tone + API key)
- `src/ai/client.ts` – AI client (on-device + Gemini fallback)

## Notes
- Performance: page text is extracted once and cached to reduce lag
- CSP: we only inject small inline styles; customize as needed
- You can add keyboard shortcuts via manifest `commands`
- Caching per URL with `chrome.storage.sync` is an easy next step

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
