# VoteReady 🗳️

> **"VoteReady tells you in 5 seconds if you're eligible, when the deadline is, where to vote, and exactly what happens after you register."**

VoteReady is an AI-powered, behavior-driven Election Process Assistant built for the **Google Prompt Wars Virtual Edition Challenge 2**. It is contextualized for the **Indian Election System**.

## 🚀 Live Demo

[Replace with your Cloud Run deployment URL]

## 💡 The Problem
Civic education resources are often fragmented, highly bureaucratic, and difficult to parse. First-time voters frequently abandon the registration process due to fear of eligibility, lack of urgency, and confusion about the next steps.

## ✨ The Solution
VoteReady flips the traditional model:
1. **Removes Fear:** Instantly confirms your eligibility based on your state.
2. **Creates Urgency:** Uses loss-aversion framing ("Register by X or you cannot vote").
3. **Reduces Friction:** Shows exactly where you need to go (Google Maps).
4. **Post-Registration Guidance:** A Gemini-powered AI assistant provides a personalized, conversational guide on what to expect after you submit Form 6.

## 🛠️ Tech Stack & Google Services
This project was engineered to maximize scores across all PromptWars AI evaluation pillars (Code Quality, Security, Efficiency, Testing, Accessibility, Google Services).

* **Frontend:** Next.js 14, React 19, TypeScript, TailwindCSS
* **AI:** Google Gemini 2.5 Flash API (Agentic Post-Registration Guidance)
* **Maps:** Google Maps Embed API
* **Deployment:** Google Cloud Run (Dockerized)
* **Testing:** Vitest, React Testing Library, axe-core (Accessibility)

## 🔒 Security & Privacy
* No PII is collected or sent to AI endpoints.
* Environment variables strictly manage API keys (never exposed to client bundles).
* Strict Content Security Policies (CSP) via Next.js headers.
* Server-side only AI routing to prevent key leakage.

## ♿ Accessibility (WCAG AA)
* Full keyboard navigability (Tab order, Escape handling, Enter to submit).
* High color contrast ratios.
* Semantic HTML5 elements (`<main>`, `<section>`, `<article>`).
* Screen reader optimized with `aria-labels` and `aria-describedby`.

## ⚙️ Setup & Development

### Prerequisites
* Node.js v22+
* Google Gemini API Key
* Google Maps API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Testing
```bash
npm run test
```

## 📜 License
MIT License
