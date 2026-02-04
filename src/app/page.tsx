"use client";

import Link from "next/link";
import { AuthButtons } from "./components/AuthButtons";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <h1>Nodi Chat</h1>
        <AuthButtons />
      </div>

      <p style={{ color: "#666" }}>
        Inloggad chat för Johan (Google + allowlist). Ingen historik sparas än.
      </p>

      <p>
        <Link href="/chat">Öppna chat →</Link>
      </p>
      <p>
        <Link href="/local-tools">Local tools →</Link>
      </p>
    </main>
  );
}
