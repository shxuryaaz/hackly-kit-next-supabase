// the model, from server code only. hackly gives every build a key that works against hackly's ai helper;
// a team that wants unlimited ai sets OPENAI_API_KEY in vercel and this file talks to openai directly instead.
// usage, in a server action or route handler:
//   const text = await ask({ text: "summarise this lab note: ..." });
//   const data = await ask<{ topics: string[] }>({ text, schema: { type: "object", properties: { topics: { type: "array", items: { type: "string" } } }, required: ["topics"], additionalProperties: false } });
//   const what = await ask({ text: "what is in this photo?", images: [dataUrl], tier: "smart" });

export type Ask = {
  text: string;
  system?: string;
  images?: string[]; // data urls: data:image/png;base64,...
  audio?: { data: string; format: "mp3" | "wav" | "webm" | "m4a" }; // base64
  schema?: Record<string, unknown>; // json schema -> the answer is parsed json
  tier?: "cheap" | "smart"; // cheap by default; smart for the hard step of the demo
};

export class AiOutError extends Error {
  constructor(message: string, public spentPaise?: number, public allowancePaise?: number) { super(message); this.name = "AiOutError"; }
}

const MAX_BYTES = 6 * 1024 * 1024;

export async function ask<T = string>(q: Ask): Promise<T> {
  const body = JSON.stringify(q);
  if (body.length > MAX_BYTES) throw new Error("keep images and audio under 6 MB per call");
  if (process.env.OPENAI_API_KEY) return askOpenAI<T>(q);
  const url = process.env.HACKLY_AI_URL;
  const key = process.env.HACKLY_AI_KEY;
  if (!url || !key) throw new Error("no ai configured: set HACKLY_AI_URL + HACKLY_AI_KEY (hackly sets these) or OPENAI_API_KEY (your own)");
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body });
  const data = (await r.json().catch(() => ({}))) as { error?: string; text?: string; json?: T; spentPaise?: number; allowancePaise?: number };
  if (r.status === 402) throw new AiOutError(data.error ?? "ai allowance used up", data.spentPaise, data.allowancePaise);
  if (!r.ok) throw new Error(data.error ?? `ai helper answered ${r.status}`);
  return (q.schema ? data.json : data.text) as T;
}

// bring your own key: the same call straight to openai's responses api
async function askOpenAI<T>(q: Ask): Promise<T> {
  const model = q.tier === "smart" ? (process.env.OPENAI_MODEL_SMART ?? "gpt-6.1-sol") : (process.env.OPENAI_MODEL_CHEAP ?? "gpt-6-luna");
  const content: Array<Record<string, unknown>> = [{ type: "input_text", text: q.text }];
  for (const u of q.images ?? []) content.push({ type: "input_image", image_url: u, detail: "auto" });
  if (q.audio) content.push({ type: "input_audio", input_audio: { data: q.audio.data, format: q.audio.format } });
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model,
      ...(q.system ? { instructions: q.system } : {}),
      input: [{ role: "user", content }],
      ...(q.schema ? { text: { format: { type: "json_schema", name: "answer", strict: true, schema: q.schema } } } : {}),
    }),
  });
  const data = (await r.json()) as { error?: { message?: string }; output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (!r.ok) throw new Error(data.error?.message ?? `openai answered ${r.status}`);
  const text = data.output_text ?? data.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
  return (q.schema ? JSON.parse(text) : text) as T;
}
