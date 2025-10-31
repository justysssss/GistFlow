type GeminiPart = { text?: string };
type GeminiContent = { parts?: GeminiPart[] };
type GeminiCandidate = { content?: GeminiContent };
type GeminiResponse = { candidates?: GeminiCandidate[] };
export type Tone = "professional" | "friendly" | "concise" | "casual";

async function getApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    const resolveEnv = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined) || undefined;
      resolve(envKey ? envKey.trim() : null);
    };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chrome as any).storage?.sync?.get(["GEMINI_API_KEY"], (res: any) => {
        const fromStore = typeof res?.GEMINI_API_KEY === "string" ? res.GEMINI_API_KEY.trim() : "";
        if (fromStore) resolve(fromStore);
        else resolveEnv();
      });
    } catch {
      resolveEnv();
    }
  });
}

const hasAI = typeof (globalThis as unknown as { ai?: unknown }).ai !== "undefined";

export async function summarize(text: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAI = (globalThis as any).ai;
  if (hasAI && anyAI?.summarizer?.create) {
    try {
      const session = await anyAI.summarizer.create();
      return await session.summarize(text);
    } catch (e) {
      console.warn('On-device summarizer failed, falling back to Gemini', e);
    }
  }
  const key = await getApiKey();
  if (!key) throw new Error("No on-device model and no API key set.");
  const prompt = `Summarize the following page content into a concise TL;DR (5-7 bullet points):\n\n${text}`;
  return callGemini(prompt, key);
}

export async function keyPoints(text: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAI = (globalThis as any).ai;
  if (hasAI && anyAI?.languageModel?.create) {
    try {
      const lm = await anyAI.languageModel.create();
      const res = await lm.prompt(
        "Extract 5-8 key points as terse bullets. Return as lines prefixed with '-'.\n\n" + text
      );
      return String(res)
        .split("\n")
        .filter((l: string) => /^(?:-|\*|\d+\.)\s+/.test(l.trim()))
        .map((l: string) => l.replace(/^(?:-|\*|\d+\.)\s+/, "").trim());
    } catch (e) {
      console.warn('On-device keyPoints failed, falling back to Gemini', e);
    }
  }
  const key = await getApiKey();
  if (!key) throw new Error("No on-device model and no API key set.");
  const prompt = `Extract 5-8 key points as bullets from the content. Output just lines starting with '-'.\n\n${text}`;
  const out = await callGemini(prompt, key);
  return out
    .split("\n")
    .filter((l) => /^(?:-|\*|\d+\.)\s+/.test(l.trim()))
    .map((l) => l.replace(/^(?:-|\*|\d+\.)\s+/, "").trim());
}

export async function rewrite(text: string, tone: Tone): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAI = (globalThis as any).ai;
  if (hasAI && anyAI?.rewriter?.create) {
    try {
      const rw = await anyAI.rewriter.create();
      return await rw.rewrite({ text, style: { tone } });
    } catch (e) {
      console.warn('On-device rewriter failed, falling back to Gemini', e);
    }
  }
  const key = await getApiKey();
  if (!key) throw new Error("No on-device model and no API key set.");
  const prompt = `Rewrite the text in a ${tone} tone. Keep meaning, improve clarity.\n\n${text}`;
  return callGemini(prompt, key);
}

// Ask a question given page context
export async function ask(question: string, context: string): Promise<string> {
  // Try on-device language model first if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAI = (globalThis as any).ai;
  if (hasAI && anyAI?.languageModel?.create) {
    try {
      const lm = await anyAI.languageModel.create();
      const res = await lm.prompt(
        `You are a helpful assistant. Answer the question using ONLY the context when relevant.
Context:\n${context}\n\nQuestion: ${question}\nAnswer:`
      );
      return String(res);
    } catch (e) {
      console.warn('On-device ask failed, falling back to Gemini', e);
    }
  }
  const key = await getApiKey();
  if (!key) throw new Error("No on-device model and no API key set.");
  const prompt = `You are a helpful assistant. Answer the user question using ONLY the provided context if applicable.
Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;
  return callGemini(prompt, key);
}

async function callGemini(prompt: string, key: string): Promise<string> {
  const body = { contents: [{ parts: [{ text: prompt }] }] };

  // First, list available models from v1 and pick the best supported model.
  const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;
  const listResp = (await chrome.runtime.sendMessage({ type: 'GEMINI_FETCH', url: listUrl, method: 'GET', headers: {} })) as unknown as {
    ok: boolean; status?: number; statusText?: string; data?: unknown; error?: string;
  };
  if (!listResp?.ok) {
    const err = `(${listResp?.status ?? ''} ${listResp?.statusText ?? ''}) ${JSON.stringify(listResp?.data ?? listResp?.error ?? '', null, 2)}`;
    throw new Error(`Gemini list models failed: ${err}`);
  }

  // Models response shape: { models: [{ name: 'models/gemini-2.5-flash', ...}, ...] }
  const modelsData = listResp.data as { models?: Array<{ name?: string }> };
  const names = (modelsData.models || []).map(m => m.name || '').filter(Boolean);
  // Preference order
  const preferred = [
    'models/gemini-2.5-flash',
    'models/gemini-2.0-flash',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-latest',
  ];
  const chosenFull = preferred.find(p => names.includes(p)) || names.find(n => /gemini.*flash/i.test(n));
  if (!chosenFull) {
    throw new Error('No suitable Gemini model found (flash family). Check your API key project access.');
  }
  const chosenModel = chosenFull.replace(/^models\//, '');

  // Now call generateContent on v1 with the chosen model
  const url = `https://generativelanguage.googleapis.com/v1/models/${chosenModel}:generateContent?key=${encodeURIComponent(key)}`;
  const res = (await chrome.runtime.sendMessage({ type: 'GEMINI_FETCH', url, body })) as unknown as {
    ok: boolean; status?: number; statusText?: string; data?: unknown; error?: string;
  };
  if (!res?.ok) {
    const err = `(${res?.status ?? ''} ${res?.statusText ?? ''}) ${JSON.stringify(res?.data ?? res?.error ?? '', null, 2)}`;
    throw new Error(`Gemini request failed: ${err}`);
  }
  const data = res.data as GeminiResponse;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (text && text.trim()) return String(text).trim();
  throw new Error('Empty response text from Gemini');
}
