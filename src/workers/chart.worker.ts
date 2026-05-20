/// <reference lib="webworker" />

import { buildZiweiChart } from '../core/astrology/ChartBuilder';
import { calibrateSolarDate } from '../core/calendar/SolarTimeCalculator';
import type {
  ChartWorkerRequest,
  ChartWorkerResponse,
} from '../core/types/ZiweiTypes';

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.addEventListener('message', (event: MessageEvent<ChartWorkerRequest>) => {
  const { requestId, input } = event.data;

  try {
    // Thực hiện hiệu chỉnh thiên văn học nâng cao ngay trong Worker trước khi dựng lá số
    const calibratedSolar = calibrateSolarDate({
      year: input.year,
      month: input.month,
      day: input.day,
      hourMode: input.hourMode,
      hourIndex: input.hourIndex,
      exactHour: input.exactHour,
      exactMinute: input.exactMinute,
      birthPlace: input.birthPlace,
      customLongitude: input.customLongitude,
    });

    const chart = buildZiweiChart(calibratedSolar, input.gender);

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
