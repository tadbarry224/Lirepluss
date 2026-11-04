"use client";

import { supabase, supabaseConfigure } from "./supabase";

/** Appelle une route du backend (/api/…) en joignant le jeton de l'utilisateur connecté (mode Supabase). */
export async function appelApi<T>(chemin: string, init: RequestInit = {}): Promise<{ ok: boolean; statut: number; donnees: T }> {
  const entetes = new Headers(init.headers);
  if (supabaseConfigure) {
    const { data } = await supabase().auth.getSession();
    if (data.session) entetes.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  if (typeof init.body === "string") entetes.set("Content-Type", "application/json");
  try {
    const rep = await fetch(chemin, { ...init, headers: entetes });
    const donnees = (await rep.json().catch(() => ({}))) as T;
    return { ok: rep.ok, statut: rep.status, donnees };
  } catch {
    return { ok: false, statut: 0, donnees: {} as T };
  }
}
