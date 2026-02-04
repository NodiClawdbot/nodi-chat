import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import OpenAI from "openai";
import { ALLOWED_MODELS, isAllowedModel } from "@/lib/models";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    message?: string;
    model?: string;
  };

  const input = (body.message ?? "").trim();
  if (!input) return NextResponse.json({ error: "missing message" }, { status: 400 });

  const model = isAllowedModel(body.model) ? body.model : "gpt-4.1-mini";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "server misconfigured: OPENAI_API_KEY missing" },
      { status: 500 }
    );
  }

  const client = new OpenAI({ apiKey });

  const system =
    "Du är Nodi, Johans personliga assistent. Svara kort och sakligt, följ språket i användarens meddelande (svenska som default).";

  try {
    const resp = await client.responses.create({
      model,
      input: [
        { role: "system", content: system },
        {
          role: "user",
          content: `User (${email}): ${input}`,
        },
      ],
    });

    const reply = resp.output_text?.trim() || "(tomt svar)";
    return NextResponse.json({ reply, model, allowedModels: ALLOWED_MODELS });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "OpenAI error";
    return NextResponse.json({ error: msg, model }, { status: 500 });
  }
}
