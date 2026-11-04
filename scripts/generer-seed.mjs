// Génère supabase/seed.sql à partir de src/lib/data.ts (Node 22.6+ : prise en charge native du TypeScript).
// Usage : node scripts/generer-seed.mjs
import { writeFileSync } from "node:fs";
import { ateliersInitiaux, mentors, opportunitesInitiales, temoignagesInitiaux } from "../src/lib/data.ts";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;
const nomMentor = (id) => mentors.find((m) => m.id === id).nom;
const profilDemo = (id) => `(select id from public.profiles where nom = ${q(nomMentor(id))} and user_id is null)`;
// Les dates de démo sont relatives à aujourd'hui : on les garde relatives au moment de l'exécution du SQL.
const dateRelative = (iso) => {
  const d = new Date(iso);
  const jours = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return `date_trunc('day', now()) + interval '${jours} days' + interval '${d.getHours()} hours ${d.getMinutes()} minutes'`;
};

let sql = "-- Généré par scripts/generer-seed.mjs : ne pas modifier à la main.\n";
sql += "-- Données de démonstration (personnes et organisations fictives). Réexécutable : remplace les données de démo.\n\n";
sql += "delete from public.profiles where user_id is null; -- supprime aussi leurs ateliers et témoignages\n";
sql += "delete from public.opportunites where auteur_id is null;\n\n";

sql += "-- Mentors\n";
for (const m of mentors) {
  sql += `insert into public.profiles (role, nom, ville, niveau, domaines, competences, besoins, titre, organisation, experience, langues, disponibilites, couleur, charte_acceptee) values ('mentor', ${q(m.nom)}, ${q(m.ville)}, 'Professionnel expérimenté', ${arr(m.domaines)}, ${arr(m.competences)}, ${q(m.bio)}, ${q(m.titre)}, ${q(m.organisation)}, ${m.experience}, ${arr(m.langues)}, ${arr(m.disponibilites)}, ${q(m.couleur)}, true);\n`;
}

sql += "\n-- Opportunités\n";
for (const o of opportunitesInitiales) {
  sql += `insert into public.opportunites (titre, type, organisation, lieu, date_limite, domaine, description, publie_par) values (${q(o.titre)}, ${q(o.type)}, ${q(o.organisation)}, ${q(o.lieu)}, ${q(o.dateLimite)}, ${q(o.domaine)}, ${q(o.description)}, ${q(o.publiePar)});\n`;
}

sql += "\n-- Ateliers thématiques\n";
for (const a of ateliersInitiaux) {
  sql += `insert into public.ateliers (titre, domaine, animateur_id, date, duree_minutes, format, lieu, places, description) values (${q(a.titre)}, ${q(a.domaine)}, ${profilDemo(a.animateurId)}, ${dateRelative(a.date)}, ${a.dureeMinutes}, ${q(a.format)}, ${q(a.lieu)}, ${a.places}, ${q(a.description)});\n`;
}

sql += "\n-- Témoignages\n";
for (const t of temoignagesInitiaux) {
  sql += `insert into public.temoignages (auteur_nom, auteur_niveau, mentor_id, texte, note, created_at) values (${q(t.auteurNom)}, ${q(t.auteurNiveau)}, ${profilDemo(t.mentorId)}, ${q(t.texte)}, ${t.note}, ${dateRelative(t.date)});\n`;
}

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql : ${mentors.length} mentors, ${opportunitesInitiales.length} opportunités, ${ateliersInitiaux.length} ateliers, ${temoignagesInitiaux.length} témoignages`);
