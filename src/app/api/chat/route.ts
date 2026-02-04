import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message } = (await req.json().catch(() => ({}))) as { message?: string };
  if (!message) return NextResponse.json({ error: "missing message" }, { status: 400 });

  // Placeholder: we will call OpenAI here (key from Secret Manager) in next step.
  const reply = `OK (auth: ${email}). You said: ${message}`;

  return NextResponse.json({ reply });
}
