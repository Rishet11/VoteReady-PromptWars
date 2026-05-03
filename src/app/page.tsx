"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  PinInput,
  EligibilityCard,
  DeadlineCard,
  CtaButton,
  StatePickerModal,
  SkipLink,
  trackEvent
} from "@/components";
import { type PollingPlace, type PinStateMap } from "@/data/pinToState";
import { electionData, type StateElectionData } from "@/data/electionData";
import { CheckCircle2 } from "lucide-react";
// Dynamic imports for efficiency — only loaded when user triggers the relevant UI
const PostRegGuidance = dynamic(() => import("@/components/PostRegGuidance").then(mod => mod.PostRegGuidance), { ssr: false });
const PollingPlaceCard = dynamic(() => import("@/components/PollingPlaceCard").then(mod => mod.PollingPlaceCard), { ssr: false });
const ElectionTimeline = dynamic(() => import("@/components/ElectionTimeline").then(mod => mod.ElectionTimeline));
const ElectionGlossary = dynamic(() => import("@/components/ElectionGlossary").then(mod => mod.ElectionGlossary));

type PinLookupResponse =
  | {
      found: true;
      cached: boolean;
      mapping: PinStateMap;
    }
  | {
      found: false;
      cached: false;
    }
  | {
      error: string;
    };

export default function Home() {
  const [activeState, setActiveState] = useState<StateElectionData | null>(null);
  const [activePollingPlace, setActivePollingPlace] = useState<PollingPlace | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const lookupRequestIdRef = useRef(0);

  const handlePinChange = useCallback(async (pin: string, isValid: boolean) => {
    const requestId = lookupRequestIdRef.current + 1;
    lookupRequestIdRef.current = requestId;

    if (!isValid) {
      setActiveState(null);
      setActivePollingPlace(null);
      setShowGuidance(false);
      setIsLookingUpPin(false);
      return;
    }

    setIsLookingUpPin(true);

    try {
      const response = await fetch("/api/pin-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (lookupRequestIdRef.current !== requestId) {
        return;
      }

      const result = (await response.json()) as PinLookupResponse;
      if (!response.ok || "error" in result) {
        throw new Error("PIN lookup failed");
      }

      if (result.found) {
        setActiveState(electionData[result.mapping.state] || null);
        setActivePollingPlace(result.mapping.pollingPlace);
        setShowStatePicker(false);
        setShowGuidance(false);
        trackEvent('lookup_pin', 'engagement', result.mapping.state);
        return;
      }

      setShowStatePicker(true);
      trackEvent('lookup_pin_fail', 'engagement', 'unmapped_pin');
    } catch {
      if (lookupRequestIdRef.current === requestId) {
        setShowStatePicker(true);
        trackEvent('lookup_pin_fail', 'engagement', 'pin_lookup_error');
      }
    } finally {
      if (lookupRequestIdRef.current === requestId) {
        setIsLookingUpPin(false);
      }
    }
  }, []);

  const handleStateSelect = useCallback((stateCode: string) => {
    setActiveState(electionData[stateCode] || null);
    // Clear polling place as we don't have exact zip match
    setActivePollingPlace(null);
    setShowGuidance(false);
    trackEvent('state_select', 'engagement', stateCode);
  }, []);

  const handleRegisterClick = useCallback(() => {
    setShowGuidance(true);
  }, []);

  return (
    <>
      <SkipLink />

      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl">
              V
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">VoteReady</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">

        {/* Intro */}
        <section className="text-center py-6 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Ready to make your voice heard?
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Find everything you need to know about registering and voting in your state.
          </p>
        </section>

        {/* PIN Input Section */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center animate-slide-up">
          <PinInput onPinChange={handlePinChange} className="w-full" />
          {isLookingUpPin && (
            <p className="mt-3 text-sm text-gray-600" role="status">
              Checking PIN code...
            </p>
          )}
        </section>

        {/* Dynamic Content based on State */}
        {activeState && (
          <div className="flex flex-col gap-6" data-testid="state-result">

            {/* 1. Eligibility */}
            <EligibilityCard stateData={activeState} />

            {/* 2. Deadline */}
            <DeadlineCard stateData={activeState} />

            {/* 3. CTA */}
            {!showGuidance ? (
              <div className="py-6 flex justify-center">
                <CtaButton
                  url={activeState.registrationUrl}
                  onClick={handleRegisterClick}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="py-2">
                {/* Registration Started state */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg mb-6">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <p className="font-medium">Heading to {activeState.name}&apos;s registration portal.</p>
                </div>

                {/* Post Registration Guidance from Gemini */}
                <PostRegGuidance stateData={activeState} />
              </div>
            )}

            {/* 4. Polling Place (if we have exact PIN match) */}
            {activePollingPlace && (
              <PollingPlaceCard pollingPlace={activePollingPlace} />
            )}

            <div className="border-t border-gray-200 my-4"></div>

            {/* 5. Educational Content */}
            <section className="flex flex-col gap-6">
              <ElectionTimeline />
              <ElectionGlossary />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 px-4 mt-12 text-center text-sm text-gray-500">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <p>VoteReady — An Election Process Assistant</p>
          <p>Data provided for demonstration purposes. Always refer to the <a href="https://voters.eci.gov.in/" className="text-blue-600 underline hover:no-underline" target="_blank" rel="noopener noreferrer">official ECI website</a> for accurate information.</p>
        </div>
      </footer>

      {/* State Picker Fallback */}
      <StatePickerModal
        isOpen={showStatePicker}
        onClose={() => setShowStatePicker(false)}
        onSelectState={handleStateSelect}
      />
    </>
  );
}
