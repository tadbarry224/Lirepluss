import "server-only";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "../db/supabase-admin";

/** Identifie l'utilisateur à partir du jeton envoyé par le frontend (en-tête Authorization: Bearer …). */
export async function utilisateurDepuisRequete(req: Request): Promise<User | null> {
  const jeton = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!jeton) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(jeton);
  return error ? null : data.user;
}
