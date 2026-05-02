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

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const pin = typeof body === "object" && body !== null && "pin" in body ? String(body.pin) : "";
  if (!isValidPinCode(pin)) {
    return jsonResponse({ error: "Invalid PIN code" }, 400);
  }

  const cachedMapping = await getCachedPin<PinStateMap>(pin);
  if (cachedMapping) {
    return jsonResponse({
      found: true,
      cached: true,
      mapping: cachedMapping,
    }, 200, true);
  }

  const mapping = pinToStateMap[pin];
  if (mapping) {
    await setCachedPin(pin, mapping);
    return jsonResponse({
      found: true,
      cached: false,
      mapping,
    });
  }

  // Fallback: Universal Geocoding for ANY PIN in India
  const dynamicLocation = await resolvePinToState(pin);
  if (dynamicLocation) {
    const dynamicMapping: PinStateMap = {
      state: dynamicLocation.state,
      pollingPlace: {
        name: "General Polling Station Area",
        address: dynamicLocation.formattedAddress,
        city: "Located by PIN Code",
        pin: pin,
        lat: dynamicLocation.lat,
        lng: dynamicLocation.lng,
        distance: 0, // Reference point
      },
    };

    await setCachedPin(pin, dynamicMapping);
    
    return jsonResponse({
      found: true,
      cached: false,
      mapping: dynamicMapping,
    });
  }

  return jsonResponse({
    found: false,
    cached: false,
  });
}
