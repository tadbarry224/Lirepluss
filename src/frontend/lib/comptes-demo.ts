"use client";

import type { Role } from "@/shared/types";

/**
 * Comptes du mode démo (sans Supabase) : inscription, connexion et déconnexion gardées dans ce navigateur.
 * Le mot de passe n'est jamais stocké : seule une empreinte PBKDF2 salée l'est.
 * Ce n'est pas une sécurité de production (tout reste sur l'appareil) : en ligne, ce sont les comptes Supabase qui servent.
 */

export interface CompteDemo {
  id: string;
  email: string;
  nom: string;
  role: Role;
  sel: string;
  empreinte: string;
  creeLe: string;
}

/** Session courante : un compte, le visiteur invité, ou personne (null). */
export type SessionDemo = { type: "compte"; compteId: string } | { type: "invite" };

const CLE_COMPTES = "lireplus:comptes:v1";
const CLE_SESSION = "lireplus:session:v1";
/** Événement émis à chaque connexion / déconnexion pour prévenir le store. */
export const EVENEMENT_SESSION = "lireplus:session";

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

function ecrire(cle: string, valeur: unknown) {
  try {
    if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible (navigation privée stricte) */
  }
}

export const listeComptes = () => lire<CompteDemo[]>(CLE_COMPTES, []);
export const trouverCompte = (id: string) => listeComptes().find((c) => c.id === id) ?? null;
export const sessionCourante = () => lire<SessionDemo | null>(CLE_SESSION, null);

function changerSession(s: SessionDemo | null) {
  ecrire(CLE_SESSION, s);
  window.dispatchEvent(new Event(EVENEMENT_SESSION));
}

const enHex = (o: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(o), (b) => b.toString(16).padStart(2, "0")).join("");
const depuisHex = (h: string) => new Uint8Array(h.match(/../g)!.map((x) => parseInt(x, 16)));

/** Octets aléatoires ; getRandomValues fonctionne aussi hors HTTPS (ex. téléphone sur http://192.168…). */
const aleatoire = (n: number) => enHex(crypto.getRandomValues(new Uint8Array(n)));

async function empreinteDe(motDePasse: string, selHex: string) {
  // crypto.subtle n'existe qu'en localhost ou HTTPS : ailleurs, repli sur une empreinte simple (mode démo uniquement).
  if (!globalThis.crypto?.subtle) {
    let h = 0x811c9dc5;
    for (let tour = 0; tour < 1000; tour++) {
      for (const c of selHex + motDePasse) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
    }
    return `fnv-${h.toString(16)}`;
  }
  const cle = await crypto.subtle.importKey("raw", new TextEncoder().encode(motDePasse), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: depuisHex(selHex), iterations: 100_000 }, cle, 256);
  return enHex(bits);
}

/** Erreurs au format de Supabase, pour réutiliser les mêmes messages (messageErreurAuth). */
type ErreurAuth = { code: string; message: string };

export async function inscrireDemo(d: { nom: string; role: Role; email: string; motDePasse: string }): Promise<{ erreur: ErreurAuth | null }> {
  const comptes = listeComptes();
  if (comptes.some((c) => c.email === d.email)) return { erreur: { code: "user_already_exists", message: "Compte existant" } };
  const sel = aleatoire(16);
  const compte: CompteDemo = {
    id: aleatoire(12),
    email: d.email,
    nom: d.nom,
    role: d.role,
    sel,
    empreinte: await empreinteDe(d.motDePasse, sel),
    creeLe: new Date().toISOString(),
  };
  ecrire(CLE_COMPTES, [...comptes, compte]);
  changerSession({ type: "compte", compteId: compte.id });
  return { erreur: null };
}

export async function connecterDemo(email: string, motDePasse: string): Promise<{ erreur: ErreurAuth | null }> {
  const compte = listeComptes().find((c) => c.email === email);
  // Même calcul et même message que le compte existe ou non : on ne révèle pas quelles adresses sont inscrites.
  const empreinte = await empreinteDe(motDePasse, compte?.sel ?? "00".repeat(16));
  if (!compte || empreinte !== compte.empreinte) return { erreur: { code: "invalid_credentials", message: "Identifiants invalides" } };
  changerSession({ type: "compte", compteId: compte.id });
  return { erreur: null };
}

export const continuerEnInvite = () => changerSession({ type: "invite" });
export const deconnecterDemo = () => changerSession(null);
