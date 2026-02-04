import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import OpenAI from "openai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message } = (await req.json().catch(() => ({}))) as { message?: string };
  const input = (message ?? "").trim();
  if (!input) return NextResponse.json({ error: "missing message" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "server misconfigured: OPENAI_API_KEY missing" },
      { status: 500 }
    );
  }

  const client = new OpenAI({ apiKey });

  // Default: Swedish tone, but follow the user's language.
  const system =
    "Du är Nodi, Johans personliga assistent. Svara kort och sakligt, följ språket i användarens meddelande (svenska som default).";

  const resp = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: `User (${email}): ${input}`,
      },
    ],
  });

  const reply = resp.output_text?.trim() || "(tomt svar)";
  return NextResponse.json({ reply });
}
