"use client";

import { useRef, useState } from "react";
import { preparerPhoto } from "@/frontend/lib/image";
import { useStore } from "@/frontend/store";
import { Avatar, ErreurChamp, boutonSecondaire } from "./ui";

/** Choix de la photo de profil : redimensionnée dans le navigateur, vérifiée et enregistrée par le backend. */
export function ChampPhoto() {
  const { profil, changerPhoto } = useStore();
  const entree = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    setErreur("");
    setEnvoi(true);
    try {
      const resultat = await changerPhoto(await preparerPhoto(fichier));
      if (!resultat.ok) setErreur(resultat.erreur);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Photo impossible à traiter.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar mentor={{ nom: profil.nom || "?", couleur: "bg-emerald-700", photo: profil.photo }} taille="lg" />
      <div>
        <button type="button" onClick={() => entree.current?.click()} disabled={envoi} className={boutonSecondaire}>
          {envoi ? "Envoi…" : profil.photo ? "Changer la photo" : "Ajouter une photo"}
        </button>
        <p className="mt-1 text-xs text-slate-500">JPEG, PNG ou WebP. Elle sera recadrée en carré.</p>
        <ErreurChamp message={erreur} />
        <input ref={entree} type="file" accept="image/jpeg,image/png,image/webp" onChange={choisir} className="hidden" />
      </div>
    </div>
  );
}
