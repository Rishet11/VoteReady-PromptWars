import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/pin-lookup/route";
import { getCachedPin, setCachedPin } from "@/lib/firestoreCache";

vi.mock("@/lib/firestoreCache", () => ({
  getCachedPin: vi.fn(),
  setCachedPin: vi.fn(),
}));

const mockGetCachedPin = vi.mocked(getCachedPin);
const mockSetCachedPin = vi.mocked(setCachedPin);

function pinLookupRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/pin-lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function responseJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/pin-lookup", () => {
  beforeEach(() => {
    mockGetCachedPin.mockReset();
    mockSetCachedPin.mockReset();
  });

  it("returns a cached PIN mapping without writing to Firestore", async () => {
    mockGetCachedPin.mockResolvedValue({
      state: "DL",
      pollingPlace: {
        name: "Cached School",
        address: "Connaught Place",
        city: "New Delhi",
        pin: "110001",
        lat: 28.6315,
        lng: 77.2167,
        distance: 0.3,
      },
    });

    const response = await POST(pinLookupRequest({ pin: "110001" }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      found: true,
      cached: true,
      mapping: { state: "DL" },
    });
    expect(mockSetCachedPin).not.toHaveBeenCalled();
  });

  it("caches a local PIN mapping on cache miss", async () => {
    mockGetCachedPin.mockResolvedValue(null);

    const response = await POST(pinLookupRequest({ pin: "110001" }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      found: true,
      cached: false,
      mapping: { state: "DL" },
    });
    expect(mockSetCachedPin).toHaveBeenCalledWith(
      "110001",
      expect.objectContaining({ state: "DL" }),
    );
  });

  it("returns a miss for an unmapped but valid PIN", async () => {
    mockGetCachedPin.mockResolvedValue(null);

    const response = await POST(pinLookupRequest({ pin: "999999" }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      found: false,
      cached: false,
    });
    expect(mockSetCachedPin).not.toHaveBeenCalled();
  });

  it("rejects invalid PIN codes", async () => {
    const response = await POST(pinLookupRequest({ pin: "1100" }));
    const json = await responseJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe("Invalid PIN code");
  });
});
