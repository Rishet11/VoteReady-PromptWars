export interface PollingPlace {
  name: string;
  address: string;
  city: string;
  pin: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface PinStateMap {
  state: string;
  pollingPlace: PollingPlace;
}

export const pinToStateMap: Record<string, PinStateMap> = {
  // Delhi PINs
  "110001": {
    state: "DL",
    pollingPlace: {
      name: "NDMC Primary School",
      address: "Connaught Place",
      city: "New Delhi",
      pin: "110001",
      lat: 28.6315,
      lng: 77.2167,
      distance: 0.3
    }
  },
  "110020": {
    state: "DL",
    pollingPlace: {
      name: "Govt Boys Senior Secondary School",
      address: "Okhla Phase 1",
      city: "New Delhi",
      pin: "110020",
      lat: 28.5273,
      lng: 77.2785,
      distance: 0.5
    }
  },
  "110032": {
    state: "DL",
    pollingPlace: {
      name: "Shahdara Govt School",
      address: "Bholanath Nagar",
      city: "Shahdara, Delhi",
      pin: "110032",
      lat: 28.6734,
      lng: 77.2908,
      distance: 0.6
    }
  },
  // Maharashtra PINs
  "400001": {
    state: "MH",
    pollingPlace: {
      name: "Fort Convent School",
      address: "Fort",
      city: "Mumbai",
      pin: "400001",
      lat: 18.9322,
      lng: 72.8339,
      distance: 0.4
    }
  },
  "411001": {
    state: "MH",
    pollingPlace: {
      name: "Cantonment Board School",
      address: "Camp",
      city: "Pune",
      pin: "411001",
      lat: 18.5204,
      lng: 73.8567,
      distance: 0.8
    }
  },
  // Karnataka PINs
  "560001": {
    state: "KA",
    pollingPlace: {
      name: "St. Joseph's Boys' High School",
      address: "Museum Road",
      city: "Bengaluru",
      pin: "560001",
      lat: 12.9716,
      lng: 77.5946,
      distance: 0.6
    }
  },
  "570001": {
    state: "KA",
    pollingPlace: {
      name: "Maharani's Science College",
      address: "JLB Road",
      city: "Mysuru",
      pin: "570001",
      lat: 12.2958,
      lng: 76.6394,
      distance: 1.1
    }
  },
  // Uttar Pradesh PINs
  "226001": {
    state: "UP",
    pollingPlace: {
      name: "Colvin Taluqdars' College",
      address: "University Road",
      city: "Lucknow",
      pin: "226001",
      lat: 26.8467,
      lng: 80.9462,
      distance: 0.7
    }
  },
  "201301": {
    state: "UP",
    pollingPlace: {
      name: "Delhi Public School",
      address: "Sector 30",
      city: "Noida",
      pin: "201301",
      lat: 28.5355,
      lng: 77.3910,
      distance: 1.2
    }
  },
  // West Bengal PINs
  "700001": {
    state: "WB",
    pollingPlace: {
      name: "Hare School",
      address: "College Street",
      city: "Kolkata",
      pin: "700001",
      lat: 22.5726,
      lng: 88.3639,
      distance: 0.4
    }
  },
  "734001": {
    state: "WB",
    pollingPlace: {
      name: "Siliguri Boys High School",
      address: "Hill Cart Road",
      city: "Siliguri",
      pin: "734001",
      lat: 26.7271,
      lng: 88.3953,
      distance: 0.9
    }
  }
};
