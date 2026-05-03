export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  severity: LogLevel;
  message: string;
  context?: string;
  [key: string]: unknown;
}

export const logger = {
  info: (data: Omit<LogEntry, 'severity'>) => log({ ...data, severity: 'INFO' } as LogEntry),
  warn: (data: Omit<LogEntry, 'severity'>) => log({ ...data, severity: 'WARN' } as LogEntry),
  error: (data: Omit<LogEntry, 'severity'>) => log({ ...data, severity: 'ERROR' } as LogEntry),
};

function log(entry: LogEntry) {
  // Always emit a structured JSON string, which Cloud Logging handles well.
  console.info(
    JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    })
  );
}
