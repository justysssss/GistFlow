import { useEffect, useState } from "react";
import logo from "../assets/GistFlow_final.svg";
import "./popup.css";

type Tone = "professional" | "friendly" | "concise" | "casual";
type Side = "left" | "right";
type Theme = 'violet' | 'teal' | 'sand' | 'forest';

export default function App() {
    const [enabled, setEnabled] = useState<boolean>(false);
    const [tone, setTone] = useState<Tone>("concise");
    const [side, setSide] = useState<Side>("right");
    const [version, setVersion] = useState<string>("");
    const [mode, setMode] = useState<"main" | "settings" | "help">("main");
    const [apiKey, setApiKey] = useState<string>("");
    const [bottomChat, setBottomChat] = useState<boolean>(true);
    const [autoStartHere, setAutoStartHere] = useState<boolean>(false);
    const [theme, setTheme] = useState<Theme>('violet');
    const [savedTheme, setSavedTheme] = useState<Theme>('violet');
    const [saveChats, setSaveChats] = useState<boolean>(false);
    const [shortcutsEnabled, setShortcutsEnabled] = useState<boolean>(true);
    // highlight color removed
    const [toast, setToast] = useState<string>("");

    // Check if sidebar exists on the active tab
    const refreshEnabled = () => {
        chrome.tabs?.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab?.id) return;
            const [res] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const el = document.getElementById("gistflow-sidebar");
                    return !!(el && !el.classList.contains('gf-hidden'));
                },
            });
            setEnabled(Boolean(res?.result));
        });
    };

    useEffect(() => {
        refreshEnabled();
        // Load settings from storage
        try {
            chrome.storage?.sync?.get({ GF_TONE: "concise", GF_SIDE: "right", GEMINI_API_KEY: "", GF_BOTTOM_CHAT: true, GF_AUTOSTART_HOSTS: [], GF_THEME: 'violet', GF_SAVE_CHATS: false, GF_SHORTCUTS: true }, (r: { GF_TONE: Tone; GF_SIDE: Side; GEMINI_API_KEY: string; GF_BOTTOM_CHAT: boolean; GF_AUTOSTART_HOSTS: string[]; GF_THEME: Theme; GF_SAVE_CHATS: boolean; GF_SHORTCUTS: boolean }) => {
                setTone(r.GF_TONE);
                setSide(r.GF_SIDE);
                setApiKey(r.GEMINI_API_KEY || "");
                setBottomChat(Boolean(r.GF_BOTTOM_CHAT));
                setTheme(r.GF_THEME || 'violet');
                setSavedTheme(r.GF_THEME || 'violet');
                setSaveChats(Boolean(r.GF_SAVE_CHATS));
                setShortcutsEnabled(r.GF_SHORTCUTS !== false);
                // set autostart for current host if present
                chrome.tabs?.query({ active: true, currentWindow: true }, ([tab]) => {
                    const u = tab?.url ? new URL(tab.url) : null;
                    if (u && Array.isArray(r.GF_AUTOSTART_HOSTS)) {
                        setAutoStartHere(r.GF_AUTOSTART_HOSTS.includes(u.hostname));
                    }
                });
            });
        } catch {
            // ignore
        }
        // Version from manifest
        try { setVersion(chrome.runtime.getManifest?.().version || ""); } catch { /* noop */ }
    }, []);

    const turnOn = () => {
        chrome.tabs?.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab?.id) return;
            // Try to unhide if already present (after user closed via X)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const el = document.getElementById('gistflow-sidebar');
                    if (el) el.classList.remove('gf-hidden');
                    return !!el;
                }
            }).then(async ([res]) => {
                if (!res?.result && typeof tab.id === 'number') {
                    await chrome.scripting.executeScript({ target: { tabId: tab.id as number }, files: ["content.js"] });
                }
                setTimeout(refreshEnabled, 150);
            });
        });
    };

    const turnOff = () => {
        chrome.tabs?.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab?.id) return;
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const el = document.getElementById("gistflow-sidebar");
                    // Hide instead of removing to avoid re-injection guards/sentinels
                    if (el) el.classList.add('gf-hidden');
                },
            });
            setTimeout(refreshEnabled, 100);
        });
    };

    const openOptions = () => chrome.runtime.openOptionsPage?.();
    const openSettings = () => setMode('settings');
    const openHelp = () => setMode('help');
    const goBack = () => { setMode('main'); setTimeout(() => { try { const c = document.querySelector('.frosty') as HTMLElement | null; if (c) c.scrollTop = 0; } catch { /* noop */ } }, 0); };
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 1600);
    };

    const applyThemeToActiveTab = (t: Theme) => {
        chrome.tabs?.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab?.id) return;
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (theme: Theme) => {
                    const el = document.getElementById('gistflow-sidebar');
                    if (!el) return;
                    ['gf-theme-violet', 'gf-theme-teal', 'gf-theme-sand', 'gf-theme-forest'].forEach(c => el.classList.remove(c));
                    el.classList.add(`gf-theme-${theme}`);
                },
                args: [t]
            });
        });
    };

    const saveTone = (t: Tone) => {
        setTone(t);
        try {
            chrome.storage?.sync?.set({ GF_TONE: t });
        } catch {
            // ignore
        }
    };

    const saveSide = (s: Side) => {
        setSide(s);
        try { chrome.storage?.sync?.set({ GF_SIDE: s }); } catch {/* noop */ }
        // If sidebar exists on page, update its position immediately
        chrome.tabs?.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab?.id) return;
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (newSide: Side) => {
                    const el = document.getElementById('gistflow-sidebar');
                    if (!el) return;
                    if (newSide === 'left') el.classList.add('gf-left'); else el.classList.remove('gf-left');
                },
                args: [s]
            });
        });
    };

    return (
        <div className="gf-popup frosty">
            {/* Header (changes by mode) */}
            {mode === 'main' ? (
                <div className="gf-pop-header">
                    <img className="gf-logo" src={logo} alt="GistFlow" />
                    <span className="gf-title">Gistflow</span>
                    <div className="gf-spacer" />
                    <button className="gf-iconhelp" onClick={openHelp} title="Shortcuts">?</button>
                    <button className="gf-icongear" onClick={openSettings} title="Settings">⚙</button>
                </div>
            ) : (
                <div className="gf-pop-header">
                    <button className="gf-back" onClick={goBack} title="Back">←</button>
                    <span className="gf-title">{mode === 'settings' ? 'Settings' : 'Shortcuts'}</span>
                    <div className="gf-spacer" />
                </div>
            )}

            {/* Settings view */}
            {mode === 'settings' && (
                <div className="gf-body"><div className="gf-settings-card">
                    <div className="gf-row">
                        <div className="gf-row-title">Theme</div>
                        <div className="gf-theme-grid">
                            {(['violet', 'teal', 'sand', 'forest'] as Theme[]).map(th => (
                                <button key={th} className={`gf-card ${theme === th ? 'active' : ''}`} onClick={() => setTheme(th)}>
                                    <div className="gf-card-ico" aria-hidden>{th === 'violet' ? '💜' : th === 'teal' ? '🌊' : th === 'sand' ? '🏖️' : '🌲'}</div>
                                    <div className="gf-card-label">{th[0].toUpperCase() + th.slice(1)}</div>
                                </button>
                            ))}
                        </div>
                        <div className="gf-actions-inline">
                            <button className="gf-btn primary" onClick={() => { setSavedTheme(theme); try { chrome.storage?.sync?.set({ GF_THEME: theme }); } catch (err) { void err; } applyThemeToActiveTab(theme); showToast('Theme applied'); }}>OK</button>
                            <button className="gf-btn" onClick={() => { setTheme(savedTheme); showToast('Theme reset'); }}>Cancel</button>
                        </div>
                    </div>
                    <label className="gf-field">
                        <div className="gf-field-label">Gemini API Key</div>
                        <input
                            type="password"
                            placeholder="Enter API key"
                            className="gf-text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </label>
                    {/* highlight color settings removed */}
                    <label className="gf-switch">
                        <input type="checkbox" checked={bottomChat} onChange={(e) => {
                            const v = e.target.checked; setBottomChat(v);
                            try { chrome.storage?.sync?.set({ GF_BOTTOM_CHAT: v }); } catch { /* ignore */ }
                        }} />
                        <span>Show bottom chat bar</span>
                    </label>
                    <label className="gf-switch">
                        <input type="checkbox" checked={saveChats} onChange={(e) => {
                            const v = e.target.checked; setSaveChats(v);
                            try { chrome.storage?.sync?.set({ GF_SAVE_CHATS: v }); } catch { /* ignore */ }
                        }} />
                        <span>Save chats on this device</span>
                    </label>
                    <label className="gf-switch">
                        <input type="checkbox" checked={shortcutsEnabled} onChange={(e) => {
                            const v = e.target.checked; setShortcutsEnabled(v);
                            try { chrome.storage?.sync?.set({ GF_SHORTCUTS: v }); } catch { /* ignore */ }
                        }} />
                        <span>Enable keyboard shortcuts</span>
                    </label>
                    <label className="gf-switch">
                        <input type="checkbox" checked={autoStartHere} onChange={async (e) => {
                            const v = e.target.checked; setAutoStartHere(v);
                            chrome.tabs?.query({ active: true, currentWindow: true }, ([tab]) => {
                                const u = tab?.url ? new URL(tab.url) : null; if (!u) return;
                                chrome.storage?.sync?.get({ GF_AUTOSTART_HOSTS: [] }, (r: { GF_AUTOSTART_HOSTS: string[] }) => {
                                    const set = new Set(r.GF_AUTOSTART_HOSTS || []);
                                    if (v) set.add(u.hostname); else set.delete(u.hostname);
                                    try { chrome.storage?.sync?.set({ GF_AUTOSTART_HOSTS: Array.from(set) }); } catch { /* ignore */ }
                                });
                            });
                        }} />
                        <span>Autostart on this site</span>
                    </label>
                    <div className="gf-settings-actions">
                        <button
                            className="gf-btn primary"
                            onClick={() => {
                                try { chrome.storage?.sync?.set({ GEMINI_API_KEY: apiKey.trim() }); } catch { /* ignore */ }
                                showToast('Key saved');
                                goBack();
                            }}
                        >Save</button>
                        <button className="gf-btn ghost" onClick={openOptions}>Open full Options</button>
                    </div>
                    <div className="gf-note small">On-device AI when available; Gemini key used as fallback.</div>
                </div></div>
            )}

            {/* Help/Shortcuts view */}
            {mode === 'help' && (
                <div className="gf-body"><div className="gf-settings-card">
                    <ul className="gf-help-list">
                        <li><span className="k">Alt</span> + <span className="k">S</span> — Open/Close Sidebar</li>
                        <li><span className="k">Alt</span> + <span className="k">C</span> — Open Chat</li>
                        <li><span className="k">Alt</span> + <span className="k">L</span> — Toggle Left/Right</li>
                    </ul>
                    <div className="gf-note small">Tip: Use chrome extensions shortcuts to customize keys.</div>
                </div></div>
            )}

            {/* Main view */}
            {mode === 'main' && (
                <div className="gf-body">
                    {/* Side selector */}
                    <div className="gf-row">
                        <div className="gf-row-title">Sidebar Side</div>
                        <div className="gf-segment">
                            {(['left', 'right'] as Side[]).map(s => (
                                <button key={s} className={`gf-seg ${side === s ? 'active' : ''}`} onClick={() => saveSide(s)}>
                                    {s[0].toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone row */}
                    <div className="gf-row">
                        <div className="gf-row-title">Tone</div>
                        <div className="gf-tone-grid">
                            {(["concise", "friendly", "professional", "casual"] as Tone[]).map(t => (
                                <button key={t} className={`gf-card ${tone === t ? 'active' : ''}`} onClick={() => saveTone(t)}>
                                    <div className="gf-card-ico" aria-hidden>{
                                        t === 'concise' ? '🎯' : t === 'friendly' ? '🙂' : t === 'professional' ? '🧑‍💼' : '👍'
                                    }</div>
                                    <div className="gf-card-label">{t[0].toUpperCase() + t.slice(1)}</div>
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Primary CTA at bottom */}
                    <div className="gf-primary">
                        <button className={`gf-btn xl ${enabled ? 'ghost' : 'primary'}`} onClick={enabled ? turnOff : turnOn}>
                            {enabled ? 'Close Sidebar' : 'Open Sidebar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="gf-footer">
                <div className="gf-version">v{version || '—'}</div>
            </div>

            {/* Toast */}
            {toast && (<div className="gf-toast">{toast}</div>)}
        </div>
    );
}
