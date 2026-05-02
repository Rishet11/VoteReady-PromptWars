import { NextResponse } from "next/server";
import { pinToStateMap, type PinStateMap } from "@/data/pinToState";
import { getCachedPin, setCachedPin } from "@/lib/firestoreCache";
import { isValidPinCode } from "@/lib/sanitize";

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

function jsonResponse(body: PinLookupSuccess | PinLookupMiss | { error: string }, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
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
    });
  }

  const mapping = pinToStateMap[pin];
  if (!mapping) {
    return jsonResponse({
      found: false,
      cached: false,
    });
  }

  await setCachedPin(pin, mapping);

  return jsonResponse({
    found: true,
    cached: false,
    mapping,
  });
}
