import "server-only";

export const TAILLE_MAX_PHOTO = 2 * 1024 * 1024; // 2 Mo
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export type TypePhoto = keyof typeof TYPES;

export type PhotoValidee = { ok: true; octets: Uint8Array; type: TypePhoto; extension: string } | { ok: false; erreur: string };

/** Signature binaire réelle du fichier : on ne se fie pas au type annoncé par le navigateur. */
function detecterType(o: Uint8Array): TypePhoto | null {
  if (o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff) return "image/jpeg";
  if (o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47) return "image/png";
  const ascii = (debut: number, fin: number) => String.fromCharCode(...o.slice(debut, fin));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function validerPhoto(fichier: unknown): Promise<PhotoValidee> {
  if (!(fichier instanceof Blob)) return { ok: false, erreur: "Aucune photo reçue" };
  if (fichier.size === 0) return { ok: false, erreur: "Le fichier est vide" };
  if (fichier.size > TAILLE_MAX_PHOTO) return { ok: false, erreur: "Photo trop lourde (2 Mo maximum)" };
  const octets = new Uint8Array(await fichier.arrayBuffer());
  const type = detecterType(octets);
  if (!type) return { ok: false, erreur: "Format non accepté : utilisez une image JPEG, PNG ou WebP" };
  return { ok: true, octets, type, extension: TYPES[type] };
}
