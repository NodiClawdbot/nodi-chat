"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data, status } = useSession();
  if (status === "loading") return null;

  if (!data?.user) {
    return (
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span>{(data.user as { email?: string }).email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
