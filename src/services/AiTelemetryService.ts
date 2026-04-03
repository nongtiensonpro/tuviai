import type { AiErrorCode, AiModelHealthSnapshot, AiModelTelemetryRecord } from '../core/types/ZiweiTypes';

const STORAGE_KEY = 'tuviai_ai_model_telemetry_v1';
const MAX_RECORD_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const FAILURE_WEIGHTS: Record<AiErrorCode, number> = {
  invalid_api_key: 6,
  quota_exceeded: 5,
  rate_limited: 2,
  model_overloaded: 3,
  network_unavailable: 2,
  request_timeout: 2,
  empty_response: 2,
  invalid_json: 2,
  user_cancelled: 0,
  unknown: 3,
};

interface TelemetryStoreShape {
  records: Record<string, AiModelTelemetryRecord>;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function parseTelemetryRecord(value: unknown, modelName: string): AiModelTelemetryRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const successCount = typeof value.successCount === 'number' ? value.successCount : 0;
  const failureCount = typeof value.failureCount === 'number' ? value.failureCount : 0;
  const lastLatencyMs = typeof value.lastLatencyMs === 'number' ? value.lastLatencyMs : 0;
  const averageLatencyMs = typeof value.averageLatencyMs === 'number' ? value.averageLatencyMs : 0;
  const lastUsedAt = typeof value.lastUsedAt === 'number' ? value.lastUsedAt : 0;

  return {
    modelName,
    successCount,
    failureCount,
    lastLatencyMs,
    averageLatencyMs,
    lastUsedAt,
    lastSuccessAt: typeof value.lastSuccessAt === 'number' ? value.lastSuccessAt : undefined,
    lastFailureAt: typeof value.lastFailureAt === 'number' ? value.lastFailureAt : undefined,
    lastErrorCode: typeof value.lastErrorCode === 'string' ? value.lastErrorCode as AiErrorCode : undefined,
  };
}

function loadStore(): TelemetryStoreShape {
  const storage = getStorage();
  if (!storage) {
    return { records: {} };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { records: {} };
  }

  try {
    const parsed = JSON.parse(raw) as { records?: unknown };
    if (!isRecord(parsed.records)) {
      return { records: {} };
    }

    const now = Date.now();
    const records = Object.entries(parsed.records).reduce<Record<string, AiModelTelemetryRecord>>((acc, [modelName, value]) => {
      const record = parseTelemetryRecord(value, modelName);
      if (!record) {
        return acc;
      }

      if (record.lastUsedAt > 0 && now - record.lastUsedAt <= MAX_RECORD_AGE_MS) {
        acc[modelName] = record;
      }

      return acc;
    }, {});

    return { records };
  } catch {
    return { records: {} };
  }
}

function saveStore(store: TelemetryStoreShape): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getEmptyRecord(modelName: string): AiModelTelemetryRecord {
  return {
    modelName,
    successCount: 0,
    failureCount: 0,
    lastLatencyMs: 0,
    averageLatencyMs: 0,
    lastUsedAt: 0,
  };
}

function buildHealthSnapshot(record: AiModelTelemetryRecord | null, modelName: string): AiModelHealthSnapshot {
  if (!record || (record.successCount === 0 && record.failureCount === 0)) {
    return {
      modelName,
      score: 0.5,
      healthLabel: 'unknown',
      successRate: null,
      averageLatencyMs: null,
    };
  }

  const weightedFailures = record.failureCount * FAILURE_WEIGHTS[record.lastErrorCode ?? 'unknown'];
  const weightedAttempts = record.successCount + weightedFailures;
  const successRate = weightedAttempts > 0 ? record.successCount / weightedAttempts : 0.5;
  const latencyPenalty = record.averageLatencyMs > 0 ? Math.min(0.25, record.averageLatencyMs / 20_000) : 0;
  const recencyPenalty = record.lastFailureAt && (!record.lastSuccessAt || record.lastFailureAt > record.lastSuccessAt) ? 0.1 : 0;
  const score = Math.max(0, Math.min(1, successRate - latencyPenalty - recencyPenalty));

  let healthLabel: AiModelHealthSnapshot['healthLabel'] = 'risky';
  if (score >= 0.85) {
    healthLabel = 'excellent';
  } else if (score >= 0.7) {
    healthLabel = 'good';
  } else if (score >= 0.45) {
    healthLabel = 'watch';
  }

  return {
    modelName,
    score,
    healthLabel,
    successRate,
    averageLatencyMs: record.averageLatencyMs > 0 ? record.averageLatencyMs : null,
    lastErrorCode: record.lastErrorCode,
  };
}

export class AiTelemetryService {
  static getSnapshot(modelName: string): AiModelHealthSnapshot {
    const store = loadStore();
    return buildHealthSnapshot(store.records[modelName] ?? null, modelName);
  }

  static rankModels(models: string[]): string[] {
    const store = loadStore();
    return [...models]
      .sort((left, right) => {
        const leftSnapshot = buildHealthSnapshot(store.records[left] ?? null, left);
        const rightSnapshot = buildHealthSnapshot(store.records[right] ?? null, right);

        if (rightSnapshot.score !== leftSnapshot.score) {
          return rightSnapshot.score - leftSnapshot.score;
        }

        const leftLastUsed = store.records[left]?.lastUsedAt ?? 0;
        const rightLastUsed = store.records[right]?.lastUsedAt ?? 0;
        return rightLastUsed - leftLastUsed;
      })
      .filter((model, index, items) => items.indexOf(model) === index);
  }

  static recordSuccess(modelName: string, latencyMs: number): AiModelHealthSnapshot {
    const store = loadStore();
    const record = store.records[modelName] ?? getEmptyRecord(modelName);
    const safeLatencyMs = Math.max(0, Math.round(latencyMs));
    const nextSuccessCount = record.successCount + 1;
    const totalLatency = record.averageLatencyMs * record.successCount + safeLatencyMs;
    const nextRecord: AiModelTelemetryRecord = {
      ...record,
      modelName,
      successCount: nextSuccessCount,
      lastLatencyMs: safeLatencyMs,
      averageLatencyMs: Math.round(totalLatency / nextSuccessCount),
      lastUsedAt: Date.now(),
      lastSuccessAt: Date.now(),
    };

    store.records[modelName] = nextRecord;
    saveStore(store);
    return buildHealthSnapshot(nextRecord, modelName);
  }

  static recordFailure(modelName: string, errorCode: AiErrorCode): AiModelHealthSnapshot {
    const store = loadStore();
    const record = store.records[modelName] ?? getEmptyRecord(modelName);
    const nextRecord: AiModelTelemetryRecord = {
      ...record,
      modelName,
      failureCount: errorCode === 'user_cancelled' ? record.failureCount : record.failureCount + 1,
      lastUsedAt: Date.now(),
      lastFailureAt: Date.now(),
      lastErrorCode: errorCode,
    };

    store.records[modelName] = nextRecord;
    saveStore(store);
    return buildHealthSnapshot(nextRecord, modelName);
  }
}
