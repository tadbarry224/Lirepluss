import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.NEXT_PUBLIC_SUPABASE_KEY;

/** true si Supabase est configuré dans .env.local ; sinon l'app tourne en mode démo (données locales). */
export const supabaseConfigure = Boolean(url && cle);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!supabaseConfigure) throw new Error("Supabase n'est pas configuré (voir .env.example)");
  client ??= createClient(url!, cle!);
  return client;
}

/** Couleurs d'avatar (classes écrites en entier pour que Tailwind les génère). */
const couleurs = ["bg-emerald-700", "bg-sky-700", "bg-amber-700", "bg-rose-700", "bg-indigo-700", "bg-teal-700", "bg-violet-700", "bg-orange-700"];

export function couleurPour(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return couleurs[h % couleurs.length];
}
