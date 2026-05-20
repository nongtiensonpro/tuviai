import type {
  ChartWorkerInput,
  ChartWorkerRequest,
  ChartWorkerResponse,
  ZiweiChart,
} from '../core/types/ZiweiTypes';

type PendingRequest = {
  resolve: (chart: ZiweiChart) => void;
  reject: (error: Error) => void;
};

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class ChartWorkerService {
  private static worker: Worker | null = null;
  private static pending = new Map<string, PendingRequest>();

  private static ensureWorker(): Worker | null {
    if (typeof Worker === 'undefined') {
      return null;
    }

    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/chart.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.addEventListener('message', this.handleMessage);
      this.worker.addEventListener('error', this.handleWorkerError);
    }

    return this.worker;
  }

  private static handleMessage = (event: MessageEvent<ChartWorkerResponse>) => {
    const response = event.data;
    const pendingRequest = this.pending.get(response.requestId);
    if (!pendingRequest) {
      return;
    }

    this.pending.delete(response.requestId);

    if (response.ok) {
      pendingRequest.resolve(response.chart);
      return;
    }

    pendingRequest.reject(new Error(response.error));
  };

  private static handleWorkerError = () => {
    const pendingRequests = Array.from(this.pending.values());
    this.pending.clear();

    for (const request of pendingRequests) {
      request.reject(new Error('Worker lập mệnh bàn bị gián đoạn.'));
    }

    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage);
      this.worker.removeEventListener('error', this.handleWorkerError);
      this.worker.terminate();
      this.worker = null;
    }
  };

  private static async buildChartOnMainThread(input: ChartWorkerInput): Promise<ZiweiChart> {
    const { buildZiweiChart } = await import('../core/astrology/ChartBuilder');
    const { calibrateSolarDate } = await import('../core/calendar/SolarTimeCalculator');

    // Hiệu chỉnh âm dương lịch pháp dựa trên múi giờ lịch sử và kinh độ của nơi sinh
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

    return buildZiweiChart(calibratedSolar, input.gender);
  }

  static async buildChart(input: ChartWorkerInput): Promise<ZiweiChart> {
    const worker = this.ensureWorker();
    if (!worker) {
      return this.buildChartOnMainThread(input);
    }

    return new Promise<ZiweiChart>((resolve, reject) => {
      const requestId = createRequestId();
      const payload: ChartWorkerRequest = {
        requestId,
        input,
      };

      this.pending.set(requestId, { resolve, reject });
      worker.postMessage(payload);
    });
  }
}
