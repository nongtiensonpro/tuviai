/// <reference lib="webworker" />

import { buildZiweiChart } from '../core/astrology/ChartBuilder';
import type {
  ChartWorkerRequest,
  ChartWorkerResponse,
} from '../core/types/ZiweiTypes';

const workerScope = self as DedicatedWorkerGlobalScope;

function computeSolarHour(hourIndex: number): number {
  return hourIndex === 0 ? 23 : (hourIndex * 2) - 1;
}

workerScope.addEventListener('message', (event: MessageEvent<ChartWorkerRequest>) => {
  const { requestId, input } = event.data;

  try {
    const chart = buildZiweiChart({
      day: input.day,
      month: input.month,
      year: input.year,
      hour: computeSolarHour(input.hourIndex),
    }, input.gender);

    const response: ChartWorkerResponse = {
      requestId,
      ok: true,
      chart,
    };
    workerScope.postMessage(response);
  } catch (error: unknown) {
    const response: ChartWorkerResponse = {
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : 'Không thể lập mệnh bàn trong worker.',
    };
    workerScope.postMessage(response);
  }
});

export {};
