/** Erreur métier : message destiné à l'utilisateur et code HTTP à renvoyer. */
export class ErreurMetier extends Error {
  constructor(
    message: string,
    public statut = 400,
  ) {
    super(message);
  }
}

/** Convertit une erreur en réponse HTTP (les erreurs inattendues ne révèlent pas leur détail). */
export function reponseErreur(e: unknown) {
  if (e instanceof ErreurMetier) return Response.json({ erreurs: { formulaire: e.message } }, { status: e.statut });
  console.error(e);
  return Response.json({ erreurs: { formulaire: "Erreur du serveur, réessayez dans un instant" } }, { status: 500 });
}
