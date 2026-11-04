import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur, avec la clé secrète : il contourne les règles RLS.
 * Il ne doit JAMAIS être importé dans le frontend (le paquet "server-only" l'empêche).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cleSecrete = process.env.SUPABASE_SECRET_KEY;

/** Le backend fonctionne en mode Supabase dès que l'URL publique est définie. */
export const modeSupabase = Boolean(url);

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!url || !cleSecrete) {
    throw new Error("Configuration incomplète : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont requises côté serveur (voir .env.example).");
  }
  client ??= createClient(url, cleSecrete, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
