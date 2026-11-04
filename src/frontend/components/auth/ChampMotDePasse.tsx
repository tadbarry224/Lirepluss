"use client";

import { useId, useState } from "react";
import { soliditeMotDePasse } from "@/shared/validation/auth";
import { ErreurChamp, champ } from "../ui";

const niveaux = [
  { label: "", couleur: "" },
  { label: "Faible", couleur: "bg-rose-500" },
  { label: "Moyen", couleur: "bg-amber-500" },
  { label: "Solide", couleur: "bg-emerald-500" },
  { label: "Très solide", couleur: "bg-emerald-600" },
];

/** Champ mot de passe avec bouton afficher / masquer et, en option, un indicateur de solidité. */
export function ChampMotDePasse({
  label,
  valeur,
  onChange,
  erreur,
  autoComplete,
  indicateur = false,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  erreur?: string;
  autoComplete: "current-password" | "new-password";
  indicateur?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const score = soliditeMotDePasse(valeur);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(erreur)}
          className={`${champ} pr-20`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? "Masquer" : "Afficher"}
        </button>
      </div>
      {indicateur && valeur && (
        <div className="mt-2 flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= score ? niveaux[score].couleur : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </div>
          <span className="w-20 text-right text-xs text-slate-500">{niveaux[score].label}</span>
        </div>
      )}
      {indicateur && <p className="mt-1 text-xs text-slate-500">8 caractères minimum, avec au moins une lettre et un chiffre.</p>}
      <ErreurChamp message={erreur} />
    </div>
  );
}
