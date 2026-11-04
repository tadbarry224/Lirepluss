"use client";

import type { PostgrestError, Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { profilInitial } from "@/shared/data";
import { appelApi } from "@/frontend/lib/api";
import type { ErreursProfil } from "@/shared/validation/profil";
import { StoreContext, type Store } from "./store-core";
import { couleurPour, supabase } from "@/frontend/lib/supabase";
import type { Atelier, Etape, Mentor, Message, Objectif, Opportunite, Profil, Role, Seance } from "@/shared/types";

/** Mode Supabase : comptes, base de données partagée et temps réel. */

// ---------- Lignes de la base (voir supabase/schema.sql) ----------
interface LigneProfil {
  id: string;
  user_id: string | null;
  role: Role;
  nom: string;
  ville: string;
  niveau: Profil["niveau"];
  domaines: string[];
  competences: string[];
  besoins: string;
  titre: string | null;
  organisation: string | null;
  experience: number | null;
  langues: string[];
  disponibilites: string[];
  couleur: string | null;
  attentes: string[];
  format_prefere: Seance["format"] | null;
  charte_acceptee: boolean;
  photo_url: string | null;
}
interface LigneSeance {
  id: string;
  mentor_id: string;
  mentore_id: string;
  date: string;
  sujet: string;
  format: Seance["format"];
  statut: Seance["statut"];
  note: number | null;
  commentaire: string | null;
}
interface LigneMessage {
  id: string;
  expediteur_id: string;
  destinataire_id: string;
  texte: string;
  created_at: string;
}
interface LigneObjectif {
  id: string;
  proprietaire_id: string;
  mentor_id: string | null;
  titre: string;
  echeance: string;
  etapes: Etape[];
}
interface LigneAtelier {
  id: string;
  titre: string;
  domaine: string;
  animateur_id: string;
  date: string;
  duree_minutes: number;
  format: Atelier["format"];
  lieu: string;
  places: number;
  description: string;
}
interface LigneInscription {
  atelier_id: string;
  profil_id: string;
}
interface LigneTemoignage {
  id: string;
  auteur_nom: string;
  auteur_niveau: string;
  mentor_id: string;
  texte: string;
  note: number;
  created_at: string;
}
interface LigneOpportunite {
  id: string;
  titre: string;
  type: Opportunite["type"];
  organisation: string;
  lieu: string;
  date_limite: string;
  domaine: string;
  description: string;
  publie_par: string;
}

// ---------- Conversions base → application ----------
const versMentor = (p: LigneProfil): Mentor => ({
  id: p.id,
  nom: p.nom,
  titre: p.titre || (p.role === "mentor" ? "Mentor" : p.niveau),
  organisation: p.organisation || "",
  ville: p.ville,
  domaines: p.domaines,
  competences: p.competences,
  bio: p.besoins,
  experience: p.experience ?? 0,
  langues: p.langues,
  disponibilites: p.disponibilites,
  couleur: p.couleur || couleurPour(p.id),
  photo: p.photo_url ?? undefined,
  inscrit: Boolean(p.user_id),
  role: p.role,
});

const versProfil = (p: LigneProfil): Profil => ({
  nom: p.nom,
  role: p.role,
  ville: p.ville,
  domaines: p.domaines,
  competences: p.competences,
  besoins: p.besoins,
  niveau: p.niveau,
  titre: p.titre ?? undefined,
  organisation: p.organisation ?? undefined,
  experience: p.experience ?? undefined,
  langues: p.langues,
  disponibilites: p.disponibilites,
  attentes: p.attentes ?? [],
  formatPrefere: p.format_prefere ?? undefined,
  charteAcceptee: p.charte_acceptee ?? false,
  photo: p.photo_url ?? undefined,
});

const versOpportunite = (o: LigneOpportunite): Opportunite => ({
  id: o.id,
  titre: o.titre,
  type: o.type,
  organisation: o.organisation,
  lieu: o.lieu,
  dateLimite: o.date_limite,
  domaine: o.domaine,
  description: o.description,
  publiePar: o.publie_par,
});

export function SupabaseStoreProvider({ children }: { children: React.ReactNode }) {
  const sb = supabase();
  const router = useRouter();
  const chemin = usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionVerifiee, setSessionVerifiee] = useState(false);
  const [moi, setMoi] = useState<LigneProfil | null>(null);
  const [profils, setProfils] = useState<LigneProfil[]>([]);
  const [seancesL, setSeancesL] = useState<LigneSeance[]>([]);
  const [messagesL, setMessagesL] = useState<LigneMessage[]>([]);
  const [objectifsL, setObjectifsL] = useState<LigneObjectif[]>([]);
  const [opportunitesL, setOpportunitesL] = useState<LigneOpportunite[]>([]);
  const [favoris, setFavoris] = useState<string[]>([]);
  const [ateliersL, setAteliersL] = useState<LigneAtelier[]>([]);
  const [inscriptions, setInscriptions] = useState<LigneInscription[]>([]);
  const [temoignagesL, setTemoignagesL] = useState<LigneTemoignage[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  const signaler = useCallback((e: PostgrestError | Error | null) => {
    if (!e) return false;
    console.error(e);
    setErreur(e.message);
    setTimeout(() => setErreur(null), 6000);
    return true;
  }, []);

  // ---------- Session ----------
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionVerifiee(true);
    });
    const { data } = sb.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  const userId = session?.user.id ?? null;

  // Redirection vers la page de connexion si nécessaire
  useEffect(() => {
    if (!sessionVerifiee) return;
    if (!userId && chemin !== "/connexion") router.replace("/connexion");
    if (userId && chemin === "/connexion") router.replace("/");
  }, [sessionVerifiee, userId, chemin, router]);

  // ---------- Chargement des données ----------
  const rechargerSeances = useCallback(async () => {
    const { data, error } = await sb.from("seances").select("*").order("date");
    if (!signaler(error)) setSeancesL(data as LigneSeance[]);
  }, [sb, signaler]);

  useEffect(() => {
    if (!userId) return;
    let annule = false;
    (async () => {
      const [p, tous, s, m, o, opp, fav, at, ins, tem] = await Promise.all([
        sb.from("profiles").select("*").eq("user_id", userId).single(),
        sb.from("profiles").select("*").order("created_at"),
        sb.from("seances").select("*").order("date"),
        sb.from("messages").select("*").order("created_at"),
        sb.from("objectifs").select("*").order("created_at"),
        sb.from("opportunites").select("*").order("created_at", { ascending: false }),
        sb.from("favoris").select("mentor_id"),
        sb.from("ateliers").select("*").order("date"),
        sb.from("inscriptions_ateliers").select("atelier_id, profil_id"),
        sb.from("temoignages").select("*").order("created_at", { ascending: false }),
      ]);
      if (annule) return;
      for (const r of [p, tous, s, m, o, opp, fav, at, ins, tem]) signaler(r.error);
      setAteliersL((at.data ?? []) as LigneAtelier[]);
      setInscriptions((ins.data ?? []) as LigneInscription[]);
      setTemoignagesL((tem.data ?? []) as LigneTemoignage[]);
      setMoi(p.data as LigneProfil | null);
      setProfils((tous.data ?? []) as LigneProfil[]);
      setSeancesL((s.data ?? []) as LigneSeance[]);
      setMessagesL((m.data ?? []) as LigneMessage[]);
      setObjectifsL((o.data ?? []) as LigneObjectif[]);
      setOpportunitesL((opp.data ?? []) as LigneOpportunite[]);
      setFavoris(((fav.data ?? []) as { mentor_id: string }[]).map((f) => f.mentor_id));
    })();
    return () => {
      annule = true;
    };
  }, [sb, userId, signaler]);

  // ---------- Temps réel : nouveaux messages et séances ----------
  const monId = moi?.id ?? null;
  useEffect(() => {
    if (!monId) return;
    const canal = sb
      .channel(`lireplus-${monId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `destinataire_id=eq.${monId}` },
        async (payload) => {
          const msg = payload.new as LigneMessage;
          setMessagesL((l) => (l.some((x) => x.id === msg.id) ? l : [...l, msg]));
          // Un nouveau correspondant (ex. un mentoré qui écrit à son mentor) : on recharge les profils.
          const { data } = await sb.from("profiles").select("*").order("created_at");
          if (data) setProfils(data as LigneProfil[]);
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "seances" }, () => {
        rechargerSeances();
      })
      .subscribe();
    return () => {
      sb.removeChannel(canal);
    };
  }, [sb, monId, rechargerSeances]);

  // ---------- Vues pour l'application ----------
  const personnes = useMemo(() => profils.map(versMentor), [profils]);
  const tousMentors = useMemo(() => personnes.filter((p) => p.role === "mentor" && p.id !== monId), [personnes, monId]);

  const seances: Seance[] = useMemo(
    () =>
      seancesL.map((s) => {
        const jeSuisLeMentor = s.mentor_id === monId;
        return {
          id: s.id,
          mentorId: jeSuisLeMentor ? s.mentore_id : s.mentor_id,
          jeSuisLeMentor,
          date: s.date,
          sujet: s.sujet,
          format: s.format,
          statut: s.statut,
          note: s.note ?? undefined,
          commentaire: s.commentaire ?? undefined,
        };
      }),
    [seancesL, monId],
  );

  const messages: Message[] = useMemo(
    () =>
      messagesL.map((m) => ({
        id: m.id,
        mentorId: m.expediteur_id === monId ? m.destinataire_id : m.expediteur_id,
        auteur: m.expediteur_id === monId ? "moi" : "mentor",
        texte: m.texte,
        date: m.created_at,
      })),
    [messagesL, monId],
  );

  const objectifs: Objectif[] = useMemo(
    () =>
      objectifsL.map((o) => ({
        id: o.id,
        titre: o.titre,
        echeance: o.echeance,
        mentorId: o.mentor_id ?? undefined,
        etapes: o.etapes,
      })),
    [objectifsL],
  );

  // ---------- Actions ----------
  /** Le profil est écrit uniquement par le backend (/api/profil), qui le valide. */
  function appliquerLigne(ligne: LigneProfil) {
    setMoi(ligne);
    setProfils((l) => l.map((x) => (x.id === ligne.id ? ligne : x)));
  }

  async function majEtapes(oid: string, etapes: Etape[]) {
    setObjectifsL((l) => l.map((o) => (o.id === oid ? { ...o, etapes } : o)));
    signaler((await sb.from("objectifs").update({ etapes }).eq("id", oid)).error);
  }

  const store: Store = {
    mode: "supabase",
    pret: sessionVerifiee && (!userId || moi !== null),
    email: session?.user.email ?? null,
    erreur,
    profil: moi ? versProfil(moi) : { ...profilInitial, nom: "" },
    seances,
    messages,
    objectifs,
    opportunites: opportunitesL.map(versOpportunite),
    favoris,
    ateliers: ateliersL.map((a) => ({
      id: a.id,
      titre: a.titre,
      domaine: a.domaine,
      animateurId: a.animateur_id,
      date: a.date,
      dureeMinutes: a.duree_minutes,
      format: a.format,
      lieu: a.lieu,
      places: a.places,
      inscrits: inscriptions.filter((i) => i.atelier_id === a.id).length,
      description: a.description,
    })),
    mesAteliers: inscriptions.filter((i) => i.profil_id === monId).map((i) => i.atelier_id),
    temoignages: temoignagesL.map((t) => ({
      id: t.id,
      auteurNom: t.auteur_nom,
      auteurNiveau: t.auteur_niveau,
      mentorId: t.mentor_id,
      texte: t.texte,
      note: t.note,
      date: t.created_at,
    })),
    tousMentors,
    personnes,
    monIdMentor: moi?.role === "mentor" ? moi.id : null,

    enregistrerProfil: async (p) => {
      const rep = await appelApi<{ ligne?: LigneProfil; erreurs?: ErreursProfil }>("/api/profil", {
        method: "PUT",
        body: JSON.stringify(p),
      });
      if (!rep.ok || !rep.donnees.ligne) {
        return { ok: false, erreurs: rep.donnees.erreurs ?? { formulaire: "Serveur injoignable, réessayez." } };
      }
      appliquerLigne(rep.donnees.ligne);
      return { ok: true };
    },
    changerPhoto: async (photo) => {
      const formulaire = new FormData();
      formulaire.append("photo", photo);
      const rep = await appelApi<{ ligne?: LigneProfil; erreur?: string }>("/api/profil/photo", { method: "POST", body: formulaire });
      if (!rep.ok || !rep.donnees.ligne) return { ok: false, erreur: rep.donnees.erreur ?? "Serveur injoignable, réessayez." };
      appliquerLigne(rep.donnees.ligne);
      return { ok: true };
    },

    reserver: async (s) => {
      if (!monId) return;
      const { data, error } = await sb
        .from("seances")
        .insert({ mentor_id: s.mentorId, mentore_id: monId, date: s.date, sujet: s.sujet, format: s.format })
        .select()
        .single();
      if (!signaler(error)) setSeancesL((l) => [...l.filter((x) => x.id !== data.id), data as LigneSeance]);
    },
    majSeance: async (id, champs) => {
      const maj: Partial<LigneSeance> = {};
      if (champs.statut) maj.statut = champs.statut;
      if (champs.note !== undefined) maj.note = champs.note;
      if (champs.commentaire !== undefined) maj.commentaire = champs.commentaire;
      setSeancesL((l) => l.map((s) => (s.id === id ? { ...s, ...maj } : s)));
      signaler((await sb.from("seances").update(maj).eq("id", id)).error);
    },

    envoyerMessage: async (interlocuteurId, texte, auteur = "moi") => {
      // Les réponses simulées du mode démo n'existent pas ici : ce sont de vraies personnes.
      if (auteur !== "moi" || !monId) return;
      const { data, error } = await sb
        .from("messages")
        .insert({ expediteur_id: monId, destinataire_id: interlocuteurId, texte })
        .select()
        .single();
      if (!signaler(error)) setMessagesL((l) => (l.some((x) => x.id === data.id) ? l : [...l, data as LigneMessage]));
    },

    ajouterObjectif: async (o) => {
      if (!monId) return;
      const { data, error } = await sb
        .from("objectifs")
        .insert({ proprietaire_id: monId, mentor_id: o.mentorId ?? null, titre: o.titre, echeance: o.echeance, etapes: o.etapes })
        .select()
        .single();
      if (!signaler(error)) setObjectifsL((l) => [...l, data as LigneObjectif]);
    },
    basculerEtape: (oid, eid) => {
      const o = objectifsL.find((x) => x.id === oid);
      if (o) void majEtapes(oid, o.etapes.map((e) => (e.id === eid ? { ...e, fait: !e.fait } : e)));
    },
    ajouterEtape: (oid, titre) => {
      const o = objectifsL.find((x) => x.id === oid);
      if (o) void majEtapes(oid, [...o.etapes, { id: crypto.randomUUID(), titre, fait: false }]);
    },
    supprimerObjectif: async (id) => {
      setObjectifsL((l) => l.filter((o) => o.id !== id));
      signaler((await sb.from("objectifs").delete().eq("id", id)).error);
    },

    publierOpportunite: async (o) => {
      if (!monId) return;
      const { data, error } = await sb
        .from("opportunites")
        .insert({
          titre: o.titre,
          type: o.type,
          organisation: o.organisation,
          lieu: o.lieu,
          date_limite: o.dateLimite,
          domaine: o.domaine,
          description: o.description,
          publie_par: o.publiePar,
          auteur_id: monId,
        })
        .select()
        .single();
      if (!signaler(error)) setOpportunitesL((l) => [data as LigneOpportunite, ...l]);
    },

    basculerFavori: async (mentorId) => {
      if (!monId) return;
      if (favoris.includes(mentorId)) {
        setFavoris((f) => f.filter((x) => x !== mentorId));
        signaler((await sb.from("favoris").delete().eq("profil_id", monId).eq("mentor_id", mentorId)).error);
      } else {
        setFavoris((f) => [...f, mentorId]);
        signaler((await sb.from("favoris").insert({ profil_id: monId, mentor_id: mentorId })).error);
      }
    },

    basculerInscriptionAtelier: async (atelierId) => {
      if (!monId) return;
      const inscrit = inscriptions.some((i) => i.atelier_id === atelierId && i.profil_id === monId);
      if (inscrit) {
        setInscriptions((l) => l.filter((i) => !(i.atelier_id === atelierId && i.profil_id === monId)));
        signaler((await sb.from("inscriptions_ateliers").delete().eq("atelier_id", atelierId).eq("profil_id", monId)).error);
      } else {
        setInscriptions((l) => [...l, { atelier_id: atelierId, profil_id: monId }]);
        signaler((await sb.from("inscriptions_ateliers").insert({ atelier_id: atelierId, profil_id: monId })).error);
      }
    },
    publierTemoignage: async (t) => {
      if (!monId || !moi) return;
      const { data, error } = await sb
        .from("temoignages")
        .insert({ auteur_id: monId, auteur_nom: moi.nom, auteur_niveau: moi.niveau, mentor_id: t.mentorId, texte: t.texte, note: t.note })
        .select()
        .single();
      if (!signaler(error)) setTemoignagesL((l) => [data as LigneTemoignage, ...l]);
    },

    reinitialiser: () => {},
    deconnexion: async () => {
      await sb.auth.signOut();
      setMoi(null);
      setProfils([]);
      setSeancesL([]);
      setMessagesL([]);
      setObjectifsL([]);
      setFavoris([]);
    },
  };

  // Tant que l'utilisateur n'est pas connecté, seule la page de connexion est affichée.
  const afficher = chemin === "/connexion" || (userId && store.pret);

  return (
    <StoreContext.Provider value={store}>
      {afficher ? children : <p className="py-20 text-center text-sm text-slate-500">Chargement…</p>}
      {erreur && (
        <div role="alert" className="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl bg-rose-600 px-4 py-3 text-sm text-white shadow-lg">
          ⚠ {erreur}
        </div>
      )}
    </StoreContext.Provider>
  );
}
