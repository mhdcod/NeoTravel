"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  { icon: "👥", label: "35 passagers", text: "35 passagers Paris → Lille avec bagages" },
  { icon: "🚌", label: "18 personnes Bruxelles", text: "Bus pour 18 personnes Créteil–Bruxelles" },
  { icon: "☀️", label: "Sortie scolaire", text: "Sortie scolaire 42 élèves Paris → Mont-Saint-Michel" },
  { icon: "🎉", label: "Événement privé", text: "Événement privé Lyon → Marseille, 12 voyageurs" },
];

const TRIP_CATEGORIES = [
  { value: "", label: "Sélectionner…" },
  { value: "scolaire", label: "🎒 Transport scolaire" },
  { value: "evenement", label: "🎉 Événement privé" },
  { value: "tourisme", label: "🗺️ Sortie touristique" },
  { value: "entreprise", label: "💼 Déplacement entreprise" },
  { value: "autre", label: "✦ Autre" },
];

type Step = "form" | "success";

export default function HomePage() {
  const [step, setStep] = useState<Step>("form");
  const [tripType, setTripType] = useState<"aller-simple" | "aller-retour">("aller-simple");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [luggage, setLuggage] = useState<"oui" | "non">("oui");
  const [tripCategory, setTripCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Décrivez votre trajet librement, ou remplissez le formulaire — je m'adapte en temps réel.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const assistantTriggered = useRef(false);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // React to form fields being filled
  useEffect(() => {
    if (departure && arrival && !assistantTriggered.current) {
      assistantTriggered.current = true;
      const hint: Message = {
        role: "assistant",
        content: `Trajet ${departure} → ${arrival} noté ✓ Combien de passagers prévoyez-vous, et y a-t-il des bagages ?`,
      };
      const timer = setTimeout(() => {
        setMessages((prev) => [...prev, hint]);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [departure, arrival]);

  // Reset assistant trigger if cities change
  useEffect(() => {
    if (!departure || !arrival) {
      assistantTriggered.current = false;
    }
  }, [departure, arrival]);

  async function handleSendChat(text?: string) {
    const content = (text ?? chatInput).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: messages }),
      });

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Je n'ai pas pu générer de réponse.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Une erreur est survenue. Vérifiez que l'API est bien configurée.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulated async
    setSubmitting(false);
    setStep("success");
  }

  const formComplete = departure && arrival && departureDate && passengers;

  if (step === "success") {
    return (
      <>
        <NavBar />
        <div className="successPage">
          <div className="successCard">
            <div className="successIcon">✓</div>
            <h2 className="successTitle">Demande envoyée !</h2>
            <p className="successSub">
              Votre devis pour <strong>{departure} → {arrival}</strong> ({passengers} passagers) est en cours de traitement.
            </p>
            <div className="successMeta">
              <div className="successMetaItem">
                <span className="successMetaLabel">Type</span>
                <span className="successMetaValue">{tripType === "aller-retour" ? "Aller-retour" : "Aller simple"}</span>
              </div>
              <div className="successMetaItem">
                <span className="successMetaLabel">Départ</span>
                <span className="successMetaValue">{departureDate ? new Date(departureDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "—"}</span>
              </div>
              <div className="successMetaItem">
                <span className="successMetaLabel">Bagages</span>
                <span className="successMetaValue">{luggage === "oui" ? "Oui" : "Non"}</span>
              </div>
            </div>
            <div className="successEta">
              <span className="successEtaIcon">⏱</span>
              Réponse d'un conseiller sous <strong>2h ouvrées</strong>
            </div>
            <button className="submitButton" onClick={() => { setStep("form"); assistantTriggered.current = false; setMessages([{ role: "assistant", content: "Bonjour 👋 Décrivez votre trajet librement, ou remplissez le formulaire — je m'adapte en temps réel." }]); }}>
              Nouvelle demande
              <span className="submitArrow">+</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="heroInner">
          <div className="heroContent">
            <div className="heroEyebrow">
              <div className="heroEyebrowDot" />
              Devis gratuit · Réponse sous 2h
            </div>
            <h1 className="heroTitle">
              Votre trajet en car,<br />
              <span className="accent">au meilleur prix.</span>
            </h1>
            <p className="heroSub">
              Groupes, sorties scolaires, événements privés — un devis personnalisé en quelques clics, avec un conseiller dédié.
            </p>
          </div>

          {/* Route visualizer */}
          <div className="routeHero">

    <div className="routeHeroHeader">
        <span className="routeBadge">
            ✦ Aperçu du trajet
        </span>

        <span className="routeDistance">
            {departure && arrival ? "Trajet personnalisé" : "En attente"}
        </span>
    </div>

    <div className="routeLine">

        <div className="routePoint start">
            <div className={`point ${departure ? "filled" : ""}`} />
            <span>{departure || "Ville de départ"}</span>
        </div>

        <div className="routeProgress">

            <div className={`routeBar ${departure && arrival ? "active" : ""}`} />

            <div className="bus">
                🚌
            </div>

        </div>

        <div className="routePoint end">
            <div className={`point ${arrival ? "filled" : ""}`} />
            <span>{arrival || "Destination"}</span>
        </div>

    </div>

</div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="page">
        <div className="mainGrid">

          {/* ─── QUOTE FORM CARD ─── */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardHeaderLeft">
                <span className="sectionKicker">Formulaire de demande</span>
                <h2 className="cardTitle">Détails du trajet</h2>
              </div>
              <div className="progressPills">
                <div className="progressPill active">
                  <span className="progressPillNum">1</span>
                  <span className="progressPillLabel">Trajet</span>
                </div>
                <div className="progressPillConnector" />
                <div className={`progressPill ${formComplete ? "ready" : ""}`}>
                  <span className="progressPillNum">2</span>
                  <span className="progressPillLabel">Envoi</span>
                </div>
              </div>
            </div>

            <form className="quoteForm" onSubmit={handleSubmitQuote}>

              {/* Trip type */}
              <div className="fieldGroup">
                <label className="fieldLabel">Type de trajet</label>
                <div className="segmentedControl">
                  <button
                    type="button"
                    className={tripType === "aller-simple" ? "segment active" : "segment"}
                    onClick={() => setTripType("aller-simple")}
                  >
                    ↗ Aller simple
                  </button>
                  <button
                    type="button"
                    className={tripType === "aller-retour" ? "segment active" : "segment"}
                    onClick={() => setTripType("aller-retour")}
                  >
                    ⇄ Aller-retour
                  </button>
                </div>
              </div>

              {/* Departure / Arrival — main visual row */}
              <div className="routeInputRow">
                <div className="routeInputField">
                  <div className="routeInputIcon start">◉</div>
                  <div className="routeInputInner">
                    <label htmlFor="departure" className="routeInputLabel">Départ</label>
                    <input
                      id="departure"
                      type="text"
                      placeholder="Ville ou adresse"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      className="routeInput"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="swapButton"
                  aria-label="Inverser départ et arrivée"
                  onClick={() => { const d = departure; setDeparture(arrival); setArrival(d); assistantTriggered.current = false; }}
                >
                  ⇄
                </button>
                <div className="routeInputField">
                  <div className="routeInputIcon end">◎</div>
                  <div className="routeInputInner">
                    <label htmlFor="arrival" className="routeInputLabel">Arrivée</label>
                    <input
                      id="arrival"
                      type="text"
                      placeholder="Ville ou adresse"
                      value={arrival}
                      onChange={(e) => setArrival(e.target.value)}
                      className="routeInput"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="formRow">
                <div className="fieldGroup">
                  <label htmlFor="departureDate" className="fieldLabel">Date de départ</label>
                  <input
                    id="departureDate"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>
                {tripType === "aller-retour" ? (
                  <div className="fieldGroup">
                    <label htmlFor="returnDate" className="fieldLabel">Date de retour</label>
                    <input
                      id="returnDate"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="fieldGroup">
                    <label className="fieldLabel">Date de retour</label>
                    <input type="text" disabled value="Non requis — aller simple" />
                  </div>
                )}
              </div>

              {/* Passengers / Luggage */}
              <div className="formRow">
                <div className="fieldGroup">
                  <label htmlFor="passengers" className="fieldLabel">Passagers</label>
                  <div className="passengerInput">
                    <button type="button" className="passengerBtn" onClick={() => setPassengers((v) => String(Math.max(1, parseInt(v || "1") - 1)))}>−</button>
                    <input
                      id="passengers"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="passengerCount"
                    />
                    <button type="button" className="passengerBtn" onClick={() => setPassengers((v) => String(parseInt(v || "0") + 1))}>+</button>
                  </div>
                </div>
                <div className="fieldGroup">
                  <label className="fieldLabel">Bagages</label>
                  <div className="luggageToggle">
                    <button
                      type="button"
                      className={`luggageOption ${luggage === "oui" ? "active" : ""}`}
                      onClick={() => setLuggage("oui")}
                    >
                      🧳 Avec
                    </button>
                    <button
                      type="button"
                      className={`luggageOption ${luggage === "non" ? "active" : ""}`}
                      onClick={() => setLuggage("non")}
                    >
                      🎒 Sans
                    </button>
                  </div>
                </div>
              </div>

              {/* Trip category */}
              <div className="fieldGroup">
                <label htmlFor="tripCategory" className="fieldLabel">Type de voyage</label>
                <select
                  id="tripCategory"
                  value={tripCategory}
                  onChange={(e) => setTripCategory(e.target.value)}
                >
                  {TRIP_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="fieldGroup">
                <label htmlFor="notes" className="fieldLabel">
                  Informations complémentaires
                  <span className="fieldLabelOptional">optionnel</span>
                </label>
                <textarea
                  id="notes"
                  placeholder="Départ tôt le matin, arrêt intermédiaire, car accessible PMR, équipements spéciaux…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="formFooter">
                <div className="formHint">
                  <span className="formHintIcon">✓</span>
                  <span className="formHintText">
                    Devis gratuit, sans engagement — réponse sous 2h ouvrées
                  </span>
                </div>
                <button
                  type="submit"
                  className={`submitButton ${submitting ? "loading" : ""} ${!formComplete ? "disabled" : ""}`}
                  disabled={submitting || !formComplete}
                >
                  {submitting ? (
                    <>
                      <span className="submitSpinner" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Demander mon devis
                      <span className="submitArrow">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ─── ASSISTANT CARD ─── */}
          <aside className="card assistantCard">
            <div className="cardHeader">
              <div className="cardHeaderLeft">
                <span className="sectionKicker">Assistant IA</span>
                <h2 className="cardTitle">Besoin d'aide ?</h2>
              </div>
              <span className="statusBadge ai">
                <span className="statusBadgeDot" />
                En ligne
              </span>
            </div>

            <div className="assistantBody">
              <div className="assistantOnline">
                <div className="onlineDot" />
                <span className="onlineText">Répond en quelques secondes</span>
              </div>

              <div className="promptChips">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    className="promptChip"
                    onClick={() => handleSendChat(prompt.text)}
                    disabled={loading}
                    type="button"
                  >
                    <span className="promptChipIcon">{prompt.icon}</span>
                    {prompt.label}
                  </button>
                ))}
              </div>

              <div className="chatBox" ref={chatBoxRef}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.role === "user" ? "userMessage" : "assistantMessage"}`}
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
                    <div className="typingIndicator">
                      <div className="typingDot" />
                      <div className="typingDot" />
                      <div className="typingDot" />
                    </div>
                  </div>
                )}
              </div>

              <div className="chatInputArea">
                <textarea
                  rows={3}
                  placeholder="Ex. 40 personnes, Paris → Bruxelles avec bagages…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={loading || !chatInput.trim()}
                  className="chatSendButton"
                  aria-label="Envoyer"
                >
                  ↑
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── FEATURE BAR ─── */}
        <div className="featureBar">
          <div className="featureCard">
            <div className="featureIconWrap">🚌</div>
            <div className="featureTitle">Trajets sur mesure</div>
            <p className="featureDesc">
              Aller simple, aller-retour, arrêts intermédiaires — chaque demande est adaptée à votre groupe.
            </p>
          </div>
          <div className="featureCard">
            <div className="featureIconWrap">⚡</div>
            <div className="featureTitle">Réponse sous 2h</div>
            <p className="featureDesc">
              Un conseiller dédié revient vers vous rapidement avec un tarif personnalisé et transparent.
            </p>
          </div>
          <div className="featureCard">
            <div className="featureIconWrap">📄</div>
            <div className="featureTitle">Devis PDF et suivi</div>
            <p className="featureDesc">
              Votre devis est généré automatiquement, enregistré dans votre espace client et disponible à tout moment.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function NavBar() {
  return (
    <header className="nav">
      <div className="navInner">
        <a href="/" className="navLogo">
          <div className="navLogoIcon">🚌</div>
          <span className="navLogoText">NeoTravel</span>
        </a>
        <nav className="navLinks">
          <a href="#" className="navLink">Devis</a>
          <a href="#" className="navLink">Destinations</a>
          <a href="#" className="navLink">Nos cars</a>
          <a href="#" className="navLink">Contact</a>
        </nav>
        <a href="#" className="navCta">Espace client</a>
      </div>
    </header>
  );
}