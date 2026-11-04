// Génère supabase/seed.sql à partir de src/lib/data.ts (Node 22.6+ : prise en charge native du TypeScript).
// Usage : node scripts/generer-seed.mjs
import { writeFileSync } from "node:fs";
import { mentors, opportunitesInitiales } from "../src/lib/data.ts";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;

let sql = "-- Généré par scripts/generer-seed.mjs : ne pas modifier à la main.\n";
sql += "-- Mentors et opportunités de démonstration (personnes et organisations fictives).\n\n";
sql += "delete from public.profiles where user_id is null;\ndelete from public.opportunites where auteur_id is null;\n\n";
for (const m of mentors) {
  sql += `insert into public.profiles (role, nom, ville, niveau, domaines, competences, besoins, titre, organisation, experience, langues, disponibilites, couleur) values ('mentor', ${q(m.nom)}, ${q(m.ville)}, 'Professionnel expérimenté', ${arr(m.domaines)}, ${arr(m.competences)}, ${q(m.bio)}, ${q(m.titre)}, ${q(m.organisation)}, ${m.experience}, ${arr(m.langues)}, ${arr(m.disponibilites)}, ${q(m.couleur)});\n`;
}
sql += "\n";
for (const o of opportunitesInitiales) {
  sql += `insert into public.opportunites (titre, type, organisation, lieu, date_limite, domaine, description, publie_par) values (${q(o.titre)}, ${q(o.type)}, ${q(o.organisation)}, ${q(o.lieu)}, ${q(o.dateLimite)}, ${q(o.domaine)}, ${q(o.description)}, ${q(o.publiePar)});\n`;
}
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql : ${mentors.length} mentors, ${opportunitesInitiales.length} opportunités`);
