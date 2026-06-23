import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    // Réponse simulée pour le MVP
    // Plus tard, tu remplaceras ça par un appel à ton webhook n8n.
    const reply = `Merci pour votre demande : "${userMessage}".
J’ai bien pris en compte votre message. Pour préparer votre devis, j’aurai besoin de :
- la destination
- les dates du séjour
- le nombre de voyageurs
- le budget estimé
- le type d’hébergement souhaité`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erreur API /api/chat :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}