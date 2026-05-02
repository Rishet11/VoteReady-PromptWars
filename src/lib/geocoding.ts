/**
 * Universal Geocoding Utility
 * Resolves any Indian PIN code to a State and Coordinates using Google Maps Geocoding.
 */

export interface GeocodedLocation {
  state: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

/** Shape of a single address component from the Google Geocoding API. */
interface GeocodingAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  "Andaman and Nicobar Islands": "AN",
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chandigarh": "CH",
  "Chhattisgarh": "CT",
  "Dadra and Nagar Haveli": "DN",
  "Daman and Diu": "DD",
  "Delhi": "DL",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Ladakh": "LA",
  "Lakshadweep": "LD",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OR",
  "Puducherry": "PY",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TG",
  "Tripura": "TR",
  "Uttar Pradesh": "UP",
  "Uttarakhand": "UT",
  "West Bengal": "WB",
};

export async function resolvePinToState(pin: string): Promise<GeocodedLocation | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Geocoding failed: Missing API Key");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pin},India&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      return null;
    }

    const result = data.results[0];
    const addressComponents = result.address_components;
    
    // Find state component (administrative_area_level_1)
    const stateComponent = addressComponents.find((c: GeocodingAddressComponent) => 
      c.types.includes("administrative_area_level_1")
    );

    if (!stateComponent) return null;

    const stateName = stateComponent.long_name;
    const stateCode = STATE_NAME_TO_CODE[stateName] || stateName; // Fallback to name if code not found

    return {
      state: stateCode,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Geocoding request error:", error);
    return null;
  }
}
