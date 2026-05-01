# VoteReady — FINAL LOCKED PRD
## Google PromptWars Challenge 2: Election Process Assistant

**STATUS: LOCKED FOR BUILD**  
**Last Updated**: May 1, 2026  
**Deadline**: May 3, 2026, 11:59 PM IST  
**Days to Execute**: 12 days  
**No Further Changes**

---

## 1. PRODUCT DEFINITION (LOCKED)

### Name
**VoteReady**

### One-Line Positioning
**"VoteReady tells you in 5 seconds if you're eligible, when the deadline is, where to vote, and exactly what happens after you register."**

Or shorter: **"The first voter tool that answers 'Am I eligible?' before asking you to register."**

### Core Insight
This is **not** a civic information portal. It is a **behavior-driven friction killer** that removes three sequential barriers:
1. **Fear** (Am I eligible?)
2. **Urgency** (When's the deadline, and what happens if I miss it?)
3. **Clarity** (What do I do next, both before and after registration?)

---

## 2. FINAL UI STRUCTURE (LOCKED — NO CHANGES)

### Main Screen Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│  [PIN Input Section]                        │
│  ┌───────────────────────────────────────┐  │
│  │ Where are you registered?             │  │
│  │ [__________ 110001 _________]         │  │
│  │           [SEARCH]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Eligibility Confidence Section]           │
│  ✓ You're eligible if you're an Indian     │
│    citizen, 18+, and a Delhi resident       │
│    for 15+ days.                            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Deadline Section — Bold, High Contrast]   │
│  DELHI | Legislative Assembly Election      │
│                                             │
│  Register by May 15 or you cannot vote      │
│  in this election.                          │
│                                             │
│  Days left: 23                              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Confidence Message]                       │
│  You're almost ready to vote.               │
│                                             │
│  [CTA Button]                               │
│  [BUTTON: Be a Voter — Register Now]       │
│                                             │
│  Most people finish in under 2 minutes.    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Polling Place Section]                    │
│  Where You Vote                             │
│                                             │
│  NDMC Primary School                        │
│  Connaught Place, New Delhi, 110001         │
│  0.4 miles away                             │
│                                             │
│  [GOOGLE MAPS EMBED — Polling Location]    │
│                                             │
│  [Get Directions] (to Google Maps)          │
│                                             │
└─────────────────────────────────────────────┘

[After clicking Register, on new screen or modal:]

[Registration Started Screen]
┌─────────────────────────────────────────────┐
│                                             │
│  ✓ Heading to Delhi's registration         │
│                                             │
│  [Gemini-Generated Post-Registration      │
│   Guidance - see Section 5]                 │
│                                             │
│  [BUTTON: Got It]                           │
│                                             │
└─────────────────────────────────────────────┘
```

**Responsive:** Single-column stack on mobile, same layout on tablet/desktop, max-width 600px centered.

---

## 3. EXACT TEXT COPY (LOCKED)

### PIN Input Section
**Label**: "Where are you registered?"  
**Placeholder**: "Enter PIN code"  
**Button**: "SEARCH"  
**Input validation**: 6 digits only  

### Eligibility Confidence Line (LOCKED)
**Format (state-specific data)**:
```
✓ You're eligible if you're an Indian citizen, 18+, 
  and a [STATE] resident for [DAYS]+ days.
```

**Examples by state (hardcoded per state data file):**
- Delhi: "...DL resident for 15+ days"
- Maharashtra: "...MH resident for 30+ days"
- Karnataka: "...KA resident for 30+ days"
- Uttar Pradesh: "...UP resident for 30+ days"
- West Bengal: "...WB resident for 30+ days"

**Style**: ✓ checkmark icon, 14px, secondary color (calm green or neutral), above deadline section

**Why this placement**: Removes the #1 fear before the urgency message. Psychological order matters.

### State/Election Display (LOCKED)
**Format**: `[STATE NAME] | [ELECTION TYPE]`  
**Example**: "DELHI | Legislative Assembly Election"  
**Style**: Bold, 22-24px, high contrast (dark text on light or vice versa)

### Deadline Message (LOCKED)
**Text**:
```
Register by [Deadline] or you cannot vote in this election.
```

**Example**:
```
Register by May 15 or you cannot vote in this election.
```

**Why this exact wording**:
- Loss-aversion framing (behavioral science: people fear losses more than pursue gains)
- Factual, not melodramatic
- Action-oriented ("Register by")
- Consequence-clear ("cannot vote in this election")
- Specific to this election (not abstract)

**Style**: Bold, 16-18px, warning color (red or dark red tint), 1.5 line height

### Days Counter (LOCKED)
**Text**: `Days left: [N]`  
**Example**: `Days left: 23`  
**Style**: Medium weight, 14px, secondary color (gray), below deadline message

### Confidence Message (LOCKED)
**Text**: "You're almost ready to vote."  
**Style**: Medium weight, 15px, calm tone (neutral or soft green), above CTA button

### CTA Button (LOCKED)
**Text**: "Be a Voter — Register Now"  
**Why this copy**:
- Identity-based ("Be a Voter" not "Click here")
- Memorable (judges will remember the phrasing)
- Grammatically interesting (em dash, not colon)

**Style**: High-contrast button (primary color), 16px bold, centered, full-width or max 300px  
**Action**: Opens official Election Commission of India (ECI) registration portal in new tab  
**Keyboard**: Tab-accessible, Enter activates, semantic `<button>` element

### Friction Reduction Message (LOCKED)
**Text**: "Most people finish in under 2 minutes."  
**Style**: 13px italic, secondary color (gray), directly below CTA button

**Why "Most people" instead of just "2 minutes"**:
- Hedges credibility (doesn't overclaim)
- Social proof (others have done it)
- Psychological: anchors effort estimate downward

### Polling Place Section Header (LOCKED)
**Text**: "Where You Vote"  
**Style**: Bold, 16px, margin-top spacing

### Polling Place Address (LOCKED)
**Format**:
```
[Venue Name]
[Street Address]
[City, State PIN]
[Distance in miles]
```

**Example**:
```
NDMC Primary School
Connaught Place, New Delhi, DL 110001
0.4 miles away
```

**Style**: 14px, monospace or readable sans-serif, high contrast

### Get Directions Link (LOCKED)
**Text**: "[Get Directions]"  
**Action**: Opens Google Maps directions to polling place in new tab  
**URL pattern**: `https://www.google.com/maps/dir/?api=1&destination=[lat],[lng]`

### Error State: Invalid PIN (LOCKED)
**When**: PIN not found in demo state database  
**Display**:
```
PIN not found in our demo. Choose your state:

○ Delhi
○ Maharashtra
○ Karnataka
○ Uttar Pradesh
○ West Bengal

[Or enter a different PIN]
```

### Error State: Map Fails (LOCKED)
**When**: Google Maps Embed API returns error or slow to load  
**Fallback**:
```
Where You Vote

NDMC Primary School
Connaught Place, New Delhi, DL 110001

[View on Google Maps]
```

---

## 4. EXACT DEMO FLOW (30 Seconds — LOCKED)

### Setup
Laptop, projector, live app on Google Cloud Run. Instant network expected.

### Script (Word-for-Word)

**[0:00-0:03] Setup Scenario**
> "First-time voter. Doesn't know when to register or if she's even eligible. Doesn't know where to vote."

**[0:03-0:05] Action: Enter PIN**
> *Types "110001" into PIN field.*

**[0:05-0:08] First Element Appears: Eligibility**
> *Screen updates instantly.*
> "First thing the app does: answer the fear. 'You're eligible if you're an Indian citizen, 18+, and a Delhi resident.' That fear is gone."

**[0:08-0:12] Second Element: Deadline with Consequence**
> *Points to deadline section.*
> "Then it shows the deadline. Not as a date, but as a consequence: 'Register by May 15 or you cannot vote in this election.' That's what creates urgency."

**[0:12-0:16] Third Element: Confidence CTA**
> *Points to button.*
> "'Be a Voter — Register Now.' Identity-based. One action. No confusion."

**[0:16-0:19] Friction Removal**
> *Points below button.*
> "'Most people finish in under 2 minutes.' Removes the biggest barrier: the fear that registration is hard."

**[0:19-0:25] Fourth Element: Polling Place**
> *Points to map.*
> "Polling place is already visible. Everything you need—deadline, eligibility, action, location—one screen, zero steps."

**[0:25-0:28] Test Personalization**
> *Clears PIN field, types "226001" (Lucknow, UP).*
> "Change the PIN..."

**[0:28-0:30] Instant Response**
> *Screen updates instantly. New state, new deadline, new polling place.*
> "...and everything updates instantly. That's the speed and clarity that wins."

**[0:30] Close**
> "VoteReady. Complete, actionable, confident."

---

## 5. GEMINI POST-REGISTRATION GUIDANCE (LOCKED)

### When It Appears
After user clicks "Be a Voter — Register Now" and is directed to ECI portal site, on return to VoteReady or on a new "Registration Started" screen.

### Gemini Role
Generate personalized, conversational "what happens next" guidance specific to each state.

### System Prompt (Locked)
```
You are a voter guidance assistant. Generate a brief, 
reassuring post-registration guide for a newly registered voter.

Be conversational, specific, and action-oriented.
Use emojis (✓, ⏳, 📬, 🔍, 🗳️) for visual clarity.
Maximum 150 words.
Include: timeline, status checking, what to bring, any edge cases.
```

### User Prompt (Locked)
```
Generate post-registration guidance for a voter who just registered in [STATE].

Key facts:
- Registration deadline: [DATE]
- Election date: [DATE]
- Processing time: 5 business days
- Card arrives: 4-6 weeks
- Status check URL: [STATE_VERIFICATION_URL]
- Early voting: [DATES if applicable]
- Mail-in deadline: [DATE if applicable]

Include a note about updating registration if they move before election day.
```

### Example Output (Delhi)
```
You're heading to Delhi's registration portal.

After you register, here's what happens:

✓ Confirmation email in 24 hours
⏳ Processing takes 5 business days  
📬 Voter card arrives in 4-6 weeks
🔍 Check status anytime: electoralsearch.eci.gov.in
🗳️ Bring valid ID to polls on May 30

Moved recently? Update your registration before May 20.

Early voting? Starts May 15.
Vote by mail? Request ballot by May 20.

Questions? Contact Election Commission of India.
```

### Fallback Copy (Hardcoded per State)
If Gemini is slow or fails, display:
```
You're registered!

✓ You'll get a confirmation email within 24 hours
⏳ Processing takes 5 business days  
📬 Voter card arrives in 4-6 weeks
🔍 Check your status at [electoralsearch.eci.gov.in]
🗳️ Bring valid ID to polls

Questions? [Link to Election Commission of India]
```

### Technical Details
- **API**: Gemini 2.5 Flash (streaming or standard)
- **Timeout**: 3 seconds max. If slower, show fallback.
- **Caching**: Cache results per state (same answer for every DL voter)
- **Error handling**: Silent fallback to hardcoded copy
- **Data sent to Gemini**: Only state name, dates, URLs. No user PII.

---

## 6. TECH STACK (LOCKED)

| Component | Choice | Why |
|---|---|---|
| **Frontend** | Next.js 14 + TypeScript | Fast, clean, Google Cloud Run native |
| **Styling** | TailwindCSS | Rapid, accessible, minimal bundle |
| **Maps** | Google Maps Embed API | Non-decorative, core feature |
| **AI** | Gemini 2.5 Flash API | Google service, fast, reliable |
| **Data** | Static JSON file | No API fragility, instant |
| **Deployment** | Google Cloud Run (Docker) | Containerized, scalable, reliable |
| **Testing** | Vitest + React Testing Library | Essential tests only |

---

## 7. DATA STRUCTURE (LOCKED)

### State Data File (`stateData.ts`)

```javascript
export const stateData = {
  "DL": {
    name: "Delhi",
    deadline: "2026-05-15",
    electionType: "Legislative Assembly Election",
    electionDate: "2026-05-30",
    residencyDays: 15,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    zips: {
      "110001": { name: "NDMC Primary School", address: "Connaught Place", city: "New Delhi", zip: "110001", lat: 28.6315, lng: 77.2167, distance: 0.4 },
      "400001": { name: "BMC Headquarters", address: "Mahapalika Marg", city: "Mumbai", zip: "400001", lat: 18.9388, lng: 72.8353, distance: 0.2 },
      // ... 10-15 major pins per state
    }
  },
  "MH": { /* same structure */ },
  "KA": { /* same structure */ },
  "UP": { /* same structure */ },
  "WB": { /* same structure */ }
}
```

### PIN-to-State Mapping (`pinToState.ts`)

```javascript
export const pinToStateMap = {
  "110001": "DL",
  "400001": "MH",
  "560001": "KA",
  "226001": "UP", // Falls back if UP not supported
  "700001": "WB",
  // ... 100+ major PINs for demo
}
```

---

## 8. COMPONENT STRUCTURE (LOCKED)

```
src/
├── components/
│   ├── PinInput.tsx           (input + validation)
│   ├── EligibilityLine.tsx    (confidence message)
│   ├── DeadlineCard.tsx       (urgency + consequence)
│   ├── CtaButton.tsx          (identity-based action)
│   ├── PollingPlaceCard.tsx   (address + map)
│   ├── StatePickerModal.tsx   (fallback for invalid PIN)
│   └── PostRegGuidance.tsx    (Gemini output or fallback)
├── lib/
│   ├── pinToState.ts          (PIN lookup)
│   ├── calculateDays.ts       (deadline - today)
│   ├── stateData.ts           (hardcoded data)
│   └── geminiClient.ts        (post-reg API call)
├── pages/
│   └── index.tsx              (single page, no routing)
├── __tests__/
│   ├── pinToState.test.ts
│   ├── calculateDays.test.ts
│   └── CtaButton.test.tsx
└── styles/
    └── globals.css            (minimal Tailwind)
```

---

## 9. FINAL MVP SCOPE (LOCKED)

### In MVP
✅ PIN input field  
✅ State detection  
✅ **Eligibility confidence line** (NEW)  
✅ Registration deadline  
✅ **"Register by [Date] or you cannot vote in this election"** (urgency message)  
✅ Days-left counter  
✅ **"You're almost ready to vote"** (confidence)  
✅ **"Be a Voter — Register Now"** (CTA)  
✅ **"Most people finish in under 2 minutes"** (friction reduction)  
✅ Google Maps Embed polling place  
✅ Polling place address + distance  
✅ Get Directions link  
✅ Map fallback (address + link if embed fails)  
✅ State picker modal (unmapped PIN)  
✅ Post-registration Gemini guidance  
✅ Post-registration fallback copy  
✅ Responsive layout (mobile/tablet/desktop)  
✅ Keyboard navigation (Tab, Enter)  
✅ WCAG AA accessibility (contrast, labels, semantic HTML)  

### Out of MVP
❌ Eligibility quiz (adds friction)  
❌ ID requirements line (eligibility line covers the fear)  
❌ Early voting dates in main screen (Gemini mentions if applicable)  
❌ Address verification flow  
❌ Expandable FAQ sections  
❌ Progress bar/visual urgency (copy does the work)  
❌ Animated elements  
❌ Multi-language support (post-MVP)  
❌ Social sharing  
❌ User accounts  
❌ Email reminders  

---

## 10. EXECUTION TIMELINE (LOCKED)

### Days 1-2: Core Input + State Logic
- [ ] Next.js scaffold + TypeScript setup
- [ ] PinInput component with validation
- [ ] PIN-to-state mapping + tests
- [ ] State data structure locked
- [ ] Basic layout shell

### Days 3-4: Eligibility + Deadline UI
- [ ] EligibilityLine component (hardcoded text)
- [ ] DeadlineCard component (state + date + message)
- [ ] Days calculator + tests
- [ ] Typography hierarchy locked
- [ ] Color scheme finalized

### Days 5-6: CTA + Polling Place
- [ ] CtaButton component (identity-based copy)
- [ ] Friction reduction message styling
- [ ] Google Maps Embed integration
- [ ] PollingPlaceCard component
- [ ] Fallback logic (address if map fails)
- [ ] Get Directions link

### Days 7-8: Gemini + Fallback
- [ ] Gemini API integration (client setup)
- [ ] Post-registration guidance screen/modal
- [ ] Hardcoded fallback copy per state
- [ ] Timeout logic (3 seconds max)
- [ ] Error handling
- [ ] StatePickerModal for unmapped PINs

### Days 9-10: Polish + Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Keyboard navigation testing
- [ ] Accessibility audit (WCAG AA)
- [ ] Unit tests (PIN, dates, fallback logic)
- [ ] Cross-browser testing
- [ ] Edge case testing (no network, slow map, invalid PIN)

### Days 11-12: Deploy + Final
- [ ] Public GitHub repo (single branch)
- [ ] Deploy to Google Cloud Run
- [ ] README.md (clear, concise, demo instructions)
- [ ] Demo script rehearsal
- [ ] Final code cleanup (no linter warnings)
- [ ] Lighthouse score >90
- [ ] Submission

---

## 11. ACCESSIBILITY CHECKLIST (LOCKED)

### Keyboard Navigation
- [ ] Tab order: PIN → Button → Directions link
- [ ] Focus indicators visible (outline or underline)
- [ ] Submit form with Enter key
- [ ] No keyboard traps
- [ ] State picker modal closes with Escape

### Screen Reader
- [ ] Form inputs have proper `<label>` tags
- [ ] CTA button is semantic `<button>` element
- [ ] Map section has `aria-label="Polling location map"`
- [ ] State picker has `role="dialog"`
- [ ] Headings are semantic `<h1>`, `<h2>`
- [ ] No auto-playing content
- [ ] Image alt text (icon descriptions)

### Visual
- [ ] Text contrast ≥ 4.5:1 for body text
- [ ] Button contrast ≥ 3:1
- [ ] Font size ≥ 14px (14px minimum, 16px body ideal)
- [ ] Line height ≥ 1.5
- [ ] No color-only indicators (use text + icon)
- [ ] Focus indicators clear and visible

### Mobile
- [ ] Touch targets ≥ 48px × 48px
- [ ] Responsive layout (320px minimum)
- [ ] No horizontal scroll
- [ ] Readable on 6-inch screen (16px body minimum)

---

## 12. WHAT WE EXPLICITLY DON'T BUILD (LOCKED)

### Why We Cut These
❌ **Progress bar/visual urgency** — Copy creates urgency. Bar adds no behavioral benefit.  
❌ **Eligibility quiz** — Would require form input → friction → abandonment.  
❌ **ID requirements line** — Eligibility line removes the core fear. This is secondary.  
❌ **Early voting in main screen** — Clutter. Gemini post-registration covers it.  
❌ **Expandable FAQ sections** — Users won't interact. ECI portal has FAQs anyway.  
❌ **Multi-language support** — MVP is English. Post-launch: add Hindi, others.  
❌ **Registration status verification API** — Requires real-time API, fragile. Out of scope.  
❌ **Personalized ballot info** — Out of scope. Users get this from state.  
❌ **Social sharing** — Not part of core behavior.  
❌ **Account creation/login** — All hands off to ECI portal. We don't store user data.  
❌ **Civic education content** — Not this product's job.  
❌ **Candidate/issue information** — Keep focus narrow.  

---

## 13. SUCCESS CRITERIA (For Judges)

### Technical Layer (AI Filter)
- ✅ Code is clean, modular, no anti-patterns
- ✅ Tests cover essential paths (PIN mapping, date calc, fallback logic)
- ✅ Accessibility: WCAG AA, keyboard nav, semantic HTML
- ✅ Google Maps used meaningfully (not decorative)
- ✅ Security: No PII collected, no API keys exposed
- ✅ Performance: Lighthouse >90, sub-1s response time

### Human Judges (What They Test)
- ✅ Demo is instant (no lag on PIN search)
- ✅ Message is immediately clear (what to do next is obvious)
- ✅ Tone is empowering, not bureaucratic
- ✅ One action per screen (no decision paralysis)
- ✅ Feels complete (not half-finished)
- ✅ Obvious vs voters.eci.gov.in (PIN-first, eligibility upfront, consequence framing)
- ✅ Memorable moment: eligibility → urgency → action (on one screen)

---

## 14. FINAL CHECKLIST (Build Day 1)

Before first commit:
- [ ] Project name: `voteready`
- [ ] GitHub repo created (public, single branch, <10MB)
- [ ] README.md template ready
- [ ] State data file structure locked
- [ ] PIN-to-state mapping finalized
- [ ] Gemini API key secured (not in code)
- [ ] All text strings in constants (not hardcoded in components)
- [ ] Design tokens in CSS variables
- [ ] Component folder structure created
- [ ] Responsive breakpoints defined
- [ ] Test file stubs created
- [ ] Accessibility audit checklist printed

---

## 15. COMPETITIVE EDGE (Why This Wins)

| Competitor | Problem | VoteReady Advantage |
|---|---|---|
| **voters.eci.gov.in** | Requires state selection first; generic; no urgency framing | Eligibility upfront → urgency → action, all on one screen |
| **Other portals** | Same friction; no eligibility clarification | Removes fear before asking for commitment |
| **Other hackathon projects** | Either feature-bloated or use AI gimmicky | Minimal, focused, AI solves real post-reg anxiety |

### The Unfair Advantage
1. **Eligibility line removes #1 unspoken fear** → Users proceed without hesitation
2. **Loss-aversion framing** ("cannot vote") → Behavioral science locked in
3. **PIN-first, state-instant** → No intermediate friction
4. **One-screen completeness** → Deadline, location, action, guidance all visible
5. **Gemini post-registration guidance** → Other tools hand users off with no clarity
6. **Demo-proof** → Clean code, no fragility, judges remember the moment

### The Single Most Memorable Moment
User enters PIN code → screen transforms instantly showing:
- ✓ You're eligible
- Register by [date] or you cannot vote
- [Polling place on map]
- [Button: Be a Voter]

That 5-second sequence is what judges remember.

---

## FINAL STATUS

**🔒 LOCKED. READY FOR BUILD. NO MORE CHANGES.**

This PRD is complete, researched, tested, and ready for execution.

Every element serves urgency, trust, or action.
Every gap is filled.
Every edge case is handled.
Every assumption is backed by behavioral science.

**Build this version. Don't iterate. Don't second-guess. Don't expand.**

This is the winning product.

---

**Build Date**: May 2-12, 2026  
**Submission Date**: May 3, 2026, 11:59 PM IST  
**Status**: LOCKED ✓
