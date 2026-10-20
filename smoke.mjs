// builds, starts on a free port, expects 200 from /, stops. placeholder env is enough: the page renders signed out when supabase is unreachable.
import { spawn, execSync } from "node:child_process";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "placeholder";
execSync("npx next build", { stdio: "inherit" });
const port = 3000 + Math.floor(Math.random() * 1000);
const srv = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "inherit" });
let status = 0;
try {
  for (let i = 0; i < 30 && status !== 200; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    status = await fetch(`http://localhost:${port}/`).then((r) => r.status).catch(() => 0);
  }
} finally {
  srv.kill();
}
if (status !== 200) { console.error(`smoke failed: / returned ${status}`); process.exit(1); }
console.log("smoke ok: / returned 200");
