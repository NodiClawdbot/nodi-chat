export const ALLOWED_MODELS = [
  "gpt-4.1-mini",
  "gpt-4.1",
] as const;

export type AllowedModel = (typeof ALLOWED_MODELS)[number];

export function isAllowedModel(v: unknown): v is AllowedModel {
  return typeof v === "string" && (ALLOWED_MODELS as readonly string[]).includes(v);
}
