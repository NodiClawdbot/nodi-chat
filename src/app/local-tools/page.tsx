"use client";

import useSWR from "swr";
import { useState } from "react";

const URL_KEY = "nodiBroker.url";
const KEY_KEY = "nodiBroker.key";

function getLS(k: string) {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(k) || "";
  } catch {
    return "";
  }
}

function setLS(k: string, v: string) {
  try {
    window.localStorage.setItem(k, v);
  } catch {}
}

const fetcher = async (url: string) => {
  const base = getLS(URL_KEY).replace(/\/$/, "");
  const key = getLS(KEY_KEY);
  const res = await fetch(base + url, {
    headers: key ? { "X-Nodi-Key": key } : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
};

export default function LocalToolsPage() {
  const [brokerUrl, setBrokerUrl] = useState(() => getLS(URL_KEY));
  const [brokerKey, setBrokerKey] = useState(() => getLS(KEY_KEY));

  const { data: health, error: healthErr, mutate } = useSWR(
    brokerUrl ? "/health" : null,
    fetcher,
    { refreshInterval: 0 }
  );

  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: tasks, error: tasksErr } = useSWR(
    brokerUrl ? `/obsidian/tasks-today?today=${today}` : null,
    fetcher
  );

  function save() {
    setLS(URL_KEY, brokerUrl.trim());
    setLS(KEY_KEY, brokerKey.trim());
    mutate();
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Local tools</h1>
      <p style={{ color: "#666" }}>
        Detta körs i din webbläsare och pratar med din Mac mini via Tailscale (tailnet-only).
      </p>

      <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
        <label>
          <div style={{ fontSize: 12, color: "#666" }}>Broker URL</div>
          <input
            value={brokerUrl}
            onChange={(e) => setBrokerUrl(e.target.value)}
            placeholder="https://mac-mini-....ts.net"
            style={{ width: "100%", padding: 10 }}
          />
        </label>
        <label>
          <div style={{ fontSize: 12, color: "#666" }}>X-Nodi-Key</div>
          <input
            value={brokerKey}
            onChange={(e) => setBrokerKey(e.target.value)}
            placeholder="(secret)"
            style={{ width: "100%", padding: 10 }}
          />
        </label>
        <div>
          <button onClick={save}>Spara</button>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2>Status</h2>
      {!brokerUrl ? (
        <p>Fyll i Broker URL + key först.</p>
      ) : healthErr ? (
        <p style={{ color: "crimson" }}>Health fel: {String(healthErr.message || healthErr)}</p>
      ) : health ? (
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p>Laddar…</p>
      )}

      <h2>Tasks (idag/försenade)</h2>
      {tasksErr ? (
        <p style={{ color: "crimson" }}>Tasks fel: {String(tasksErr.message || tasksErr)}</p>
      ) : tasks ? (
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(tasks, null, 2)}
        </pre>
      ) : (
        <p>Laddar…</p>
      )}
    </main>
  );
}
