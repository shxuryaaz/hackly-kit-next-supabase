import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

// signed out: a link to /login. signed in: the user's profile row.
export default async function Home() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!user) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">app</h1>
        <p className="mt-2">you are not signed in.</p>
        <Link href="/login" className="mt-4 inline-block underline">sign in</Link>
      </main>
    );
  }
  const { data: profile } = await supabase.from("profiles").select("display_name, created_at").eq("id", user.id).maybeSingle();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">hi {profile?.display_name ?? user.email}</h1>
      <p className="mt-2">signed in as {user.email}</p>
      <form action="/auth/signout" method="post" className="mt-4"><button className="underline">sign out</button></form>
    </main>
  );
}
