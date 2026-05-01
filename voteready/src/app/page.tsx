"use client";

import { useState } from "react";
import { PinInput } from "@/components/PinInput";
import { EligibilityCard } from "@/components/EligibilityCard";
import { DeadlineCard } from "@/components/DeadlineCard";
import { CtaButton } from "@/components/CtaButton";
import { PollingPlaceCard } from "@/components/PollingPlaceCard";
import { StatePickerModal } from "@/components/StatePickerModal";
import { PostRegGuidance } from "@/components/PostRegGuidance";
import { ElectionTimeline } from "@/components/ElectionTimeline";
import { ElectionGlossary } from "@/components/ElectionGlossary";
import { SkipLink } from "@/components/SkipLink";
import { pinToStateMap } from "@/data/pinToState";
import { electionData, StateElectionData } from "@/data/electionData";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const [activeState, setActiveState] = useState<StateElectionData | null>(null);
  const [activePollingPlace, setActivePollingPlace] = useState<any | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const handlePinChange = (pin: string, isValid: boolean) => {
    if (!isValid) {
      setActiveState(null);
      setActivePollingPlace(null);
      return;
    }

    const mapping = pinToStateMap[pin];
    if (mapping) {
      setActiveState(electionData[mapping.state]);
      setActivePollingPlace(mapping.pollingPlace);
    } else {
      // Show modal to pick state if PIN is not in our demo db
      setShowStatePicker(true);
    }
  };

  const handleStateSelect = (stateCode: string) => {
    setActiveState(electionData[stateCode]);
    // Clear polling place as we don't have exact zip match
    setActivePollingPlace(null);
  };

  const handleRegisterClick = () => {
    setShowGuidance(true);
  };

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
        </section>

        {/* Dynamic Content based on State */}
        {activeState && (
          <div className="flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
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
                  <p className="font-medium">Heading to {activeState.name}'s registration portal.</p>
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
          <p>Data provided for demonstration purposes. Always refer to the <a href="https://voters.eci.gov.in/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">official ECI website</a> for accurate information.</p>
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
