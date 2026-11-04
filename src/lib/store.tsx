"use client";

import { useContext } from "react";
import { DemoStoreProvider } from "./store-demo";
import { SupabaseStoreProvider } from "./store-supabase";
import { StoreContext } from "./store-core";
import { supabaseConfigure } from "./supabase";
import type { Objectif } from "./types";

export { uid, type Store } from "./store-core";

/** Choisit le mode Supabase si .env.local est configuré, sinon le mode démo. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return supabaseConfigure ? (
    <SupabaseStoreProvider>{children}</SupabaseStoreProvider>
  ) : (
    <DemoStoreProvider>{children}</DemoStoreProvider>
  );
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore doit être utilisé dans <StoreProvider>");
  return s;
}

export function progression(o: Objectif) {
  if (o.etapes.length === 0) return 0;
  return Math.round((o.etapes.filter((e) => e.fait).length / o.etapes.length) * 100);
}

export function formatDate(iso: string, avecHeure = false) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: avecHeure ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: avecHeure ? undefined : "numeric",
    hour: avecHeure ? "2-digit" : undefined,
    minute: avecHeure ? "2-digit" : undefined,
  });
}
