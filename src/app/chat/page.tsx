"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;

    setText("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: t }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: t }),
    });

    const data = await res.json().catch(() => null);
    const reply = data?.reply ?? `Error (${res.status})`;

    setMessages((m) => [...m, { role: "assistant", text: reply }]);
    setBusy(false);
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Nodi Chat</h1>
      <p style={{ color: "#666" }}>
        Ingen historik sparas (än). Språk följer ditt meddelande (default: svenska).
      </p>

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
