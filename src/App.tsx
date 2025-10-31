import { useEffect, useMemo, useState } from 'react'
import './App.css'

type StorageState = {
  tone?: string
  hasStoredKey: boolean
}

function maskKey(key?: string) {
  if (!key) return 'not set'
  const trimmed = key.trim()
  if (!trimmed) return 'not set'
  const head = trimmed.slice(0, 4)
  const tail = trimmed.slice(-4)
  return `${head}…${tail} (len ${trimmed.length})`
}

export default function App() {
  // Access chrome API safely (works when this page is opened from the extension build, otherwise it's just undefined)
  const c = (typeof chrome !== 'undefined' ? chrome : undefined) as typeof chrome | undefined
  const isExtensionContext = !!c?.runtime?.id

  const [storage, setStorage] = useState<StorageState>({ hasStoredKey: false })

  const envKey = useMemo(() => {
    const k = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    return k?.trim() ? k : undefined
  }, [])

  useEffect(() => {
    let mounted = true
    if (c?.storage?.sync) {
      c.storage.sync.get(['GEMINI_API_KEY', 'GF_TONE'], (res: { GEMINI_API_KEY?: string; GF_TONE?: string }) => {
        if (!mounted) return
        setStorage({
          hasStoredKey: !!res?.GEMINI_API_KEY && String(res.GEMINI_API_KEY).trim().length > 0,
          tone: res?.GF_TONE || 'concise',
        })
      })
    }
    return () => {
      mounted = false
    }
  }, [c?.storage?.sync])

  const openOptions = () => {
    if (c?.runtime?.openOptionsPage) {
      c.runtime.openOptionsPage()
    } else {
      alert('Options page can be opened from the extension popup or chrome://extensions once the extension is loaded.')
    }
  }

  return (
    <div className="gf-dev gf-container">
      <h1 className="gf-title">Gistflow – Dev Home</h1>
      <p className="gf-muted">
        This page is for local development only. The real UI lives in the content sidebar, popup, and options pages of the extension.
      </p>

      <section className="gf-section">
        <h3>Status</h3>
        <ul>
          <li>
            Extension context: <strong>{isExtensionContext ? 'Yes' : 'No (running as a regular web page)'}</strong>
          </li>
          <li>
            Stored API key (chrome.storage): <strong>{storage.hasStoredKey ? 'present' : 'not set'}</strong>
          </li>
          <li>
            Env API key (VITE_GEMINI_API_KEY): <strong>{maskKey(envKey)}</strong>
          </li>
          <li>
            Preferred tone: <strong>{storage.tone || 'concise'}</strong>
          </li>
        </ul>
      </section>

      <section className="gf-section">
        <h3>Quick actions</h3>
        <div className="gf-actions">
          <button onClick={openOptions}>Open Options</button>
          <a href="chrome://extensions/" target="_blank" rel="noreferrer">
            <button>Open chrome://extensions</button>
          </a>
        </div>
      </section>

      <section className="gf-section">
        <h3>How to use</h3>
        <ol>
          <li>Build the extension and load the <em>dist</em> folder in chrome://extensions.</li>
          <li>Open any article/page, click the extension popup and then “Open Sidebar”.</li>
          <li>Use TL;DR, Key Points, or Focus. If on‑device AI isn’t available, the Gemini API fallback will be used.</li>
          <li>If you see an error about missing API key, click “Open Options” and paste your key. No rebuild needed.</li>
        </ol>
      </section>
    </div>
  )
}
