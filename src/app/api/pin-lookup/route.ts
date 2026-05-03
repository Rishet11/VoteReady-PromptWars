import { NextResponse } from "next/server";
import { pinToStateMap, type PinStateMap } from "@/data/pinToState";
import { getCachedPin, setCachedPin } from "@/lib/firestoreCache";
import { isValidPinCode } from "@/lib/sanitize";
import { resolvePinToState } from "@/lib/geocoding";

export const runtime = "nodejs";

type PinLookupSuccess = {
  found: true;
  cached: boolean;
  mapping: PinStateMap;
};

type PinLookupMiss = {
  found: false;
  cached: false;
};

function jsonResponse(body: PinLookupSuccess | PinLookupMiss | { error: string }, status = 200, cacheHit = false) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": cacheHit ? "public, s-maxage=60" : "no-store",
    },
  });
}

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
    return jsonResponse({ error: "Invalid PIN code or JSON body" }, 400);
  }

  const cachedMapping = await resolveFromCache(pin);
  if (cachedMapping) {
    return jsonResponse({ found: true, cached: true, mapping: cachedMapping }, 200, true);
  }

  const localMapping = await resolveFromLocalMap(pin);
  if (localMapping) {
    return jsonResponse({ found: true, cached: false, mapping: localMapping });
  }

  const dynamicMapping = await resolveFromGeocoding(pin);
  if (dynamicMapping) {
    return jsonResponse({ found: true, cached: false, mapping: dynamicMapping });
  }

  return jsonResponse({ found: false, cached: false });
}
