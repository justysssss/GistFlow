chrome.runtime.onInstalled.addListener(() => {
  console.log("Gistflow installed");
  try {
    chrome.contextMenus?.create({ id: 'gf-ask-selection', title: 'Ask ✨GistAI', contexts: ['selection'] });
    chrome.contextMenus?.create({ id: 'gf-ask-page', title: 'Ask ✨GistAI about page', contexts: ['page'] });
  } catch { /* noop */ }
});

// Allow content script to open the options page via messaging (content scripts
// don't have access to chrome.runtime.openOptionsPage directly in some builds)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return true;
  }
  if (message && message.type === "GEMINI_FETCH") {
    const { url, body, method, headers } = message as { url: string; body?: unknown; method?: string; headers?: Record<string, string> };
    (async () => {
      try {
        const resp = await fetch(url, {
          method: method || "POST",
          headers: headers || { "Content-Type": "application/json" },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const text = await resp.text();
        let data: unknown = null;
        try { data = JSON.parse(text); } catch { /* keep text */ }
        if (!resp.ok) {
          sendResponse({ ok: false, status: resp.status, statusText: resp.statusText, data: data ?? text });
        } else {
          sendResponse({ ok: true, data: data ?? text });
        }
      } catch (e) {
        sendResponse({ ok: false, error: (e as Error).message });
      }
    })();
    return true; // async response
  }
});

// Context menu click handling
try {
  chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    if (info.menuItemId === 'gf-ask-selection') {
      // Ensure sidebar and focus chat, then let content script pick selection and send
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      } catch { /* might already be injected */ }
      chrome.tabs.sendMessage(tab.id, { type: 'GF_ASK_SELECTION' });
    }
    if (info.menuItemId === 'gf-ask-page') {
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      } catch { /* ignore */ }
      chrome.tabs.sendMessage(tab.id, { type: 'GF_ASK_SELECTION' });
    }
  });
} catch { /* noop */ }

// Keyboard shortcuts (via chrome.commands)
try {
  chrome.commands?.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const tabId = tab.id;

    // Small helpers executed in the page
    const ensureSidebar = async (): Promise<'present' | 'injected'> => {
      const [check] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => !!document.getElementById('gistflow-sidebar')
      });
      if (!check?.result) {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
        return 'injected';
      }
      return 'present';
    };

    if (command === 'toggle-sidebar') {
      const state = await ensureSidebar();
      if (state === 'present') {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const el = document.getElementById('gistflow-sidebar');
            if (!el) return;
            el.classList.toggle('gf-hidden');
          }
        });
      }
      return;
    }

    if (command === 'open-chat') {
      await ensureSidebar();
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const el = document.getElementById('gistflow-sidebar');
          if (!el) return;
          el.classList.remove('gf-hidden');
          const btn = document.getElementById('gf-chat') as HTMLButtonElement | null;
          if (btn) btn.click();
        }
      });
      return;
    }

    if (command === 'focus-mode') {
      await ensureSidebar();
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const el = document.getElementById('gistflow-sidebar');
          if (!el) return;
          el.classList.remove('gf-hidden');
          const btn = document.getElementById('gf-actions') as HTMLButtonElement | null;
          if (btn) btn.click();
        }
      });
      return;
    }

    if (command === 'toggle-side') {
      await ensureSidebar();
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const el = document.getElementById('gistflow-sidebar');
          if (!el) return;
          el.classList.toggle('gf-left');
        }
      });
      return;
    }
  });
} catch {
  // commands might be unavailable in some contexts; ignore
}
