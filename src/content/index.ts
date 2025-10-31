import { ask, keyPoints, summarize } from "../ai/client";

// Inject a scoped stylesheet so UI looks polished without relying on page styles
function injectStyles() {
  if (document.getElementById("gistflow-styles")) return;
  const style = document.createElement("style");
  style.id = "gistflow-styles";
  style.textContent = `
  .gf-sidebar { position: fixed; top: 0; right: 0; width: 360px; height: 100vh; color: #e9e7ff; z-index: 2147483647; box-shadow: 0 0 24px rgba(0,0,0,.35); display: flex; flex-direction: column; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"; 
    --gf-accent: #6d5ef3; --gf-accent-shadow: rgba(109,94,243,.25);
    --gf-bg1: rgba(28,18,49,.95); --gf-bg2: rgba(19,13,36,.95);
    --gf-border: rgba(160,140,230,.22);
    border-left: 1px solid var(--gf-border);
    background: linear-gradient(180deg, var(--gf-bg1), var(--gf-bg2)); backdrop-filter: blur(12px) saturate(120%); -webkit-backdrop-filter: blur(12px) saturate(120%); writing-mode: horizontal-tb; }
  .gf-sidebar * { writing-mode: horizontal-tb; }
  .gf-sidebar.gf-left { left: 0; right: auto; border-left: none; border-right: 1px solid var(--gf-border); }
    .gf-sidebar.collapsed { width: 40px; overflow: hidden; }
  .gf-hidden { display: none !important; }
    .gf-sidebar.collapsed .gf-tabs, .gf-sidebar.collapsed .gf-title, .gf-sidebar.collapsed #gf-settings, .gf-sidebar.collapsed #gf-main, .gf-sidebar.collapsed #gf-bottom-chat { display: none !important; }
    .gf-sidebar.collapsed .gf-header { padding: 6px; justify-content: center; }
    .gf-sidebar.collapsed .gf-spacer, .gf-sidebar.collapsed .gf-close { display: none !important; }
    .gf-sidebar.collapsed .gf-collapse { width: 30px; height: 30px; }
    .gf-header { display: flex; align-items: center; gap: 8px; padding: 10px 10px; border-bottom: 1px solid rgba(188,170,255,.18); background: rgba(20,16,34,.65); position: sticky; top: 0; z-index: 2; }
    .gf-title { font-weight: 700; font-size: 14px; margin-right: 6px; color: #c1c9d4; }
    .gf-btn-group { display: flex; gap: 8px; }
  .gf-btn { appearance: none; border: 1px solid rgba(188,170,255,.22); background: rgba(26,22,42,.7); color: #e9e7ff; padding: 8px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: transform .05s ease, background .2s ease, border-color .2s ease; }
    .gf-btn:hover { background: rgba(26,22,42,.9); border-color: rgba(188,170,255,.35); }
    .gf-btn:active { transform: translateY(1px); }
    .gf-btn[disabled] { opacity: .6; cursor: not-allowed; }
  .gf-btn.primary, .gf-btn.active { background: var(--gf-accent); border-color: var(--gf-accent); color: white; }
  .gf-btn.primary:hover, .gf-btn.active:hover { filter: brightness(1.05); }
  .gf-btn.wide { min-width: 120px; padding-left: 14px; padding-right: 14px; }
    .gf-spacer { flex: 1; }
  .gf-close, .gf-gear, .gf-collapse { width: 34px; height: 34px; display: grid; place-items: center; font-size: 16px; font-weight: 700; border-radius: 10px; border: 1px solid rgba(160,140,230,.22); background: rgba(255,255,255,.06); }
  .gf-close:hover, .gf-gear:hover, .gf-collapse:hover { background: rgba(255,255,255,.12); }
  #gf-collapse-icon { font-size: 16px; line-height: 1; }
  .gf-tabs { display: flex; gap: 10px; justify-content: center; padding: 10px 10px; border-bottom: 1px solid rgba(160,140,230,.22); background: rgba(16,12,28,.6); position: sticky; top: 44px; z-index: 1; }
  .gf-tabs .gf-btn { background: rgba(255,255,255,.04); border-color: rgba(160,140,230,.32); border-radius: 16px; padding: 8px 12px; color: #e9e7ff; }
  .gf-tabs .gf-btn:hover { background: rgba(255,255,255,.09); border-color: rgba(160,140,230,.5); }
  .gf-tabs .gf-btn.active { background: var(--gf-accent); border-color: var(--gf-accent); color: #fff; box-shadow: 0 0 0 3px var(--gf-accent-shadow); }
    .gf-body { display: flex; flex-direction: column; padding: 0; flex: 1; background: transparent; overflow: hidden; }
  .gf-main { padding: 12px; overflow: auto; flex: 1; }
  .gf-chat-log { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
  .gf-chat-log > div { display: flex; }
  .gf-chat-row { display:flex; width:100%; }
  .gf-chat-row.me { justify-content:flex-end; }
  .gf-chat-row.ai { justify-content:flex-start; }
  .gf-chat-row.me .gf-bubble { min-width: 60%; max-width: 85%; }
    .gf-panel { background: rgba(26,22,42,.78); border: 1px solid rgba(188,170,255,.18); border-radius: 12px; padding: 12px; }
    .gf-pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; color: #cbd5e1; line-height: 1.45; }
    .gf-chat { display: grid; gap: 8px; }
  .gf-chatbar { padding: 10px 12px; border-top: 1px solid rgba(188,170,255,.18); background: rgba(20,16,34,.7); position: sticky; bottom: 0; display:flex; gap:8px; align-items: center; }
  .gf-actionbar { padding: 10px 12px; border-top: 1px solid rgba(188,170,255,.18); background: rgba(20,16,34,.78); position: sticky; bottom: 0; display:none; gap:8px; align-items:center; }
    .gf-checkbox { transform: translateY(2px); }
  .gf-bubble { display: block; box-sizing: border-box; max-width: 80%; min-width: 28ch; border: 1px solid rgba(255,255,255,.08); padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.05); overflow-wrap: anywhere; word-break: normal; white-space: normal; line-height: 1.45; }
    .gf-note { font-size: 12px; color: #9aa5b1; }
    .gf-error { color: #ffd1d1; background: #2a1212; border: 1px solid #5a1a1a; padding: 10px; border-radius: 8px; }
    .gf-chat { display: grid; gap: 8px; }
  .gf-suggestions { display:flex; gap:8px; flex-wrap: wrap; margin: 0 0 4px 0; }
  .gf-suggestion { font-size: 12px; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(188,170,255,.25); background: rgba(255,255,255,.06); cursor: pointer; color: #fff; }
  .gf-bubble { box-sizing: border-box; max-width: 80%; min-width: 28ch; border: 1px solid rgba(255,255,255,.08); padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.05); overflow-wrap: anywhere; word-break: normal; white-space: normal; line-height: 1.45; }
  #gf-bottom-ask { height: 36px; padding: 0 12px; white-space: nowrap; align-self: center; }
    .gf-bubble.me { background: rgba(26,95,255,.18); border-color: rgba(26,95,255,.4); }
    .gf-bubble .who { font-weight: 600; opacity: .9; margin-bottom: 4px; }
  .gf-input { width: 100%; max-width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.14); background: rgba(11,14,20,.6); color: #e6e6e6; }
    #gf-bottom-ask.gf-btn { height: 34px; padding: 6px 10px; align-self: stretch; }
  .gf-suggestions { display:flex; gap:8px; flex-wrap: wrap; margin: 0 0 4px 0; }
  .gf-suggestion { font-size: 12px; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(188,170,255,.25); background: rgba(255,255,255,.06); cursor: pointer; color:#ffffff; }
  .gf-suggestion:hover { background: rgba(255,255,255,.12); }
  /* dblclick Ask FAB removed */
    .gf-md ul { padding-left: 18px; margin: 8px 0; }
    .gf-md ol { padding-left: 18px; margin: 8px 0; }
    .gf-md li { margin: 4px 0; }
  .gf-md { writing-mode: horizontal-tb; }
  .gf-md * { writing-mode: horizontal-tb; }
  .gf-md p { margin: 8px 0; white-space: normal; overflow-wrap: anywhere; word-break: normal; display: block !important; width: auto !important; max-width: 100% !important; }
    .gf-md code { background: rgba(255,255,255,.08); padding: 2px 4px; border-radius: 6px; }
    .gf-md pre { background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.08); padding: 10px; border-radius: 10px; overflow: auto; }
  .gf-chat-log { display: flex; flex-direction: column; gap: 8px; }
  /* Theme variants */
  .gf-sidebar.gf-theme-violet { --gf-accent:#6d5ef3; --gf-accent-shadow: rgba(109,94,243,.25); --gf-bg1: rgba(28,18,49,.95); --gf-bg2: rgba(19,13,36,.95); --gf-border: rgba(160,140,230,.22); }
  .gf-sidebar.gf-theme-teal { --gf-accent:#19c7b9; --gf-accent-shadow: rgba(25,199,185,.25); --gf-bg1: rgba(10,24,28,.95); --gf-bg2: rgba(8,18,22,.95); --gf-border: rgba(40,160,170,.25); }
  .gf-sidebar.gf-theme-sand { --gf-accent:#f0b56f; --gf-accent-shadow: rgba(240,181,111,.25); --gf-bg1: rgba(44,33,20,.95); --gf-bg2: rgba(27,21,14,.95); --gf-border: rgba(180,150,110,.28); }
  .gf-sidebar.gf-theme-forest { --gf-accent:#4cc38a; --gf-accent-shadow: rgba(76,195,138,.25); --gf-bg1: rgba(10,28,22,.95); --gf-bg2: rgba(6,20,16,.95); --gf-border: rgba(90,200,160,.22); }
  /* Output font-size options */
  .gf-sidebar.gf-font-s .gf-md, .gf-sidebar.gf-font-s .gf-bubble { font-size: 13px; }
  .gf-sidebar.gf-font-m .gf-md, .gf-sidebar.gf-font-m .gf-bubble { font-size: 14px; }
  .gf-sidebar.gf-font-l .gf-md, .gf-sidebar.gf-font-l .gf-bubble { font-size: 16px; }
  `;
  document.head.appendChild(style);
}

function extractVisibleText(): string {
  const filter: NodeFilter = {
    acceptNode(node: Node): number {
      const t = node.textContent?.trim();
      if (!t) return NodeFilter.FILTER_REJECT;
      const parent = (node as Node & { parentElement?: HTMLElement | null }).parentElement ?? null;
      const style = parent ? getComputedStyle(parent) : null;
      if (!style || style.visibility === "hidden" || style.display === "none")
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  } as NodeFilter;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, filter);
  const parts: string[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent?.trim();
    if (text) parts.push(text);
    node = walker.nextNode();
  }
  return parts.join("\n");
}

let cachedText: string | null = null;
let selectionCache: { text: string } | null = null;
let SAVE_CHATS = false;
let BOTTOM_CHAT_PREF = true;

function getPageText(): string {
  if (!cachedText) {
    cachedText = extractVisibleText().slice(0, 20000); // cache trimmed to reduce lag
  }
  return cachedText;
}

function ensureSidebar(): HTMLDivElement {
  injectStyles();
  let el = document.getElementById("gistflow-sidebar") as HTMLDivElement | null;
  if (el) { el.classList.remove('gf-hidden'); return el; }
  el = document.createElement("div");
  el.id = "gistflow-sidebar";
  el.className = "gf-sidebar";
  el.innerHTML = `
    <div class="gf-header">
      <div class="gf-title">Gistflow</div>
      <div class="gf-spacer"></div>
      <button id="gf-collapse" class="gf-btn gf-collapse" title="Collapse"><span id="gf-collapse-icon">❯</span></button>
      <button id="gf-close" class="gf-btn gf-close" title="Close" aria-label="Close">×</button>
    </div>
    <div class="gf-tabs" id="gf-tabs" style="display:none">
      <button class="gf-btn" id="gf-summary">Summary</button>
      <button class="gf-btn" id="gf-points">Key Points</button>
      <button class="gf-btn" id="gf-actions">Actions</button>
      <button class="gf-btn" id="gf-chat">Chat</button>
    </div>
    <div id="gf-main" class="gf-main"></div>
    <div class="gf-chatbar" id="gf-bottom-chat">
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
        <div class="gf-suggestions" id="gf-suggest"></div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input id="gf-bottom-q" class="gf-input" placeholder="Ask about this page…" />
          <button id="gf-bottom-ask" class="gf-btn">Ask</button>
        </div>
      </div>
    </div>
    <div class="gf-actionbar" id="gf-actionbar"></div>
  `;
  el.querySelector<HTMLButtonElement>("#gf-close")!.onclick = () => el?.classList.add('gf-hidden');
  el.querySelector<HTMLButtonElement>("#gf-collapse")!.onclick = () => {
    el?.classList.toggle("collapsed");
    const icon = el?.querySelector<HTMLSpanElement>("#gf-collapse-icon");
    const isLeft = el?.classList.contains('gf-left');
    const isCollapsed = el?.classList.contains("collapsed");
    if (icon) icon.textContent = isCollapsed ? (isLeft ? "❯" : "❮") : (isLeft ? "❮" : "❯");
  };
  document.documentElement.appendChild(el);
  try {
    chrome.storage?.sync?.get({ GF_SIDE: 'right' }, (r: { GF_SIDE: 'left' | 'right' }) => {
      if (r.GF_SIDE === 'left') el?.classList.add('gf-left');
      else el?.classList.remove('gf-left');
      const icon = el?.querySelector<HTMLSpanElement>("#gf-collapse-icon");
      if (icon) icon.textContent = el?.classList.contains('gf-left') ? '❮' : '❯';
    });
    chrome.storage?.sync?.get({ GF_BOTTOM_CHAT: true }, (r: { GF_BOTTOM_CHAT: boolean }) => {
      BOTTOM_CHAT_PREF = !!r.GF_BOTTOM_CHAT;
      const bar = el?.querySelector('#gf-bottom-chat') as HTMLDivElement | null;
      if (bar) bar.style.display = BOTTOM_CHAT_PREF ? '' : 'none';
    });
    // Read save chats and shortcuts flags
    chrome.storage?.sync?.get({ GF_SAVE_CHATS: false, GF_SHORTCUTS: true }, (r: { GF_SAVE_CHATS: boolean; GF_SHORTCUTS: boolean }) => {
      SAVE_CHATS = !!r.GF_SAVE_CHATS;
      setShortcuts(r.GF_SHORTCUTS !== false);
    });
    chrome.storage?.sync?.get({ GF_THEME: 'violet' }, (r: { GF_THEME: 'violet' | 'teal' | 'sand' | 'forest' }) => {
      const themes = ['gf-theme-violet', 'gf-theme-teal', 'gf-theme-sand', 'gf-theme-forest'];
      themes.forEach(c => el?.classList.remove(c));
      el?.classList.add(`gf-theme-${r.GF_THEME}`);
    });
    // Apply font size preference
    chrome.storage?.sync?.get({ GF_FONT: 'm' }, (r: { GF_FONT: 's'|'m'|'l' }) => {
      ['gf-font-s','gf-font-m','gf-font-l'].forEach(c => el?.classList.remove(c));
      el?.classList.add(`gf-font-${r.GF_FONT}`);
    });
    chrome.storage?.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      if (changes.GF_BOTTOM_CHAT) {
        const v = changes.GF_BOTTOM_CHAT.newValue as boolean;
        BOTTOM_CHAT_PREF = !!v;
        const bar = el?.querySelector('#gf-bottom-chat') as HTMLDivElement | null;
        if (bar) {
          if (CURRENT_TAB === 'actions') bar.style.display = 'none';
          else if (CURRENT_TAB === 'chat') bar.style.display = '';
          else bar.style.display = BOTTOM_CHAT_PREF ? '' : 'none';
        }
      }
      if (changes.GF_SIDE) {
        const v = changes.GF_SIDE.newValue as 'left' | 'right';
        if (v === 'left') el?.classList.add('gf-left'); else el?.classList.remove('gf-left');
      }
      if (changes.GF_THEME) {
        const v = changes.GF_THEME.newValue as 'violet' | 'teal' | 'sand' | 'forest';
        const themes = ['gf-theme-violet', 'gf-theme-teal', 'gf-theme-sand', 'gf-theme-forest'];
        themes.forEach(c => el?.classList.remove(c));
        el?.classList.add(`gf-theme-${v}`);
      }
      if (changes.GF_FONT) {
        const v = changes.GF_FONT.newValue as 's'|'m'|'l';
        ['gf-font-s','gf-font-m','gf-font-l'].forEach(c => el?.classList.remove(c));
        el?.classList.add(`gf-font-${v}`);
      }
      if (changes.GF_SAVE_CHATS) {
        SAVE_CHATS = !!changes.GF_SAVE_CHATS.newValue as boolean;
      }
      if (changes.GF_SHORTCUTS) {
        setShortcuts(!!changes.GF_SHORTCUTS.newValue as boolean);
      }
    });
  } catch { /* noop */ }
  return el;
}

// Keyboard shortcuts setup/teardown
let shortcutsListener: ((e: KeyboardEvent) => void) | null = null;
function setShortcuts(enable: boolean) {
  if (shortcutsListener) {
    window.removeEventListener('keydown', shortcutsListener, true);
    shortcutsListener = null;
  }
  if (!enable) return;
  shortcutsListener = (e: KeyboardEvent) => {
    if (!e.altKey || e.repeat) return;
    const key = e.key.toLowerCase();
    // Alt+S — toggle sidebar
    if (key === 's') {
      e.preventDefault();
      const el = document.getElementById('gistflow-sidebar');
      if (el && !el.classList.contains('gf-hidden')) el.classList.add('gf-hidden');
      else ensureSidebar();
      return;
    }
    // Alt+C — open Chat
    if (key === 'c') {
      e.preventDefault();
      ensureSidebar(); setActive('chat'); runChat();
      return;
    }
    // Alt+L — toggle left/right side
    if (key === 'l') {
      e.preventDefault();
      const el = ensureSidebar();
      const nowLeft = !el.classList.contains('gf-left');
      if (nowLeft) el.classList.add('gf-left'); else el.classList.remove('gf-left');
      try { chrome.storage?.sync?.set({ GF_SIDE: nowLeft ? 'left' : 'right' }); } catch { /* noop */ }
      return;
    }
  };
  window.addEventListener('keydown', shortcutsListener, true);
}

// Chat persistence helpers
type ChatMsg = { who: 'You' | 'GistAI'; text: string; ts: number };
async function persistChatMessage(who: 'You' | 'GistAI', text: string) {
  const host = location.hostname;
  try {
  const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ GF_CHATS: {} }, resolve)) as { GF_CHATS?: Record<string, ChatMsg[]> };
  const all = store?.GF_CHATS || {} as Record<string, ChatMsg[]>;
    const arr: ChatMsg[] = Array.isArray(all[host]) ? all[host] : [];
    arr.push({ who, text, ts: Date.now() });
    while (arr.length > 50) arr.shift();
    all[host] = arr;
    chrome.storage?.local?.set({ GF_CHATS: all });
  } catch { /* ignore */ }
}

async function loadAndRenderChatHistory() {
  const host = location.hostname;
  try {
  const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ GF_CHATS: {} }, resolve)) as { GF_CHATS?: Record<string, ChatMsg[]> };
  const arr: ChatMsg[] = (store?.GF_CHATS && store.GF_CHATS[host]) ? store.GF_CHATS[host] : [];
    const log = document.getElementById('gf-chat-log') as HTMLDivElement | null;
    if (!log) return;
    for (const m of arr) {
      const wrap = document.createElement('div');
      wrap.className = 'gf-chat-row ' + (m.who === 'You' ? 'me' : 'ai');
      const bubble = document.createElement('div');
      bubble.className = 'gf-bubble' + (m.who === 'You' ? ' me' : '');
      bubble.innerHTML = `<div class="who">${m.who}</div>${renderMarkdown(m.text)}`;
      wrap.appendChild(bubble);
      log.appendChild(wrap);
    }
    log.scrollTop = log.scrollHeight;
  } catch { /* ignore */ }
}

// Actions outputs persistence (simple rolling log)
async function persistActionOutput(kind: SiteKind, text: string) {
  const host = location.hostname;
  try {
  const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ GF_ACTIONS: {} }, resolve)) as { GF_ACTIONS?: Record<string, Array<{ kind: SiteKind; text: string; ts: number }>> };
  const all = store?.GF_ACTIONS || {} as Record<string, Array<{ kind: SiteKind; text: string; ts: number }>>;
    const arr: Array<{ kind: SiteKind; text: string; ts: number }> = Array.isArray(all[host]) ? all[host] : [];
    arr.push({ kind, text, ts: Date.now() });
    while (arr.length > 50) arr.shift();
    all[host] = arr;
    chrome.storage?.local?.set({ GF_ACTIONS: all });
  } catch { /* ignore */ }
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]!));
}

function getToneFromStorage(): Promise<"professional" | "friendly" | "concise" | "casual"> {
  return new Promise((resolve) => {
    try {
      chrome.storage?.sync?.get({ GF_TONE: "concise" }, (res: { GF_TONE: "professional" | "friendly" | "concise" | "casual" }) => {
        resolve(res.GF_TONE);
      });
    } catch {
      resolve("concise");
    }
  });
}

// Minimal inline markdown renderer (lists, paragraphs, bold/italic, code)
function renderMarkdown(md: string): string {
  const esc = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // Handle fenced code blocks
  const segments: Array<{ type: 'code' | 'text'; content: string }> = [];
  const fence = /```([\s\S]*?)```/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = fence.exec(md))) {
    if (m.index > last) segments.push({ type: 'text', content: md.slice(last, m.index) });
    segments.push({ type: 'code', content: m[1] });
    last = m.index + m[0].length;
  }
  if (last < md.length) segments.push({ type: 'text', content: md.slice(last) });

  const html: string[] = [];
  for (const seg of segments) {
    if (seg.type === 'code') {
      html.push(`<pre><code>${esc(seg.content)}</code></pre>`);
      continue;
    }
    const lines = seg.content.split(/\r?\n/);
    let inUL = false; let inOL = false;
    const closeLists = () => {
      if (inUL) { html.push('</ul>'); inUL = false; }
      if (inOL) { html.push('</ol>'); inOL = false; }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { closeLists(); continue; }
      const ulMatch = /^[-*]\s+(.+)$/.exec(line);
      const olMatch = /^(\d+)\.\s+(.+)$/.exec(line);
      if (ulMatch) {
        const text = ulMatch[1];
        if (!inUL) { closeLists(); html.push('<ul>'); inUL = true; }
        html.push(`<li>${esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')}</li>`);
      } else if (olMatch) {
        const text = olMatch[2];
        if (!inOL) { closeLists(); html.push('<ol>'); inOL = true; }
        html.push(`<li>${esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')}</li>`);
      } else {
        closeLists();
        const t = esc(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
        html.push(`<p>${t}</p>`);
      }
    }
    closeLists();
  }
  return `<div class="gf-md">${html.join("\n")}</div>`;
}

// Context-aware Actions
type SiteKind = 'gmail' | 'github' | 'stackoverflow' | 'docs' | 'shopping' | 'generic';

function detectSite(): SiteKind {
  const h = location.host.toLowerCase();
  if (h.includes('mail.google.')) return 'gmail';
  if (h.includes('github.com')) return 'github';
  if (h.includes('stackoverflow.com') || h.includes('stackexchange.com')) return 'stackoverflow';
  if (/(docs|developer|dev|readthedocs|learn\.microsoft|kubernetes\.io|aws\.amazon\.com|cloudflare\.com|mozilla\.org)/.test(h)) return 'docs';
  if (/(amazon\.|flipkart\.|bestbuy\.com|walmart\.com|ebay\.)/.test(h)) return 'shopping';
  return 'generic';
}

function collectContextForSite(kind: SiteKind): string {
  try {
    if (kind === 'gmail') {
      const parts: string[] = [];
      document.querySelectorAll('.a3s, [data-message-id], [role="listitem"]').forEach(el => {
        const t = (el as HTMLElement).innerText?.trim();
        if (t && t.length > 30) parts.push(t);
      });
      if (parts.length) return parts.join('\n\n').slice(0, 8000);
    } else if (kind === 'github') {
      const sel = document.querySelectorAll('.js-issue-title, .markdown-body, .comment-body, .js-comment-body');
      const parts: string[] = [];
      sel.forEach(el => { const t = (el as HTMLElement).innerText?.trim(); if (t && t.length > 30) parts.push(t); });
      if (parts.length) return parts.join('\n\n').slice(0, 8000);
    } else if (kind === 'stackoverflow' || kind === 'docs') {
      const sel = document.querySelectorAll('#question .s-prose, .answercell .s-prose, .postcell .s-prose, article, .markdown, .docs-content, .content');
      const parts: string[] = [];
      sel.forEach(el => { const t = (el as HTMLElement).innerText?.trim(); if (t && t.length > 30) parts.push(t); });
      if (parts.length) return parts.join('\n\n').slice(0, 8000);
    } else if (kind === 'shopping') {
      const title = (document.querySelector('#productTitle, h1') as HTMLElement | null)?.innerText?.trim() || '';
      const specs = Array.from(document.querySelectorAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, table tr'))
        .slice(0, 40)
        .map(tr => {
          const cells = Array.from(tr.children).map(td => (td as HTMLElement).innerText.trim());
          return cells.join(': ');
        })
        .filter(Boolean)
        .join('\n');
      const reviews = Array.from(document.querySelectorAll('[data-hook="review-body"], .review-text-content'))
        .slice(0, 10)
        .map(el => (el as HTMLElement).innerText.trim())
        .join('\n\n');
      const base = [title, specs, reviews].filter(Boolean).join('\n\n');
      if (base) return base.slice(0, 8000);
    }
  } catch { /* ignore */ }
  return getPageText().slice(0, 8000);
}

function keywordSuggestions(text: string, max = 3): string[] {
  const stop = new Set(['the','and','for','with','that','this','you','your','are','was','have','has','will','from','but','not','they','them','their','our','we','i','a','an','to','of','in','on','at','is','it','as','be','or','by','if','so','can','could','would','should','about','regarding','regards','thanks','thank','hi','hello','dear','please','let','know']);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !stop.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return Array.from(freq.entries()).sort((a,b) => b[1]-a[1]).slice(0, max).map(([w]) => w);
}

function findEditableTargets(): Array<HTMLElement> {
  const nodes: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>('textarea, [contenteditable="true"], div[role="textbox"]').forEach(el => {
    if (!el.closest('#gistflow-sidebar') && (el.offsetParent !== null || el === document.activeElement)) nodes.push(el);
  });
  return nodes;
}

function insertIntoSite(kind: SiteKind, text: string): boolean {
  const targets = findEditableTargets();
  // Prefer Gmail compose box when on gmail
  if (kind === 'gmail') {
    const gmail = Array.from(document.querySelectorAll<HTMLElement>('div[aria-label="Message Body"], div[role="textbox"][aria-label]')).find(el => el.isContentEditable);
    if (gmail) {
      gmail.focus();
  try { document.execCommand('insertText', false, text); return true; } catch (err) { void err; /* ignore insertText failure */ }
      gmail.innerText = (gmail.innerText || '') + (gmail.innerText ? '\n\n' : '') + text;
      return true;
    }
  }
  // Otherwise use first visible textarea/contenteditable
  if (targets.length) {
    const el = targets[0];
    if ((el as HTMLTextAreaElement).value !== undefined) {
      const ta = el as HTMLTextAreaElement;
      const start = ta.selectionStart ?? ta.value.length; const end = ta.selectionEnd ?? ta.value.length;
      ta.setRangeText(text, start, end, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    if (el.isContentEditable) {
      el.focus();
  try { document.execCommand('insertText', false, text); return true; } catch (err) { void err; /* ignore insertText failure */ }
      el.innerHTML += `<p>${text.replace(/\n/g,'<br/>')}</p>`;
      return true;
    }
  }
  return false;
}

function runActions() {
  const kind = detectSite();
  const ctx = collectContextForSite(kind);
  const main = document.getElementById('gf-main')!;
  const bar = document.getElementById('gf-bottom-chat') as HTMLDivElement | null;
  if (bar) bar.style.display = 'none';
  const actionbar = document.getElementById('gf-actionbar') as HTMLDivElement | null;
  if (actionbar) actionbar.style.display = 'flex';

  const renderGmail = () => {
    // Push UI near bottom
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:flex-end;gap:10px;">
        <div id="gf-act-out" style="margin-bottom:6px;"></div>
        <div class="gf-panel" style="display:flex;flex-direction:column;gap:8px;">
          <div class="gf-note">Context: <strong>Gmail</strong>. Enter 3–5 keywords to guide the draft.</div>
          <div id="gf-act-suggest" class="gf-suggestions"></div>
          <input id="gf-act-kw" class="gf-input" placeholder="Write your keywords here (Gmail thread)…" />
        </div>
      </div>
    `;
    const kwEl = document.getElementById('gf-act-kw') as HTMLInputElement;
    const out = document.getElementById('gf-act-out') as HTMLDivElement;
    const sugg = document.getElementById('gf-act-suggest') as HTMLDivElement;

    const seeds = keywordSuggestions(ctx, 3);
    if (seeds.length && sugg) {
      sugg.innerHTML = '';
      for (const s of seeds) {
        const b = document.createElement('button');
        b.className = 'gf-suggestion'; b.textContent = s;
        b.onclick = () => {
          const parts = kwEl.value.split(',').map(v => v.trim()).filter(Boolean);
          if (!parts.includes(s)) parts.push(s);
          kwEl.value = parts.join(', ');
        };
        sugg.appendChild(b);
      }
    }

    const buildPrompt = (k: string) => {
      const keys = k.trim();
      return `Compose a professional, friendly email reply based on the thread context below. Incorporate these keywords: ${keys || '(none)'}.
Respond succinctly, include a greeting and optional bullet points, and end with a sign-off. Output only the email body.`;
    };

    // Populate bottom actionbar
    if (actionbar) {
      actionbar.innerHTML = `
        <button id="gf-act-gen" class="gf-btn primary wide">🪄 Generate</button>
        <button id="gf-act-copy" class="gf-btn" disabled>Copy</button>
        <button id="gf-act-insert" class="gf-btn" disabled>Insert</button>
      `;
      const gen = document.getElementById('gf-act-gen') as HTMLButtonElement;
      const copyBtn = document.getElementById('gf-act-copy') as HTMLButtonElement;
      const insertBtn = document.getElementById('gf-act-insert') as HTMLButtonElement;
      gen.onclick = async () => {
        out.innerHTML = `<div class="gf-note">Generating…</div>`;
        copyBtn.disabled = true; insertBtn.disabled = true; gen.disabled = true;
        try {
          const tone = await getToneFromStorage();
          const prompt = buildPrompt(kwEl.value) + `\n\nTone: ${tone}.`;
          const a = await ask(prompt, ctx);
          out.innerHTML = renderMarkdown(a);
          if (SAVE_CHATS) { await persistActionOutput(kind, a); }
          copyBtn.disabled = false; insertBtn.disabled = false;
          copyBtn.onclick = async () => { try { await navigator.clipboard.writeText(a); copyBtn.textContent = 'Copied'; setTimeout(()=>copyBtn.textContent='Copy', 1200); } catch (err) { void err; } };
          insertBtn.textContent = 'Insert';
          insertBtn.onclick = () => {
            const ok = insertIntoSite('gmail', a);
            if (!ok) { copyBtn.click(); insertBtn.textContent = 'Copied'; setTimeout(()=>insertBtn.textContent='Insert', 1200); }
          };
        } catch (e: unknown) {
          out.innerHTML = `<div class="gf-error">${escapeHtml(e instanceof Error ? e.message : String(e))}</div>`;
        } finally { gen.disabled = false; }
      };
    }
  };

  const renderGithub = () => {
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:flex-end;gap:10px;">
      <div class="gf-panel" style="display:flex;flex-direction:column;gap:10px;">
        <div class="gf-note">Context: <strong>GitHub</strong></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="gf-gh-sum" class="gf-btn">Summarize this issue</button>
          <button id="gf-gh-reply" class="gf-btn primary">Generate a reply draft</button>
        </div>
        <div id="gf-gh-form" style="display:none;gap:8px;flex-direction:column;">
          <label class="gf-note">My intention:</label>
          <select id="gf-gh-intent" class="gf-input">
            <option>Asking a question</option>
            <option>Requesting changes</option>
            <option>Approving (LGTM)</option>
          </select>
          <label class="gf-note">Key points:</label>
          <input id="gf-gh-kp" class="gf-input" placeholder="e.g., typo on line 45, needs test case" />
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="gf-gh-gen" class="gf-btn primary">Generate</button>
            <button id="gf-act-copy" class="gf-btn" disabled>Copy</button>
            <button id="gf-act-insert" class="gf-btn" disabled>Insert</button>
          </div>
        </div>
      </div>
      <div id="gf-act-out" style="margin-top:10px;"></div>
      </div>
    `;
    const out = document.getElementById('gf-act-out') as HTMLDivElement;
    const btnSum = document.getElementById('gf-gh-sum') as HTMLButtonElement;
    const btnReply = document.getElementById('gf-gh-reply') as HTMLButtonElement;
    const form = document.getElementById('gf-gh-form') as HTMLDivElement;
    const copyBtn = document.getElementById('gf-act-copy') as HTMLButtonElement;
    const insertBtn = document.getElementById('gf-act-insert') as HTMLButtonElement;
    const gen = document.getElementById('gf-gh-gen') as HTMLButtonElement;
    const intent = document.getElementById('gf-gh-intent') as HTMLSelectElement;
    const kp = document.getElementById('gf-gh-kp') as HTMLInputElement;

    btnSum.onclick = async () => {
      out.innerHTML = `<div class="gf-note">Summarizing…</div>`;
      try {
        const a = await ask('Summarize the following GitHub issue/PR discussion in 5-7 bullet points with clear sections.', ctx);
  out.innerHTML = renderMarkdown(a);
        copyBtn.disabled = false; insertBtn.disabled = false;
        copyBtn.onclick = async () => { try { await navigator.clipboard.writeText(a); copyBtn.textContent = 'Copied'; setTimeout(()=>copyBtn.textContent='Copy', 1200); } catch (err) { void err; } };
        insertBtn.textContent = 'Insert';
        insertBtn.onclick = () => { if (!insertIntoSite('github', a)) { copyBtn.click(); } };
      } catch (e) { out.innerHTML = `<div class="gf-error">${escapeHtml(String((e as Error)?.message || e))}</div>`; }
    };

    btnReply.onclick = () => { form.style.display = 'flex'; };
    gen.onclick = async () => {
      out.innerHTML = `<div class="gf-note">Generating…</div>`;
      copyBtn.disabled = true; insertBtn.disabled = true; gen.disabled = true;
      try {
        const tone = await getToneFromStorage();
        const prompt = `Draft a ${intent.value.toLowerCase()} comment for GitHub based on the context below. Address these key points: ${kp.value || '(none)'}.
Keep it concise, actionable, and respectful. Tone: ${tone}.`;
        const a = await ask(prompt, ctx);
        out.innerHTML = renderMarkdown(a);
        copyBtn.disabled = false; insertBtn.disabled = false;
        copyBtn.onclick = async () => { try { await navigator.clipboard.writeText(a); copyBtn.textContent = 'Copied'; setTimeout(()=>copyBtn.textContent='Copy', 1200); } catch (err) { void err; } };
        insertBtn.textContent = 'Insert';
        insertBtn.onclick = () => { if (!insertIntoSite('github', a)) { copyBtn.click(); } };
      } catch (e) { out.innerHTML = `<div class="gf-error">${escapeHtml(String((e as Error)?.message || e))}</div>`; }
      finally { gen.disabled = false; }
    };
  };

  const renderDocs = () => {
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:flex-end;gap:10px;">
      <div class="gf-panel" style="display:flex;flex-direction:column;gap:10px;">
        <div class="gf-note">Context: <strong>Documentation</strong></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="gf-doc-code" class="gf-btn">Extract all code snippets</button>
          <button id="gf-doc-explain" class="gf-btn">Explain this concept (like I'm 15)</button>
          <button id="gf-doc-steps" class="gf-btn">Convert to step-by-step list</button>
        </div>
      </div>
      <div id="gf-act-out" style="margin-top:10px;"></div>
      </div>
    `;
    const out = document.getElementById('gf-act-out') as HTMLDivElement;
    const btnCode = document.getElementById('gf-doc-code') as HTMLButtonElement;
    const btnExplain = document.getElementById('gf-doc-explain') as HTMLButtonElement;
    const btnSteps = document.getElementById('gf-doc-steps') as HTMLButtonElement;

    btnCode.onclick = () => {
      const blocks = Array.from(document.querySelectorAll('pre code, pre'))
        .map(el => (el as HTMLElement).innerText.trim())
        .filter(Boolean);
      const combined = blocks.map(b => `\n\n\`\`\`\n${b}\n\`\`\``).join('');
      out.innerHTML = renderMarkdown(combined || 'No code blocks found.');
      // Offer a quick copy of all code
      const copyAll = document.createElement('button');
      copyAll.className = 'gf-btn'; copyAll.textContent = 'Copy Code';
      copyAll.onclick = async () => { try { await navigator.clipboard.writeText(blocks.join('\n\n')); } catch (err) { void err; } };
      out.prepend(copyAll);
    };
    btnExplain.onclick = async () => {
      out.innerHTML = `<div class="gf-note">Explaining…</div>`;
      try { const a = await ask('Explain this content like I am 15. Be clear and use simple examples.', ctx); out.innerHTML = renderMarkdown(a); } catch (e) { out.innerHTML = `<div class=gf-error>${escapeHtml(String((e as Error)?.message || e))}</div>`; }
    };
    btnSteps.onclick = async () => {
      out.innerHTML = `<div class="gf-note">Converting…</div>`;
      try { const a = await ask('Convert the following content into a concise step-by-step list. Prefer numbered steps.', ctx); out.innerHTML = renderMarkdown(a); } catch (e) { out.innerHTML = `<div class=gf-error>${escapeHtml(String((e as Error)?.message || e))}</div>`; }
    };
  };

  const renderShopping = () => {
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;justify-content:flex-end;gap:10px;">
      <div class="gf-panel" style="display:flex;flex-direction:column;gap:10px;">
        <div class="gf-note">Context: <strong>Shopping</strong></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="gf-shop-rev" class="gf-btn">Summarize reviews (Pros & Cons)</button>
          <button id="gf-shop-spec" class="gf-btn">Extract product specifications</button>
        </div>
      </div>
      <div id="gf-act-out" style="margin-top:10px;"></div>
      </div>
    `;
    const out = document.getElementById('gf-act-out') as HTMLDivElement;
    const btnRev = document.getElementById('gf-shop-rev') as HTMLButtonElement;
    const btnSpec = document.getElementById('gf-shop-spec') as HTMLButtonElement;
    btnRev.onclick = async () => {
      out.innerHTML = `<div class="gf-note">Summarizing…</div>`;
      try { const a = await ask('From the reviews below, create a concise Pros & Cons list.', ctx); out.innerHTML = renderMarkdown(a); } catch (e) { out.innerHTML = `<div class=gf-error>${escapeHtml(String((e as Error)?.message || e))}</div>`; }
    };
    btnSpec.onclick = () => {
      const pairs: string[] = [];
      document.querySelectorAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, table tr').forEach(tr => {
        const cells = Array.from(tr.children).map(td => (td as HTMLElement).innerText.trim());
        if (cells.length >= 2) pairs.push(`- **${cells[0]}**: ${cells.slice(1).join(' ')}`);
      });
      out.innerHTML = renderMarkdown(pairs.join('\n') || 'No specifications found.');
    };
  };

  if (kind === 'gmail') renderGmail();
  else if (kind === 'github') renderGithub();
  else if (kind === 'stackoverflow' || kind === 'docs') renderDocs();
  else if (kind === 'shopping') renderShopping();
  else renderGmail(); // default to generator UI for generic pages
}

// Mount UI and bind
const ui = ensureSidebar();
const main = document.getElementById("gf-main")!;
const tabs = document.getElementById("gf-tabs")!;
let CURRENT_TAB: 'summary'|'points'|'actions'|'chat' = 'actions';
let summaryCacheHtml: string | null = null;
let pointsCacheHtml: string | null = null;
let summaryToken = 0;
let pointsToken = 0;

// Persistent cache per URL for Summary/Points
type CacheEntry = { html: string; ts: number };
type CacheStores = { GF_SUMMARY_CACHE?: Record<string, CacheEntry>; GF_POINTS_CACHE?: Record<string, CacheEntry> };
async function getCachedHtml(kind: 'summary'|'points'): Promise<string | null> {
  try {
    const key = kind === 'summary' ? 'GF_SUMMARY_CACHE' : 'GF_POINTS_CACHE';
    const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ [key]: {} }, resolve)) as CacheStores;
    const map = store?.[kind === 'summary' ? 'GF_SUMMARY_CACHE' : 'GF_POINTS_CACHE'];
    const url = location.href;
    const hit = map && map[url];
    return hit?.html || null;
  } catch { return null; }
}
async function setCachedHtml(kind: 'summary'|'points', html: string): Promise<void> {
  try {
    const key = kind === 'summary' ? 'GF_SUMMARY_CACHE' : 'GF_POINTS_CACHE';
    const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ [key]: {} }, resolve)) as CacheStores & Record<string, unknown>;
    const map = (store?.[key] || {}) as Record<string, CacheEntry>;
    map[location.href] = { html, ts: Date.now() };
    chrome.storage?.local?.set({ [key]: map });
  } catch { /* ignore */ }
}
async function clearCachedHtml(kind: 'summary'|'points'): Promise<void> {
  try {
    const key = kind === 'summary' ? 'GF_SUMMARY_CACHE' : 'GF_POINTS_CACHE';
    const store = await new Promise<unknown>((resolve) => chrome.storage?.local?.get({ [key]: {} }, resolve)) as CacheStores & Record<string, unknown>;
    const map = (store?.[key] || {}) as Record<string, CacheEntry>;
    delete map[location.href];
    chrome.storage?.local?.set({ [key]: map });
  } catch { /* ignore */ }
}

async function runSummary() {
  // Try persistent cache first
  const cached = await getCachedHtml('summary');
  if (cached) { summaryCacheHtml = cached; main.innerHTML = cached; bindCopy(); bindRefresh('summary'); return; }
  if (summaryCacheHtml) { main.innerHTML = summaryCacheHtml; bindCopy(); bindRefresh('summary'); return; }
  main.innerHTML = `<div class="gf-panel gf-note">Summarizing…</div>`;
  const text = getPageText();
  const my = ++summaryToken;
  summarize(text).then(async (tldr) => {
    if (my !== summaryToken) return; // a newer run superseded this one
    const html = `
      <div class="gf-toolbar">
        <button class="gf-btn" id="gf-copy">Copy</button>
        <button class="gf-btn" id="gf-refresh">Refresh</button>
      </div>
      <div class="gf-panel">${renderMarkdown(tldr)}</div>`;
    summaryCacheHtml = html;
    await setCachedHtml('summary', html);
    if (CURRENT_TAB === 'summary') { main.innerHTML = html; bindCopy(); bindRefresh('summary'); }
  }).catch(e => { if (my === summaryToken) { if (CURRENT_TAB === 'summary') renderError(e); } });
}

async function runPoints() {
  const cached = await getCachedHtml('points');
  if (cached) { pointsCacheHtml = cached; main.innerHTML = cached; bindCopy(); bindRefresh('points'); return; }
  if (pointsCacheHtml) { main.innerHTML = pointsCacheHtml; bindCopy(); bindRefresh('points'); return; }
  main.innerHTML = `<div class="gf-panel gf-note">Extracting key points…</div>`;
  const text = getPageText();
  const my = ++pointsToken;
  keyPoints(text).then(async (points) => {
    if (my !== pointsToken) return; // superseded
    const html = `
      <div class="gf-toolbar">
        <button class="gf-btn" id="gf-copy">Copy</button>
        <button class="gf-btn" id="gf-refresh">Refresh</button>
      </div>
      <div class="gf-panel">
        <div class="gf-list">
          ${points.map(p => `<div class="gf-row"><input class="gf-checkbox" type="checkbox"/> <div>${escapeHtml(p)}</div></div>`).join("")}
        </div>
      </div>`;
    pointsCacheHtml = html;
    await setCachedHtml('points', html);
    if (CURRENT_TAB === 'points') { main.innerHTML = html; bindCopy(); bindRefresh('points'); }
  }).catch(e => { if (my === pointsToken) { if (CURRENT_TAB === 'points') renderError(e); } });
}

function runChat() {
  // Render the chat log
  main.innerHTML = `<div id="gf-chat-log" class="gf-chat-log"></div>`;
  if (SAVE_CHATS) { void loadAndRenderChatHistory(); }
  // Render inline composer only if the bottom bar is not visible for any reason
  const bar = document.getElementById('gf-bottom-chat') as HTMLDivElement | null;
  const isVisible = !!bar && getComputedStyle(bar).display !== 'none';
  if (!isVisible) {
    const wrap = document.createElement('div');
    wrap.className = 'gf-panel';
    wrap.style.marginTop = '8px';
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="gf-suggestions" id="gf-inline-suggest"></div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input id="gf-inline-q" class="gf-input" placeholder="Ask about this page…" />
          <button id="gf-inline-ask" class="gf-btn">Ask</button>
        </div>
      </div>`;
    main.appendChild(wrap);
  const inlineAsk = wrap.querySelector('#gf-inline-ask') as HTMLButtonElement;
  const inlineQ = wrap.querySelector('#gf-inline-q') as HTMLInputElement;
  const log = document.getElementById('gf-chat-log') as HTMLDivElement | null;
    const append = (who: 'You'|'GistAI', text: string) => {
      if (!log) return;
      const row = document.createElement('div');
      row.className = 'gf-chat-row ' + (who === 'You' ? 'me' : 'ai');
      const bubble = document.createElement('div');
      bubble.className = 'gf-bubble' + (who === 'You' ? ' me' : '');
      bubble.innerHTML = `<div class="who">${who}</div>${renderMarkdown(text)}`;
      row.appendChild(bubble); log.appendChild(row); log.scrollTop = log.scrollHeight;
      if (SAVE_CHATS) void persistChatMessage(who, text);
    };
    const go = async () => {
      const q = inlineQ.value.trim(); if (!q) return;
      append('You', q); inlineQ.value = '';
      try { inlineAsk.disabled = true; const a = await ask(q, getPageText().slice(0,8000)); append('GistAI', a); }
      catch (e) { append('GistAI', e instanceof Error ? e.message : String(e)); }
      finally { inlineAsk.disabled = false; }
    };
    inlineAsk.onclick = () => { void go(); };
    inlineQ.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); void go(); } });
  }
}

function setActive(tab: 'summary' | 'points' | 'actions' | 'chat') {
  CURRENT_TAB = tab;
  ["gf-summary", "gf-points", "gf-actions", "gf-chat"].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle('active', id === `gf-${tab}`);
  });
  // Always show tabs when switching to a view explicitly
  const tabsEl = document.getElementById('gf-tabs');
  if (tabsEl) tabsEl.style.display = 'flex';
  // Toggle bottom chat bar depending on tab
  const bar = document.getElementById('gf-bottom-chat') as HTMLDivElement | null;
  const actionbar = document.getElementById('gf-actionbar') as HTMLDivElement | null;
  if (bar) {
    if (tab === 'actions') {
      bar.style.display = 'none';
      if (actionbar) actionbar.style.display = 'flex';
    } else if (tab === 'chat') {
      if (actionbar) actionbar.style.display = 'none';
      // Always show bar on Chat tab regardless of preference
      bar.style.display = '';
    } else {
      if (actionbar) actionbar.style.display = 'none';
      // Use stored preference to avoid flicker/duplication
      bar.style.display = BOTTOM_CHAT_PREF ? '' : 'none';
    }
  }
}

function showLauncher() {
  tabs.style.display = "none";
  main.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:32px;">
      <div class="gf-panel gf-btn" id="launch-summary" style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <span style="font-size:2em;">📝</span>
        <span>Summary</span>
      </div>
      <div class="gf-panel gf-btn" id="launch-points" style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <span style="font-size:2em;">📌</span>
        <span>Key Points</span>
      </div>
      <div class="gf-panel gf-btn" id="launch-actions" style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <span style="font-size:2em;">⚡</span>
        <span>Actions</span>
      </div>
      <div class="gf-panel gf-btn" id="launch-chat" style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <span style="font-size:2em;">💬</span>
        <span>Chat</span>
      </div>
    </div>
  `;
  ["launch-summary", "launch-points", "launch-actions", "launch-chat"].forEach(id => {
    main.querySelector(`#${id}`)?.addEventListener("click", () => {
      tabs.style.display = "flex";
      if (id === "launch-summary") { setActive('summary'); runSummary(); }
      if (id === "launch-points") { setActive('points'); runPoints(); }
      if (id === "launch-actions") { setActive('actions'); runActions(); }
      if (id === "launch-chat") { setActive('chat'); runChat(); }
    });
  });
}

ui.querySelector<HTMLButtonElement>("#gf-summary")!.onclick = () => { setActive('summary'); runSummary(); };
ui.querySelector<HTMLButtonElement>("#gf-points")!.onclick = () => { setActive('points'); runPoints(); };
ui.querySelector<HTMLButtonElement>("#gf-actions")!.onclick = () => { setActive('actions'); runActions(); };
ui.querySelector<HTMLButtonElement>("#gf-chat")!.onclick = () => { setActive('chat'); runChat(); };

// Show launcher on open
showLauncher();

// Helpers
function bindCopy() {
  const copyBtn = document.getElementById("gf-copy") as HTMLButtonElement | null;
  const pre = document.querySelector("#gf-main pre");
  const list = document.querySelectorAll("#gf-main .gf-row");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const text = pre?.textContent || Array.from(list).map(li => li.textContent?.trim() ?? "").join("\n");
      if (text) await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
    };
  }
}

function bindRefresh(kind?: 'summary'|'points') {
  const btn = document.getElementById('gf-refresh') as HTMLButtonElement | null;
  if (!btn || !kind) return;
  btn.onclick = async () => {
    // Clear persistent and in-memory cache and rerun
    await clearCachedHtml(kind);
    if (kind === 'summary') { summaryCacheHtml = null; runSummary(); }
    else { pointsCacheHtml = null; runPoints(); }
  };
}

// Persistent bottom chat bar handlers (single input source)
const bottomAsk = document.getElementById('gf-bottom-ask') as HTMLButtonElement | null;
const bottomQ = document.getElementById('gf-bottom-q') as HTMLInputElement | null;
if (bottomAsk && bottomQ) {
  const suggest = document.getElementById('gf-suggest') as HTMLDivElement | null;
  const ensureLog = () => {
    let log = document.getElementById('gf-chat-log') as HTMLDivElement | null;
    if (!log) {
      // Switch to Chat view and render log container
      setActive('chat');
      runChat();
      log = document.getElementById('gf-chat-log') as HTMLDivElement | null;
    }
    return log;
  };

  const setSuggestions = (q: string) => {
    if (!suggest) return;
    const s: { label: string; value: string }[] = [];
    if (q) {
      s.push({ label: 'Explain in simple terms', value: `Explain this in ${'concise'} terms.` });
      s.push({ label: 'Show key steps', value: 'List the key steps I should take.' });
    } else {
      s.push({ label: 'What is this page about?', value: 'What is this page about at a high level?' });
      s.push({ label: 'Key points', value: 'Give me key points from this page.' });
      s.push({ label: 'Summarize selection', value: 'Summarize the selected text briefly.' });
    }
    suggest.innerHTML = '';
    for (const item of s) {
      const b = document.createElement('button');
      b.className = 'gf-suggestion';
      b.textContent = item.label;
      b.onclick = () => { bottomQ.value = item.value; void goChat(); };
      suggest.appendChild(b);
    }
  };

  const append = (who: 'You' | 'GistAI', text: string) => {
    const log = ensureLog();
    if (!log) return;
    const wrap = document.createElement('div');
    wrap.className = 'gf-chat-row ' + (who === 'You' ? 'me' : 'ai');
    const bubble = document.createElement('div');
    bubble.className = 'gf-bubble' + (who === 'You' ? ' me' : '');
    bubble.innerHTML = `<div class="who">${who}</div>${renderMarkdown(text)}`;
    wrap.appendChild(bubble);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    if (SAVE_CHATS) void persistChatMessage(who, text);
  };

  const goChat = async () => {
    const q = bottomQ.value.trim();
    if (!q) return;
    append('You', q);
    bottomQ.value = '';
    const ctx = getPageText().slice(0, 8000);
    try {
      bottomAsk.disabled = true;
      const a = await ask(q, ctx);
      append('GistAI', a);
    } catch (e: unknown) {
      append('GistAI', e instanceof Error ? e.message : String(e));
    } finally {
      bottomAsk.disabled = false;
    }
  };

  bottomAsk.onclick = () => { void goChat(); };
  bottomQ.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      void goChat();
    }
  });

  // Update suggestions as user types
  bottomQ.addEventListener('input', () => setSuggestions(bottomQ.value));
  setSuggestions('');
}

function renderError(e: unknown) {
  const body = document.getElementById("gf-main")!;
  const msg = e instanceof Error ? e.message : String(e);
  if (/No on-device model and no API key set/i.test(msg)) {
    body.innerHTML = `
      <div class="gf-panel gf-error">
        <div style="margin-bottom:8px;">${escapeHtml(msg)}</div>
        <button class="gf-btn" id="gf-open-options">Open Options to set key</button>
      </div>`;
    const btn = document.getElementById("gf-open-options") as HTMLButtonElement | null;
    btn?.addEventListener("click", () => {
      if (typeof chrome?.runtime?.openOptionsPage === "function") {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
      }
    });
  } else {
    body.innerHTML = `<div class="gf-panel gf-error">Error: ${escapeHtml(msg)}</div>`;
  }
}

// highlight feature removed

// Capture current selection for context menu action
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const text = sel.toString();
    selectionCache = { text };
  }
});

// (removed) Double-click Ask FAB per request

// Listen for context menu "Ask GistAI" action via messages
try {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'GF_ASK_SELECTION') {
      const q = (selectionCache?.text || '').trim();
      const input = document.getElementById('gf-bottom-q') as HTMLInputElement | null;
      ensureSidebar();
      // Show tabs if hidden and activate chat
      const tabsEl = document.getElementById('gf-tabs');
      if (tabsEl) tabsEl.style.display = 'flex';
      setActive('chat');
      runChat();
      if (input) input.value = q || '';
      input?.focus();
    }
  });
} catch { /* noop */ }