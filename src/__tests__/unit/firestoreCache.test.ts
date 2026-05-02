import { beforeEach, describe, expect, it, vi } from "vitest";

const getApps = vi.fn();
const initializeApp = vi.fn();
const applicationDefault = vi.fn(() => ({ credential: "adc" }));
const cert = vi.fn((serviceAccount) => ({ credential: "cert", serviceAccount }));
const getFirestore = vi.fn();
const timestampNow = vi.fn(() => ({ toDate: () => new Date("2026-01-01T00:00:00.000Z") }));
const timestampFromDate = vi.fn((date: Date) => ({ toDate: () => date }));

vi.mock("firebase-admin/app", () => ({
  getApps,
  initializeApp,
  applicationDefault,
  cert,
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore,
  Timestamp: {
    now: timestampNow,
    fromDate: timestampFromDate,
  },
}));

type FirestoreDocument = {
  exists: boolean;
  data: () => unknown;
};

function createFirestoreMock(snapshot: FirestoreDocument) {
  const get = vi.fn().mockResolvedValue(snapshot);
  const set = vi.fn().mockResolvedValue(undefined);
  const doc = vi.fn(() => ({ get, set }));
  const collection = vi.fn(() => ({ doc }));

  return {
    db: { collection },
    collection,
    doc,
    get,
    set,
  };
}

async function importCacheModule() {
  vi.resetModules();
  return import("@/lib/firestoreCache");
}

describe("firestoreCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    getApps.mockReturnValue([]);
    process.env.FIRESTORE_PROJECT_ID = "voteready-test";
    delete process.env.GOOGLE_CLOUD_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
  });

  it("returns cached PIN data when the document exists and is not expired", async () => {
    const firestore = createFirestoreMock({
      exists: true,
      data: () => ({
        data: { state: "DL" },
        expiresAt: { toDate: () => new Date(Date.now() + 60_000) },
      }),
    });
    getFirestore.mockReturnValue(firestore.db);
    const { getCachedPin } = await importCacheModule();

    await expect(getCachedPin("110001")).resolves.toEqual({ state: "DL" });
    expect(firestore.collection).toHaveBeenCalledWith("pinLookupCache");
    expect(firestore.doc).toHaveBeenCalledWith("110001");
  });

  it("returns null when a PIN document is missing", async () => {
    const firestore = createFirestoreMock({
      exists: false,
      data: () => undefined,
    });
    getFirestore.mockReturnValue(firestore.db);
    const { getCachedPin } = await importCacheModule();

    await expect(getCachedPin("999999")).resolves.toBeNull();
  });

  it("writes cached PIN data with a 24 hour TTL", async () => {
    vi.setSystemTime(new Date("2026-05-03T10:00:00.000Z"));
    const firestore = createFirestoreMock({
      exists: false,
      data: () => undefined,
    });
    getFirestore.mockReturnValue(firestore.db);
    const { PIN_CACHE_TTL_MS, setCachedPin } = await importCacheModule();

    await setCachedPin("110001", { state: "DL" });

    expect(timestampFromDate).toHaveBeenCalledWith(
      new Date(new Date("2026-05-03T10:00:00.000Z").getTime() + PIN_CACHE_TTL_MS),
    );
    expect(firestore.set).toHaveBeenCalledWith({
      data: { state: "DL" },
      cachedAt: expect.any(Object),
      expiresAt: expect.any(Object),
    });
  });
});
