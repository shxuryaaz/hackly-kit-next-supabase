// shown where an answer would have been, when hackly's ai allowance for this pass is used up.
// the rest of the app keeps working; only the model is paused.
export function AiOut({ spentPaise, allowancePaise }: { spentPaise?: number; allowancePaise?: number }) {
  const rs = (p?: number) => (p == null ? "" : `₹${Math.round(p / 100)}`);
  return (
    <div style={{ border: "1px solid currentColor", padding: "12px 14px", display: "grid", gap: 4, maxWidth: 520, fontSize: 14, lineHeight: 1.45 }} role="status">
      <strong>the ai allowance for this app is used up{allowancePaise ? ` (${rs(spentPaise ?? allowancePaise)} of ${rs(allowancePaise)})` : ""}.</strong>
      <span>paste your own OpenAI key into Vercel as OPENAI_API_KEY, or upgrade the hackly pass. everything else here keeps working.</span>
    </div>
  );
}
