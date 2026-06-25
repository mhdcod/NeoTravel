import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://mh24z.app.n8n.cloud/webhook/neotravel-chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: body.message,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      reply: data.reply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { reply: "Erreur backend" },
      { status: 500 }
    );
  }
}