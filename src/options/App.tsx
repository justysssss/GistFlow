import { useEffect, useState } from "react";
import "./options.css";

export default function App() {
    const [tone, setTone] = useState("concise");
    const [key, setKey] = useState("");
    useEffect(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chrome as any).storage?.sync?.get(["GF_TONE", "GEMINI_API_KEY"], (res: any) => {
                if (res?.GF_TONE) setTone(res.GF_TONE);
                if (res?.GEMINI_API_KEY) setKey(res.GEMINI_API_KEY);
            });
        } catch {
            // noop
        }
    }, []);
    const save = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chrome as any).storage?.sync?.set({ GF_TONE: tone, GEMINI_API_KEY: key });
            alert("Saved");
        } catch (e) {
            alert("Failed to save: " + (e as Error).message);
        }
    };
    return (
        <div className="opt-container">
            <h3>Gistflow Settings</h3>
            <label>
                Tone:
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="concise">Concise</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                </select>
            </label>
            <div className="opt-spacer" />
            <label>
                Gemini API Key (fallback):
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="opt-input"
                />
            </label>
            <div className="opt-spacer" />
            <button onClick={save}>Save</button>
            <p className="opt-note">
                On-device AI is used when available. API key is only used as fallback.
            </p>
        </div>
    );
}
