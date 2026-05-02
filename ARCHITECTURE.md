# System Architecture

## Component Hierarchy

```mermaid
graph TD
    A[Root Layout] --> B[Home Page]
    B --> C[PinInput]
    B --> D[EligibilityCard]
    B --> E[DeadlineCard]
    B --> F[CtaButton]
    B --> G[PollingPlaceCard]
    B --> H[ElectionTimeline]
    B --> I[ElectionGlossary]
    B --> J[PostRegGuidance]
    
    G --> K[GoogleMapsEmbed]
    B --> L[StatePickerModal]
```

## Data Flow (Gemini Post-Registration Guidance)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextApi as Next.js API Route (/api/guidance)
    participant Gemini as Google Gemini 3 Flash API
    participant Translate as Google Cloud Translation API
    
    User->>Frontend: Clicks "Be a Voter"
    Frontend->>NextApi: POST { stateCode: "DL", language: "hi" }
    NextApi->>NextApi: Validate language, sanitize input & lookup election data
    NextApi->>NextApi: Construct System & User Prompt
    NextApi->>Gemini: generateContent(Prompt)
    Note over Gemini: 5-second Timeout
    Gemini-->>NextApi: Response Text
    NextApi->>Translate: Translate if non-English requested
    Note over Translate: 3-second Timeout
    Translate-->>NextApi: Localized text or English fallback
    NextApi-->>Frontend: { guidance, fallback, cached, language, translated, source }
    Frontend-->>User: Renders Personalized Guidance
```

## Security & Privacy Design
1. **Stateless AI Calls:** We pass the user's State Code to Gemini, not their PIN Code or any Personal Identifiable Information (PII).
2. **Server-Side Masking:** The `GEMINI_API_KEY` is loaded on the server side (`/api/guidance/route.ts`). It is never bundled or leaked to the client.
3. **Graceful Degradation:** If Gemini or Translation times out or fails, predefined English guidance is returned and the UI labels the fallback state.
4. **Analytics Privacy:** Unmapped PIN lookups are tracked as a generic event label, never as raw PIN codes.
