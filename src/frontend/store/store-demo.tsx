"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ateliersInitiaux,
  demandesInitiales,
  mentors as mentorsDemo,
  messagesInitiaux,
  objectifsInitiaux,
  opportunitesInitiales,
  profilInitial,
  REPONSE_AUTOMATIQUE,
  seancesInitiales,
  temoignagesInitiaux,
} from "@/shared/data";
import { appelApi } from "@/frontend/lib/api";
import { EVENEMENT_SESSION, deconnecterDemo, sessionCourante, trouverCompte, type CompteDemo, type SessionDemo } from "@/frontend/lib/comptes-demo";
import type { ErreursProfil } from "@/shared/validation/profil";
import { PAGES_PUBLIQUES, StoreContext, cheminApresConnexion, uid, versConnexion, type Store } from "./store-core";
import type { DemandeMentorat, Mentor, Message, Objectif, Opportunite, Profil, Seance, Temoignage } from "@/shared/types";
import type { ErreursDemande } from "@/shared/validation/demande";

/** Mode démo : toutes les données restent dans le navigateur (localStorage). */

interface Etat {
  profil: Profil;
  seances: Seance[];
  messages: Message[];
  objectifs: Objectif[];
  opportunites: Opportunite[];
  favoris: string[];
  mentorsInscrits: Mentor[];
  mesAteliers: string[];
  temoignagesPublies: Temoignage[];
  demandes: DemandeMentorat[];
}

const etatInitial: Etat = {
  profil: profilInitial,
  seances: seancesInitiales,
  messages: messagesInitiaux,
  objectifs: objectifsInitiaux,
  opportunites: opportunitesInitiales,
  favoris: [],
  mentorsInscrits: [],
  mesAteliers: [],
  temoignagesPublies: [],
  demandes: demandesInitiales,
};

/** Données de l'invité (inchangées depuis les versions précédentes) ; chaque compte a les siennes. */
const CLE = "lireplus:etat:v2";
const cleDonnees = (s: SessionDemo) => (s.type === "invite" ? CLE : `${CLE}:${s.compteId}`);
const ID_MOI = "moi";

/** Point de départ d'un nouveau compte : son nom et son rôle, sans l'historique fictif de l'invité. */
function etatNouveauCompte(c: CompteDemo): Etat {
  return {
    ...etatInitial,
    profil: { nom: c.nom, role: c.role, ville: "", domaines: [], competences: [], besoins: "", niveau: "Étudiant" },
    seances: [],
    messages: [],
    objectifs: [],
    demandes: [],
  };
}

function etatDeDepart(s: SessionDemo): Etat {
  const compte = s.type === "compte" ? trouverCompte(s.compteId) : null;
  return compte ? etatNouveauCompte(compte) : etatInitial;
}

/** Fiche publique de mentor tirée du profil : ajoutée si la personne est mentor, retirée sinon. */
function ficheMentor(p: Profil, inscrits: Mentor[]): Mentor[] {
  const autres = inscrits.filter((m) => m.id !== ID_MOI);
  if (p.role !== "mentor") return autres;
  return [
    ...autres,
    {
      id: ID_MOI,
      nom: p.nom,
      titre: p.titre || "Mentor",
      organisation: p.organisation || "Indépendant",
      ville: p.ville,
      domaines: p.domaines,
      competences: p.competences,
      bio: p.besoins,
      experience: p.experience ?? 1,
      langues: p.langues?.length ? p.langues : ["Français"],
      disponibilites: p.disponibilites ?? [],
      couleur: "bg-emerald-700",
      photo: p.photo,
      inscrit: true,
      role: "mentor",
    },
  ];
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const chemin = usePathname();

  // undefined : session pas encore lue (premier rendu, identique côté serveur) ; null : personne n'est connecté.
  const [session, setSession] = useState<SessionDemo | null | undefined>(undefined);
  // Les données sont toujours accompagnées de la clé où elles sont rangées, pour ne jamais les écrire chez un autre compte.
  const [donnees, setDonnees] = useState<{ cle: string | null; etat: Etat }>({ cle: null, etat: etatInitial });
  const etat = donnees.etat;

  // Lecture de la session après le montage (évite une différence d'hydratation), puis à chaque connexion / déconnexion,
  // y compris depuis un autre onglet.
  useEffect(() => {
    const lireSession = () => {
      const s = sessionCourante();
      // Un compte supprimé du navigateur ne doit pas laisser une session fantôme.
      setSession(s?.type === "compte" && !trouverCompte(s.compteId) ? null : s);
    };
    lireSession();
    const surStockage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith("lireplus:session")) lireSession();
    };
    window.addEventListener(EVENEMENT_SESSION, lireSession);
    window.addEventListener("storage", surStockage);
    return () => {
      window.removeEventListener(EVENEMENT_SESSION, lireSession);
      window.removeEventListener("storage", surStockage);
    };
  }, []);

  // Chargement des données de la personne connectée
  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDonnees({ cle: null, etat: etatInitial });
      return;
    }
    const cle = cleDonnees(session);
    const depart = etatDeDepart(session);
    let etatLu = depart;
    try {
      const brut = localStorage.getItem(cle);
      if (brut) etatLu = { ...depart, ...JSON.parse(brut) };
    } catch {
      /* stockage indisponible : on garde le point de départ */
    }
    setDonnees({ cle, etat: etatLu });
  }, [session]);

  useEffect(() => {
    if (!donnees.cle) return;
    try {
      localStorage.setItem(donnees.cle, JSON.stringify(donnees.etat));
    } catch {
      /* ignore */
    }
  }, [donnees]);

  // Sans session, seules les pages publiques sont accessibles ; une fois connecté, la page de connexion renvoie à l'application.
  useEffect(() => {
    if (session === undefined) return;
    if (!session && !PAGES_PUBLIQUES.includes(chemin)) router.replace(versConnexion(chemin));
    if (session && chemin === "/connexion") router.replace(cheminApresConnexion());
  }, [session, chemin, router]);

  const compte = session?.type === "compte" ? trouverCompte(session.compteId) : null;
  const pret = Boolean(session) && donnees.cle === (session ? cleDonnees(session) : null);

  const maj = useCallback(
    (f: (e: Etat) => Partial<Etat>) => setDonnees((d) => ({ ...d, etat: { ...d.etat, ...f(d.etat) } })),
    [],
  );
  const tousMentors = [...mentorsDemo, ...etat.mentorsInscrits];

  const store: Store = {
    ...etat,
    mode: "demo",
    pret,
    email: compte?.email ?? null,
    erreur: null,
    tousMentors,
    ateliers: ateliersInitiaux.map((a) => ({ ...a, inscrits: a.inscrits + (etat.mesAteliers.includes(a.id) ? 1 : 0) })),
    temoignages: [...etat.temoignagesPublies, ...temoignagesInitiaux],
    personnes: tousMentors,
    monIdMentor: etat.mentorsInscrits.some((m) => m.id === ID_MOI) ? ID_MOI : null,
    reserver: (s) => maj((e) => ({ seances: [...e.seances, { ...s, id: uid(), statut: "planifiee" }] })),
    majSeance: (id, champs) =>
      maj((e) => ({ seances: e.seances.map((s) => (s.id === id ? { ...s, ...champs } : s)) })),
    envoyerMessage: (mentorId, texte, auteur = "moi") =>
      maj((e) => ({
        messages: [...e.messages, { id: uid(), mentorId, auteur, texte, date: new Date().toISOString() }],
      })),
    ajouterObjectif: (o) => maj((e) => ({ objectifs: [...e.objectifs, { ...o, id: uid() }] })),
    basculerEtape: (oid, eid) =>
      maj((e) => ({
        objectifs: e.objectifs.map((o) =>
          o.id === oid ? { ...o, etapes: o.etapes.map((s) => (s.id === eid ? { ...s, fait: !s.fait } : s)) } : o,
        ),
      })),
    ajouterEtape: (oid, titre) =>
      maj((e) => ({
        objectifs: e.objectifs.map((o) =>
          o.id === oid ? { ...o, etapes: [...o.etapes, { id: uid(), titre, fait: false }] } : o,
        ),
      })),
    supprimerObjectif: (id) => maj((e) => ({ objectifs: e.objectifs.filter((o) => o.id !== id) })),
    publierOpportunite: (o) => maj((e) => ({ opportunites: [{ ...o, id: uid() }, ...e.opportunites] })),
    basculerFavori: (id) =>
      maj((e) => ({ favoris: e.favoris.includes(id) ? e.favoris.filter((f) => f !== id) : [...e.favoris, id] })),
    enregistrerProfil: async (p) => {
      // Même en mode démo, le profil est validé par le backend avant d'être conservé.
      const rep = await appelApi<{ profil?: Profil; erreurs?: ErreursProfil }>("/api/profil", {
        method: "PUT",
        body: JSON.stringify({ ...p, photo: etat.profil.photo }),
      });
      if (!rep.ok || !rep.donnees.profil) {
        return { ok: false, erreurs: rep.donnees.erreurs ?? { formulaire: "Serveur injoignable, réessayez." } };
      }
      const profil = rep.donnees.profil;
      maj((e) => ({ profil, mentorsInscrits: ficheMentor(profil, e.mentorsInscrits) }));
      return { ok: true };
    },
    changerPhoto: async (photo) => {
      const formulaire = new FormData();
      formulaire.append("photo", photo);
      const rep = await appelApi<{ photo?: string; erreur?: string }>("/api/profil/photo", { method: "POST", body: formulaire });
      if (!rep.ok || !rep.donnees.photo) return { ok: false, erreur: rep.donnees.erreur ?? "Serveur injoignable, réessayez." };
      const url = rep.donnees.photo;
      maj((e) => ({
        profil: { ...e.profil, photo: url },
        mentorsInscrits: e.mentorsInscrits.map((m) => (m.id === ID_MOI ? { ...m, photo: url } : m)),
      }));
      return { ok: true };
    },
    basculerInscriptionAtelier: (id) =>
      maj((e) => ({
        mesAteliers: e.mesAteliers.includes(id) ? e.mesAteliers.filter((x) => x !== id) : [...e.mesAteliers, id],
      })),
    envoyerDemande: async (d) => {
      const rep = await appelApi<{ demande?: unknown; erreurs?: ErreursDemande }>("/api/demandes", {
        method: "POST",
        body: JSON.stringify(d),
      });
      if (!rep.ok) return { ok: false, erreurs: rep.donnees.erreurs ?? { formulaire: "Serveur injoignable, réessayez." } };
      if (etat.demandes.some((x) => x.interlocuteurId === d.mentorId && x.statut !== "refusee")) {
        return { ok: false, erreurs: { formulaire: "Une demande est déjà en cours avec ce mentor" } };
      }
      const id = uid();
      maj((e) => ({
        demandes: [
          { id, interlocuteurId: d.mentorId, jeSuisLeMentor: false, objectif: d.objectif.trim(), message: d.message.trim(), statut: "en_attente", date: new Date().toISOString() },
          ...e.demandes,
        ],
      }));
      // Les mentors de démonstration acceptent automatiquement après quelques secondes
      // (sauf si l'on a changé de compte entre-temps)
      const cleAuDepart = donnees.cle;
      setTimeout(
        () =>
          setDonnees((d) =>
            d.cle !== cleAuDepart
              ? d
              : { ...d, etat: { ...d.etat, demandes: d.etat.demandes.map((x) => (x.id === id ? { ...x, statut: "acceptee", reponse: REPONSE_AUTOMATIQUE } : x)) } },
          ),
        2500,
      );
      return { ok: true };
    },
    repondreDemande: async (id, statut, reponse) => {
      const rep = await appelApi<{ erreurs?: { formulaire?: string } }>(`/api/demandes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ statut, reponse }),
      });
      if (!rep.ok) return { ok: false, erreur: rep.donnees.erreurs?.formulaire ?? "Serveur injoignable, réessayez." };
      maj((e) => ({ demandes: e.demandes.map((x) => (x.id === id ? { ...x, statut, reponse: reponse.trim() || undefined } : x)) }));
      return { ok: true };
    },
    publierTemoignage: (t) =>
      maj((e) => ({
        temoignagesPublies: [
          { ...t, id: uid(), date: new Date().toISOString(), auteurNom: e.profil.nom, auteurNiveau: e.profil.niveau },
          ...e.temoignagesPublies,
        ],
      })),
    reinitialiser: () => setDonnees((d) => ({ ...d, etat: session ? etatDeDepart(session) : etatInitial })),
    deconnexion: deconnecterDemo,
  };

  // Tant que personne n'est connecté, seules les pages publiques s'affichent.
  const afficher = PAGES_PUBLIQUES.includes(chemin) || pret;

  return (
    <StoreContext.Provider value={store}>
      {afficher ? children : <p className="py-20 text-center text-sm text-slate-500">Chargement…</p>}
    </StoreContext.Provider>
  );
}
