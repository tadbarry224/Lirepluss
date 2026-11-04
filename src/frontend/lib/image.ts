"use client";

/**
 * Recadre la photo en carré et la réduit à `taille` pixels avant l'envoi :
 * fichier léger (quelques dizaines de Ko), même avec une photo de téléphone de plusieurs Mo.
 */
export async function preparerPhoto(fichier: File, taille = 320): Promise<Blob> {
  if (!fichier.type.startsWith("image/")) throw new Error("Choisissez un fichier image (JPEG, PNG ou WebP).");
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(fichier);
  } catch {
    throw new Error("Image illisible : essayez une photo JPEG ou PNG.");
  }
  const cote = Math.min(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = taille;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Votre navigateur ne permet pas de traiter l'image.");
  ctx.drawImage(image, (image.width - cote) / 2, (image.height - cote) / 2, cote, cote, 0, 0, taille, taille);
  image.close();

  const encoder = (type: string) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, 0.85));
  // WebP si le navigateur sait l'encoder, sinon JPEG
  const webp = await encoder("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await encoder("image/jpeg");
  if (!blob) throw new Error("Conversion de l'image impossible.");
  return blob;
}
