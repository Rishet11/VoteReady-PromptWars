export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  actionRequired: boolean;
}

export const electionTimeline: TimelineStep[] = [
  {
    id: "registration",
    title: "1. Voter Registration",
    description: "Submit Form 6 to register as a new voter. Your name must be on the electoral roll to vote.",
    actionRequired: true,
  },
  {
    id: "verification",
    title: "2. Status Verification",
    description: "Check if your name appears on the voter list via electoralsearch.eci.gov.in.",
    actionRequired: true,
  },
  {
    id: "epic",
    title: "3. Receive EPIC",
    description: "Your Electors Photo Identity Card (Voter ID) is issued. You can also download the e-EPIC.",
    actionRequired: false,
  },
  {
    id: "campaigning",
    title: "4. Campaign Period",
    description: "Candidates present their manifestos. The Model Code of Conduct is enforced by the ECI.",
    actionRequired: false,
  },
  {
    id: "polling",
    title: "5. Polling Day",
    description: "Visit your polling booth with your EPIC or an approved ID. Cast your vote using the EVM.",
    actionRequired: true,
  },
  {
    id: "results",
    title: "6. Counting & Results",
    description: "Votes are counted and results are officially declared by the Election Commission.",
    actionRequired: false,
  }
];
