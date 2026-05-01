export interface StateElectionData {
  name: string;
  code: string;
  deadline: string; // ISO format date (YYYY-MM-DD)
  electionType: string;
  electionDate: string; // ISO format date (YYYY-MM-DD)
  residencyDays: number;
  registrationUrl: string;
  verificationUrl: string;
  voterHelpline: string;
}

export const electionData: Record<string, StateElectionData> = {
  "DL": {
    name: "Delhi",
    code: "DL",
    deadline: "2026-05-15",
    electionType: "Legislative Assembly Election",
    electionDate: "2026-05-30",
    residencyDays: 180,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    voterHelpline: "1950"
  },
  "MH": {
    name: "Maharashtra",
    code: "MH",
    deadline: "2026-05-24",
    electionType: "Municipal Corporation Election",
    electionDate: "2026-05-26",
    residencyDays: 180,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    voterHelpline: "1950"
  },
  "KA": {
    name: "Karnataka",
    code: "KA",
    deadline: "2026-06-05",
    electionType: "Panchayat Election",
    electionDate: "2026-06-20",
    residencyDays: 180,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    voterHelpline: "1950"
  },
  "UP": {
    name: "Uttar Pradesh",
    code: "UP",
    deadline: "2026-05-28",
    electionType: "Legislative Assembly Election",
    electionDate: "2026-06-12",
    residencyDays: 180,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    voterHelpline: "1950"
  },
  "WB": {
    name: "West Bengal",
    code: "WB",
    deadline: "2026-05-20",
    electionType: "Legislative Assembly Election",
    electionDate: "2026-06-04",
    residencyDays: 180,
    registrationUrl: "https://voters.eci.gov.in/",
    verificationUrl: "https://electoralsearch.eci.gov.in/",
    voterHelpline: "1950"
  }
};
