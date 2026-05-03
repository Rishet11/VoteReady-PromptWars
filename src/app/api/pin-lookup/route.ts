import { pinToStateMap, type PinStateMap } from "@/data/pinToState";
import { getCachedPin, setCachedPin } from "@/lib/firestoreCache";
import { isValidPinCode } from "@/lib/sanitize";
import { resolvePinToState } from "@/lib/geocoding";
import { apiResponse } from "@/lib/apiResponse";
import { CACHE_HEADERS } from "@/lib/constants/headers";
import { Result, ok, err } from "@/lib/result";

export const runtime = "nodejs";

async function extractPinFromRequest(request: Request): Promise<Result<string>> {
  try {
    const body = await request.json();
    const pin = typeof body === "object" && body !== null && "pin" in body ? String(body.pin) : "";
    return isValidPinCode(pin) ? ok(pin) : err("Invalid PIN code format");
  } catch {
    return err("Invalid JSON body");
  }
}

async function resolveFromCache(pin: string): Promise<Result<PinStateMap>> {
  return getCachedPin<PinStateMap>(pin);
}

async function resolveFromLocalMap(pin: string): Promise<Result<PinStateMap>> {
  const mapping = pinToStateMap[pin];
  if (mapping) {
    await setCachedPin(pin, mapping);
    return ok(mapping);
  }
  return err("Not found in local map");
}

async function resolveFromGeocoding(pin: string): Promise<Result<PinStateMap>> {
  const geoResult = await resolvePinToState(pin);
  if (!geoResult.ok) return err(geoResult.message);

  const dynamicMapping: PinStateMap = {
    state: geoResult.value.state,
    pollingPlace: {
      name: "General Polling Station Area",
      address: geoResult.value.formattedAddress,
      city: "Located by PIN Code",
      pin: pin,
      lat: geoResult.value.lat,
      lng: geoResult.value.lng,
      distance: 0,
    },
  };

  await setCachedPin(pin, dynamicMapping);
  return ok(dynamicMapping);
}

export async function POST(request: Request) {
  const pinResult = await extractPinFromRequest(request);
  if (!pinResult.ok) {
    return apiResponse.badRequest(pinResult.message, CACHE_HEADERS.NO_STORE);
  }
  const pin = pinResult.value;

  const cachedMapping = await resolveFromCache(pin);
  if (cachedMapping.ok) {
    return apiResponse.ok(
      { found: true, cached: true, mapping: cachedMapping.value },
      CACHE_HEADERS.PUBLIC_SHORT
    );
  }

  const localMapping = await resolveFromLocalMap(pin);
  if (localMapping.ok) {
    return apiResponse.ok(
      { found: true, cached: false, mapping: localMapping.value },
      CACHE_HEADERS.NO_STORE
    );
  }

  const dynamicMapping = await resolveFromGeocoding(pin);
  if (dynamicMapping.ok) {
    return apiResponse.ok(
      { found: true, cached: false, mapping: dynamicMapping.value },
      CACHE_HEADERS.NO_STORE
    );
  }

  return apiResponse.ok({ found: false, cached: false }, CACHE_HEADERS.NO_STORE);
}
