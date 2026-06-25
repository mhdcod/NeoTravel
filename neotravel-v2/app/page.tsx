"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  "Nous sommes 35 passagers pour un aller-retour Paris → Lille avec bagages",
  "Je cherche un bus pour 18 personnes de Créteil à Bruxelles",
  "Aller simple Lyon → Marseille pour 12 voyageurs sans bagage",
];

export default function HomePage() {
  const [tripType, setTripType] = useState<"aller-simple" | "aller-retour">(
    "aller-simple"
  );
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [luggage, setLuggage] = useState<"oui" | "non">("oui");
  const [notes, setNotes] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je peux vous aider à préparer un trajet en bus. Décrivez votre besoin librement ou utilisez le formulaire à gauche.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendChat(text?: string) {
    const content = (text ?? chatInput).trim();
    if (!content || loading) return;

    const userMessage: Message = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            "Je n’ai pas pu générer de réponse pour le moment.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Une erreur est survenue. Vérifiez que l’API et le workflow n8n fonctionnent correctement.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleChatKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      tripType,
      departure,
      arrival,
      departureDate,
      returnDate: tripType === "aller-retour" ? returnDate : null,
      passengers,
      luggage,
      notes,
    };

    console.log("Demande de devis :", payload);
    alert(
      "Formulaire prêt. Prochaine étape : brancher ce formulaire à ton API / n8n pour générer un devis."
    );
  }

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <div className="heroBadge">NeoTravel V2 · Bus quotes assistant</div>
          <h1>Organisez vos trajets en bus simplement.</h1>
          <p>
            Demandez un devis pour un trajet en bus en renseignant les
            informations essentielles : aller simple ou aller-retour,
            nombre de passagers, bagages, destination et dates.
          </p>
        </section>

        <section className="mainGrid">
          <div className="quoteCard">
            <div className="cardHeader">
              <div>
                <p className="sectionKicker">Formulaire principal</p>
                <h2>Demande de devis trajet bus</h2>
              </div>
              <span className="pill">Étape 1</span>
            </div>

            <form className="quoteForm" onSubmit={handleSubmitQuote}>
              <div className="fieldGroup">
                <label>Type de trajet</label>
                <div className="segmentedControl">
                  <button
                    type="button"
                    className={
                      tripType === "aller-simple" ? "segment active" : "segment"
                    }
                    onClick={() => setTripType("aller-simple")}
                  >
                    Aller simple
                  </button>
                  <button
                    type="button"
                    className={
                      tripType === "aller-retour" ? "segment active" : "segment"
                    }
                    onClick={() => setTripType("aller-retour")}
                  >
                    Aller-retour
                  </button>
                </div>
              </div>

              <div className="formGrid twoCols">
                <div className="fieldGroup">
                  <label htmlFor="departure">Ville de départ</label>
                  <input
                    id="departure"
                    type="text"
                    placeholder="Ex. Paris"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                  />
                </div>

                <div className="fieldGroup">
                  <label htmlFor="arrival">Destination</label>
                  <input
                    id="arrival"
                    type="text"
                    placeholder="Ex. Lille"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                  />
                </div>
              </div>

              <div className="formGrid twoCols">
                <div className="fieldGroup">
                  <label htmlFor="departureDate">Date aller</label>
                  <input
                    id="departureDate"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>

                {tripType === "aller-retour" ? (
                  <div className="fieldGroup">
                    <label htmlFor="returnDate">Date retour</label>
                    <input
                      id="returnDate"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="fieldGroup">
                    <label>Date retour</label>
                    <input
                      type="text"
                      disabled
                      value="Non requis pour un aller simple"
                    />
                  </div>
                )}
              </div>

              <div className="formGrid twoCols">
                <div className="fieldGroup">
                  <label htmlFor="passengers">Nombre de passagers</label>
                  <input
                    id="passengers"
                    type="number"
                    min="1"
                    placeholder="Ex. 24"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                  />
                </div>

                <div className="fieldGroup">
                  <label htmlFor="luggage">Bagages</label>
                  <select
                    id="luggage"
                    value={luggage}
                    onChange={(e) =>
                      setLuggage(e.target.value as "oui" | "non")
                    }
                  >
                    <option value="oui">Avec bagages</option>
                    <option value="non">Sans bagages</option>
                  </select>
                </div>
              </div>

              <div className="fieldGroup">
                <label htmlFor="notes">Informations complémentaires</label>
                <textarea
                  id="notes"
                  rows={5}
                  placeholder="Ex. besoin d’un départ tôt le matin, arrêt intermédiaire, transport scolaire, événement privé..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="formFooter">
                <div className="helperText">
                  Le formulaire est le canal principal pour structurer la
                  demande. L’assistant à droite est là pour aider et
                  qualifier le besoin si nécessaire.
                </div>

                <button type="submit" className="primaryButton">
                  Obtenir mon devis
                </button>
              </div>
            </form>
          </div>

          <aside className="assistantCard">
            <div className="cardHeader assistantHeader">
              <div>
                <p className="sectionKicker">Assistant complémentaire</p>
                <h2>Besoin d’aide pour formuler la demande ?</h2>
              </div>
              <span className="assistantStatus">IA</span>
            </div>

            <p className="assistantIntro">
              Décrivez librement votre trajet et l’assistant peut vous
              aider à clarifier votre besoin avant l’envoi du devis.
            </p>

            <div className="promptList">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="promptChip"
                  onClick={() => handleSendChat(prompt)}
                  disabled={loading}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
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

            <div className="chatInputArea">
              <textarea
                rows={3}
                placeholder="Ex. Nous sommes 40 personnes, départ de Paris vers Bruxelles avec bagages..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSendChat()}
                disabled={loading}
                className="secondaryButton"
              >
                {loading ? "Envoi..." : "Envoyer au chat"}
              </button>
            </div>
          </aside>
        </section>

        <section className="features">
          <div className="featureCard">
            <h3>🚌 Demande de trajet structurée</h3>
            <p>
              Le formulaire centralise les informations essentielles pour
              établir rapidement un devis de transport en bus.
            </p>
          </div>

          <div className="featureCard">
            <h3>🤖 Assistant de qualification</h3>
            <p>
              Le chat complète le formulaire : il aide à préciser un
              besoin, reformuler une demande ou préparer les détails.
            </p>
          </div>

          <div className="featureCard">
            <h3>📄 Devis, CRM et relances</h3>
            <p>
              Une fois la demande validée, le workflow peut calculer le
              devis, générer un PDF et enregistrer le lead.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}