"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis NeoTravel. Dites-moi votre destination, vos dates, votre budget et le nombre de voyageurs pour préparer un devis.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel API");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply ?? "Je n’ai pas pu générer de réponse.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Une erreur est survenue. Vérifiez que l’API fonctionne correctement.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header className="hero">
          <div>
            <h1>NeoTravel V2 ✈️</h1>
            <p>
              Assistant voyage intelligent — devis, CRM, PDF et relances
              automatisées
            </p>
          </div>
        </header>

        <section className="card">
          <div className="chatHeader">
            <h2>Assistant de voyage</h2>
            <span className="badge">MVP</span>
          </div>

          <div className="chatBox">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.role === "user" ? "userMessage" : "assistantMessage"
                }`}
              >
                <div className="messageRole">
                  {message.role === "user" ? "Vous" : "NeoTravel"}
                </div>
                <div>{message.content}</div>
              </div>
            ))}

            {loading && (
              <div className="message assistantMessage">
                <div className="messageRole">NeoTravel</div>
                <div>Je prépare votre réponse...</div>
              </div>
            )}
          </div>

          <div className="inputArea">
            <input
              type="text"
              placeholder="Ex: Je veux un voyage de 7 jours à Bali pour 2 personnes avec un budget de 2500€"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </section>

        <section className="features">
          <div className="featureCard">
            <h3>💬 Chat voyage</h3>
            <p>Collecte des besoins client et qualification du voyage.</p>
          </div>

          <div className="featureCard">
            <h3>💶 Calcul de devis</h3>
            <p>Le prix est calculé par une logique métier déterministe.</p>
          </div>

          <div className="featureCard">
            <h3>📄 PDF & CRM</h3>
            <p>Génération du devis PDF et enregistrement dans Airtable.</p>
          </div>
        </section>
      </div>
    </main>
  );
}