import { pinToStateMap, type PinStateMap } from "@/data/pinToState";
import { getCachedPin, setCachedPin } from "@/lib/firestoreCache";
import { isValidPinCode } from "@/lib/sanitize";
import { resolvePinToState } from "@/lib/geocoding";
import { apiResponse } from "@/lib/apiResponse";
import { CACHE_HEADERS } from "@/lib/constants/headers";

export const runtime = "nodejs";

async function extractPinFromRequest(request: Request): Promise<string | null> {
  try {
    const body = await request.json();
    const pin = typeof body === "object" && body !== null && "pin" in body ? String(body.pin) : "";
    return isValidPinCode(pin) ? pin : null;
  } catch {
    return null;
  }
}

async function resolveFromCache(pin: string): Promise<PinStateMap | null> {
  return getCachedPin<PinStateMap>(pin);
}

async function resolveFromLocalMap(pin: string): Promise<PinStateMap | null> {
  const mapping = pinToStateMap[pin];
  if (mapping) {
    await setCachedPin(pin, mapping);
    return mapping;
  }
  return null;
}

async function resolveFromGeocoding(pin: string): Promise<PinStateMap | null> {
  const dynamicLocation = await resolvePinToState(pin);
  if (!dynamicLocation) return null;

  const dynamicMapping: PinStateMap = {
    state: dynamicLocation.state,
    pollingPlace: {
      name: "General Polling Station Area",
      address: dynamicLocation.formattedAddress,
      city: "Located by PIN Code",
      pin: pin,
      lat: dynamicLocation.lat,
      lng: dynamicLocation.lng,
      distance: 0,
    },
  };

  await setCachedPin(pin, dynamicMapping);
  return dynamicMapping;
}

export async function POST(request: Request) {
  const pin = await extractPinFromRequest(request);
  if (!pin) {
    return apiResponse.badRequest("Invalid PIN code or JSON body", CACHE_HEADERS.NO_STORE);
  }

  const cachedMapping = await resolveFromCache(pin);
  if (cachedMapping) {
    return apiResponse.ok(
      { found: true, cached: true, mapping: cachedMapping },
      CACHE_HEADERS.PUBLIC_SHORT
    );
  }

  const localMapping = await resolveFromLocalMap(pin);
  if (localMapping) {
    return apiResponse.ok(
      { found: true, cached: false, mapping: localMapping },
      CACHE_HEADERS.NO_STORE
    );
  }

  const dynamicMapping = await resolveFromGeocoding(pin);
  if (dynamicMapping) {
    return apiResponse.ok(
      { found: true, cached: false, mapping: dynamicMapping },
      CACHE_HEADERS.NO_STORE
    );
  }

  return apiResponse.ok({ found: false, cached: false }, CACHE_HEADERS.NO_STORE);
}
