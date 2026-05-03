/**
 * Cloud Firestore PIN Lookup Cache
 * Caches successful PIN-to-state mappings for 24 hours to reduce
 * repeated Geocoding API calls. Includes timeout protection and
 * graceful degradation if Firestore is unavailable.
 * @module firestoreCache
 */

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { Result, ok, err } from "./result";
import {
  PIN_CACHE_COLLECTION,
  PIN_CACHE_TTL_MS as PIN_CACHE_TTL_MS_CONST,
  FIRESTORE_CACHE_TIMEOUT_MS,
} from "./constants/cache";

/** Time-to-live for cached PIN entries. Re-exported for backward compatibility. */
export const PIN_CACHE_TTL_MS = PIN_CACHE_TTL_MS_CONST;

type FirestorePinDocument<T extends object> = {
  data: T;
  expiresAt?: { toDate: () => Date } | Date;
};

let firestoreForTests: Firestore | null | undefined;

function getProjectId() {
  return process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
}

function getFirebaseCredential(projectId: string) {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  return applicationDefault();
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
      initializeApp({
        projectId,
        credential: getFirebaseCredential(projectId),
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



function validateCachedPayload<T>(payload: unknown): Result<T> {
  if (!isSafePinDocument(payload)) {
    return err("validateCachedPayload: Cache miss — document malformed (missing or null data field)");
  }

  if (isExpired(payload.expiresAt)) {
    return err("validateCachedPayload: Cache miss — document expired");
  }

  return ok(payload.data as T);
}

/**
 * Retrieves a cached PIN lookup from Cloud Firestore.
 * Returns ok with data, or err on miss, expiry, timeout, or Firestore unavailability.
 * @param pin - The 6-digit Indian PIN code to look up.
 */
export async function getCachedPin<T extends object = Record<string, unknown>>(
  pin: string,
): Promise<Result<T>> {
  const db = getFirestoreClient();
  if (!db) {
    return err("Firestore client unavailable");
  }

  try {
    const snapshot = await withFirestoreTimeout(db.collection(PIN_CACHE_COLLECTION).doc(pin).get());
    if (!snapshot.exists) {
      return err("Cache miss: PIN not found in cache");
    }

    return validateCachedPayload<T>(snapshot.data());
  } catch (error) {
    return err(
      "getCachedPin: Firestore cache read failed for pin: " + pin,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Writes a PIN lookup result to the Firestore cache with a 24-hour TTL.
 * Silently fails if Firestore is unavailable.
 * @param pin - The 6-digit PIN code.
 * @param data - The state mapping data to cache.
 */
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

/** Injects a test Firestore client. Used only in test suites. */
export function setFirestoreClientForTests(db: Firestore | null | undefined) {
  firestoreForTests = db;
}
