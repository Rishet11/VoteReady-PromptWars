export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E; message: string };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = Error>(message: string, error?: E): Result<never, E | Error> {
  return {
    ok: false,
    error: error ?? new Error(message),
    message,
  };
}
