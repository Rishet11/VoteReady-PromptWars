/**
 * Universal Geocoding Utility
 * Resolves any Indian PIN code to a State and Coordinates using Google Maps Geocoding.
 */
import { Result, ok, err } from './result';

export interface GeocodedLocation {
  readonly state: string;
  readonly lat: number;
  readonly lng: number;
  readonly formattedAddress: string;
}

/** Shape of a single address component from the Google Geocoding API. */
interface GeocodingAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodingResult {
  address_components: GeocodingAddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const STATE_NAME_TO_CODE: Readonly<Record<string, string>> = {
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

function findStateComponent(addressComponents: readonly GeocodingAddressComponent[]): GeocodingAddressComponent | undefined {
  return addressComponents.find((c) =>
    c.types.includes("administrative_area_level_1")
  );
}

async function fetchGeocoding(url: string): Promise<Result<GeocodingResult>> {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      return err(`Geocoding returned status: ${data.status}`);
    }

    return ok(data.results[0] as GeocodingResult);
  } catch (error) {
    return err(
      "Geocoding request error",
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

export async function resolvePinToState(pin: string): Promise<Result<GeocodedLocation>> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return err("Geocoding failed: Missing API Key");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pin},India&key=${apiKey}`;
  const fetchResult = await fetchGeocoding(url);
  if (!fetchResult.ok) {
    return fetchResult;
  }

  const result = fetchResult.value;
  const stateComponent = findStateComponent(result.address_components);

  if (!stateComponent) {
    return err("State not found in geocoding results");
  }

  const stateName = stateComponent.long_name;
  const stateCode = STATE_NAME_TO_CODE[stateName] || stateName;

  return ok({
    state: stateCode,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  });
}
