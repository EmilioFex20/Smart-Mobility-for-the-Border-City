export type GaritaName = 'Mexicali Centro' | 'Mexicali Nueva';
export type CrossingType = 'carro' | 'caminando';

export type WaitStatus = 'rápido' | 'moderado' | 'lento';

export interface CrossingConfig {
  id: string;
  garita: GaritaName;
  crossingType: CrossingType;
  displayName: string;
  apiUrl: string;
}

export interface CurrentWaitTime {
  id: string;
  garita: GaritaName;
  crossingType: CrossingType;
  displayName: string;
  waitTime: number;
  status: WaitStatus;
  lastUpdated: string;
}

export interface ForecastData {
  id: string;
  garita: GaritaName;
  crossingType: CrossingType;
  displayName: string;
  dayLabel: string;
  periods: {
    label: string;
    avgWaitTime: number;
  }[];
}

export interface CommunityPost {
  id: string;
  garita: GaritaName;
  crossingTime: number;
  timestamp: Date;
  timeAgo: string;
  comment?: string;
}

export interface QuickSummary {
  bestTime: string;
  worstTime: string;
  avgToday: number;
}

export interface BorderData {
  currentWaitTimes: CurrentWaitTime[];
  forecastData: ForecastData[];
  communityPosts: CommunityPost[];
  quickSummary: QuickSummary;
}

/**
 * Aquí controlas TODOS los cruces visibles en la app.
 * Si luego agregas otro, solo agregas otro objeto aquí.
 */
const CROSSINGS: CrossingConfig[] = [
  {
    id: 'centro-carro',
    garita: 'Mexicali Centro',
    crossingType: 'carro',
    displayName: 'Mexicali Centro - Carro',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-vieja/predict',
  },
  {
    id: 'nueva-carro',
    garita: 'Mexicali Nueva',
    crossingType: 'carro',
    displayName: 'Mexicali Nueva - Carro',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-nueva/predict',
  },
  {
    id: 'centro-caminando',
    garita: 'Mexicali Centro',
    crossingType: 'caminando',
    displayName: 'Mexicali Centro - Caminando',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-vieja-caminando/predict',
  },
  {
    id: 'nueva-caminando',
    garita: 'Mexicali Nueva',
    crossingType: 'caminando',
    displayName: 'Mexicali Nueva - Caminando',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-nueva-caminando/predict',
  },
];

function getStatus(waitTime: number): WaitStatus {
  if (waitTime <= 30) return 'rápido';
  if (waitTime <= 50) return 'moderado';
  return 'lento';
}

function roundPrediction(value: number): number {
  return Math.max(0, Math.round(value));
}

function getDateInfo(baseDate = new Date(), dayOffset = 0) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + dayOffset);

  return {
    date,
    mes: date.getMonth() + 1,
    dia_num: date.getDay() === 0 ? 7 : date.getDay(),
  };
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;

  const hours = Math.floor(diffMin / 60);
  if (hours === 1) return 'Hace 1 hora';
  return `Hace ${hours} horas`;
}

function getLastUpdatedLabel() {
  return 'Hace unos momentos';
}

async function fetchPrediction(
  apiUrl: string,
  mes: number,
  dia_num: number,
  hora: number
): Promise<number> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mes,
      dia_num,
      hora,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error API ${apiUrl}: ${response.status}`);
  }

  const data = await response.json();
  return roundPrediction(Number(data.prediction ?? 0));
}

async function fetchAveragePrediction(
  apiUrl: string,
  mes: number,
  dia_num: number,
  hours: number[]
): Promise<number> {
  const values = await Promise.all(
    hours.map((hour) => fetchPrediction(apiUrl, mes, dia_num, hour))
  );

  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return roundPrediction(avg);
}

async function buildCurrentWaitTimes(): Promise<CurrentWaitTime[]> {
  const now = new Date();
  const currentHour = now.getHours();
  const { mes, dia_num } = getDateInfo(now, 0);

  return Promise.all(
    CROSSINGS.map(async (crossing) => {
      const prediction = await fetchPrediction(
        crossing.apiUrl,
        mes,
        dia_num,
        currentHour
      );

      return {
        id: crossing.id,
        garita: crossing.garita,
        crossingType: crossing.crossingType,
        displayName: crossing.displayName,
        waitTime: prediction,
        status: getStatus(prediction),
        lastUpdated: getLastUpdatedLabel(),
      };
    })
  );
}

async function buildForecastData(): Promise<ForecastData[]> {
  const periods = [
    { label: '6-9 AM', hours: [6, 7, 8] },
    { label: '9-12 PM', hours: [9, 10, 11] },
    { label: '12-3 PM', hours: [12, 13, 14] },
    { label: '3-6 PM', hours: [15, 16, 17] },
    { label: '6-9 PM', hours: [18, 19, 20] },
  ];

  const todayInfo = getDateInfo(new Date(), 0);
  const tomorrowInfo = getDateInfo(new Date(), 1);

  const result: ForecastData[] = [];

  for (const crossing of CROSSINGS) {
    const [todayValues, tomorrowValues] = await Promise.all([
      Promise.all(
        periods.map((period) =>
          fetchAveragePrediction(
            crossing.apiUrl,
            todayInfo.mes,
            todayInfo.dia_num,
            period.hours
          )
        )
      ),
      Promise.all(
        periods.map((period) =>
          fetchAveragePrediction(
            crossing.apiUrl,
            tomorrowInfo.mes,
            tomorrowInfo.dia_num,
            period.hours
          )
        )
      ),
    ]);

    result.push({
      id: crossing.id,
      garita: crossing.garita,
      crossingType: crossing.crossingType,
      displayName: crossing.displayName,
      dayLabel: 'Hoy',
      periods: periods.map((period, index) => ({
        label: period.label,
        avgWaitTime: todayValues[index],
      })),
    });

    result.push({
      id: crossing.id,
      garita: crossing.garita,
      crossingType: crossing.crossingType,
      displayName: crossing.displayName,
      dayLabel: 'Mañana',
      periods: periods.map((period, index) => ({
        label: period.label,
        avgWaitTime: tomorrowValues[index],
      })),
    });
  }

  return result;
}

/**
 * Resumen general combinando todos los cruces visibles.
 */
async function buildQuickSummary(): Promise<QuickSummary> {
  const todayInfo = getDateInfo(new Date(), 0);

  const summaryPeriods = [
    { label: '6:00 AM - 9:00 AM', hours: [6, 7, 8] },
    { label: '9:00 AM - 12:00 PM', hours: [9, 10, 11] },
    { label: '12:00 PM - 3:00 PM', hours: [12, 13, 14] },
    { label: '3:00 PM - 6:00 PM', hours: [15, 16, 17] },
    { label: '6:00 PM - 9:00 PM', hours: [18, 19, 20] },
  ];

  const values = await Promise.all(
    summaryPeriods.map(async (period) => {
      const perCrossing = await Promise.all(
        CROSSINGS.map((crossing) =>
          fetchAveragePrediction(
            crossing.apiUrl,
            todayInfo.mes,
            todayInfo.dia_num,
            period.hours
          )
        )
      );

      return roundPrediction(
        perCrossing.reduce((sum, value) => sum + value, 0) / perCrossing.length
      );
    })
  );

  let bestIndex = 0;
  let worstIndex = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[bestIndex]) bestIndex = i;
    if (values[i] > values[worstIndex]) worstIndex = i;
  }

  return {
    bestTime: summaryPeriods[bestIndex].label,
    worstTime: summaryPeriods[worstIndex].label,
    avgToday: roundPrediction(
      values.reduce((a, b) => a + b, 0) / values.length
    ),
  };
}

function buildMockCommunityPosts(): CommunityPost[] {
  const now = Date.now();

  const posts: Omit<CommunityPost, 'timeAgo'>[] = [
    {
      id: '1',
      garita: 'Mexicali Centro',
      crossingTime: 22,
      timestamp: new Date(now - 10 * 60 * 1000),
      comment: 'Muy rápido hoy, sin problemas',
    },
    {
      id: '2',
      garita: 'Mexicali Nueva',
      crossingTime: 48,
      timestamp: new Date(now - 25 * 60 * 1000),
    },
    {
      id: '3',
      garita: 'Mexicali Centro',
      crossingTime: 18,
      timestamp: new Date(now - 35 * 60 * 1000),
      comment: 'Excelente tiempo',
    },
    {
      id: '4',
      garita: 'Mexicali Nueva',
      crossingTime: 52,
      timestamp: new Date(now - 45 * 60 * 1000),
      comment: 'Un poco lento pero fluye bien',
    },
  ];

  return posts.map((post) => ({
    ...post,
    timeAgo: formatTimeAgo(post.timestamp),
  }));
}

const fallbackData: BorderData = {
  currentWaitTimes: [
    {
      id: 'centro-carro',
      garita: 'Mexicali Centro',
      crossingType: 'carro',
      displayName: 'Mexicali Centro - Carro',
      waitTime: 25,
      status: 'rápido',
      lastUpdated: 'Hace 5 min',
    },
    {
      id: 'nueva-carro',
      garita: 'Mexicali Nueva',
      crossingType: 'carro',
      displayName: 'Mexicali Nueva - Carro',
      waitTime: 25,
      status: 'rápido',
      lastUpdated: 'Hace 5 min',
    },
    {
      id: 'centro-caminando',
      garita: 'Mexicali Centro',
      crossingType: 'caminando',
      displayName: 'Mexicali Centro - Caminando',
      waitTime: 18,
      status: 'rápido',
      lastUpdated: 'Hace 5 min',
    },
    {
      id: 'nueva-caminando',
      garita: 'Mexicali Nueva',
      crossingType: 'caminando',
      displayName: 'Mexicali Nueva - Caminando',
      waitTime: 18,
      status: 'rápido',
      lastUpdated: 'Hace 5 min',
    },
  ],
  forecastData: [],
  communityPosts: buildMockCommunityPosts(),
  quickSummary: {
    bestTime: '9:00 AM - 12:00 PM',
    worstTime: '3:00 PM - 6:00 PM',
    avgToday: 32,
  },
};

export async function getBorderData(): Promise<BorderData> {
  try {
    const [currentWaitTimes, forecastData, quickSummary] = await Promise.all([
      buildCurrentWaitTimes(),
      buildForecastData(),
      buildQuickSummary(),
    ]);

    return {
      currentWaitTimes,
      forecastData,
      communityPosts: buildMockCommunityPosts(),
      quickSummary,
    };
  } catch (error) {
    console.error('Error loading border data:', error);
    return fallbackData;
  }
}