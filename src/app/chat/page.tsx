"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

type Model = "gpt-4.1-mini" | "gpt-4.1";
const MODEL_KEY = "nodiChat.model";
const MODELS: { id: Model; label: string }[] = [
  { id: "gpt-4.1-mini", label: "gpt-4.1-mini (snabb/billig)" },
  { id: "gpt-4.1", label: "gpt-4.1 (bättre)" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<Model>(() => {
    if (typeof window === "undefined") return "gpt-4.1-mini";
    try {
      const saved = window.localStorage.getItem(MODEL_KEY) as Model | null;
      if (saved && MODELS.some((m) => m.id === saved)) return saved;
    } catch {}
    return "gpt-4.1-mini";
  });

  // Persist model selection locally
  useEffect(() => {
    try {
      window.localStorage.setItem(MODEL_KEY, model);
    } catch {}
  }, [model]);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;

    setText("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: t }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: t, model }),
    });

    const data = await res.json().catch(() => null);
    const reply = data?.reply ?? data?.error ?? `Error (${res.status})`;

    setMessages((m) => [...m, { role: "assistant", text: reply }]);
    setBusy(false);
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Nodi Chat</h1>
          <p style={{ color: "#666", marginTop: 6 }}>
            Ingen historik sparas (än). Språk följer ditt meddelande (default: svenska).
          </p>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#666" }}>Modell</span>
          <select value={model} onChange={(e) => setModel(e.target.value as Model)} disabled={busy}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{m.role === "user" ? "Du" : "Nodi"}:</b> {m.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          style={{ flex: 1, padding: 10 }}
          placeholder="Skriv här…"
        />
        <button onClick={send} disabled={busy}>
          {busy ? "..." : "Skicka"}
        </button>
      </div>
    </main>
  );
}
