import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

export const PIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PIN_CACHE_COLLECTION = "pinLookupCache";
const FIRESTORE_CACHE_TIMEOUT_MS = 800;

type FirestorePinDocument<T extends object> = {
  data: T;
  expiresAt?: { toDate: () => Date } | Date;
};

let firestoreForTests: Firestore | null | undefined;

function getProjectId() {
  return process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
}

function getFirestoreClient() {
  if (firestoreForTests !== undefined) {
    return firestoreForTests;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      const serviceAccount =
        process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
          ? cert({
              projectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            })
          : applicationDefault();

      initializeApp({
        projectId,
        credential: serviceAccount,
      });
    }

    return getFirestore();
  } catch (error) {
    console.warn("Firestore PIN cache unavailable", {
      service: "firestore",
      reason: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

function isExpired(expiresAt: FirestorePinDocument<object>["expiresAt"]) {
  if (!expiresAt) {
    return true;
  }

  const expiryDate = expiresAt instanceof Date ? expiresAt : expiresAt.toDate();
  return expiryDate.getTime() <= Date.now();
}

function isSafePinDocument(data: unknown): data is FirestorePinDocument<object> {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    typeof (data as FirestorePinDocument<object>).data === "object" &&
    (data as FirestorePinDocument<object>).data !== null
  );
}

async function withFirestoreTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Firestore cache operation timed out"));
    }, FIRESTORE_CACHE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    operation.catch(() => undefined);
  }
}

export async function getCachedPin<T extends object = Record<string, unknown>>(
  pin: string,
): Promise<T | null> {
  const db = getFirestoreClient();
  if (!db) {
    return null;
  }

  try {
    const snapshot = await withFirestoreTimeout(db.collection(PIN_CACHE_COLLECTION).doc(pin).get());
    if (!snapshot.exists) {
      return null;
    }

    const payload = snapshot.data();
    if (!isSafePinDocument(payload) || isExpired(payload.expiresAt)) {
      return null;
    }

    return payload.data as T;
  } catch (error) {
    console.warn("Firestore PIN cache read failed", {
      service: "firestore",
      reason: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function setCachedPin(pin: string, data: object): Promise<void> {
  const db = getFirestoreClient();
  if (!db) {
    return;
  }

  try {
    await withFirestoreTimeout(
      db.collection(PIN_CACHE_COLLECTION).doc(pin).set({
        data,
        cachedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + PIN_CACHE_TTL_MS)),
      }),
    );
  } catch (error) {
    console.warn("Firestore PIN cache write failed", {
      service: "firestore",
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export function setFirestoreClientForTests(db: Firestore | null | undefined) {
  firestoreForTests = db;
}
