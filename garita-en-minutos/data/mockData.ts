export type GaritaName = 'Mexicali Centro' | 'Mexicali Nueva';

export type WaitStatus = 'rápido' | 'moderado' | 'lento';

export interface CurrentWaitTime {
  garita: GaritaName;
  waitTime: number;
  status: WaitStatus;
  lastUpdated: string;
}

export interface ForecastData {
  garita: GaritaName;
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

export const currentWaitTimes: CurrentWaitTime[] = [
  {
    garita: 'Mexicali Centro',
    waitTime: 25,
    status: 'rápido',
    lastUpdated: 'Hace 5 min',
  },
  {
    garita: 'Mexicali Nueva',
    waitTime: 45,
    status: 'moderado',
    lastUpdated: 'Hace 8 min',
  },
];

export const forecastData: ForecastData[] = [
  {
    garita: 'Mexicali Centro',
    dayLabel: 'Hoy',
    periods: [
      { label: '6-9 AM', avgWaitTime: 35 },
      { label: '9-12 PM', avgWaitTime: 20 },
      { label: '12-3 PM', avgWaitTime: 25 },
      { label: '3-6 PM', avgWaitTime: 40 },
      { label: '6-9 PM', avgWaitTime: 30 },
    ],
  },
  {
    garita: 'Mexicali Centro',
    dayLabel: 'Mañana',
    periods: [
      { label: '6-9 AM', avgWaitTime: 40 },
      { label: '9-12 PM', avgWaitTime: 22 },
      { label: '12-3 PM', avgWaitTime: 28 },
      { label: '3-6 PM', avgWaitTime: 45 },
      { label: '6-9 PM', avgWaitTime: 32 },
    ],
  },
  {
    garita: 'Mexicali Nueva',
    dayLabel: 'Hoy',
    periods: [
      { label: '6-9 AM', avgWaitTime: 50 },
      { label: '9-12 PM', avgWaitTime: 35 },
      { label: '12-3 PM', avgWaitTime: 38 },
      { label: '3-6 PM', avgWaitTime: 55 },
      { label: '6-9 PM', avgWaitTime: 48 },
    ],
  },
  {
    garita: 'Mexicali Nueva',
    dayLabel: 'Mañana',
    periods: [
      { label: '6-9 AM', avgWaitTime: 52 },
      { label: '9-12 PM', avgWaitTime: 38 },
      { label: '12-3 PM', avgWaitTime: 40 },
      { label: '3-6 PM', avgWaitTime: 58 },
      { label: '6-9 PM', avgWaitTime: 50 },
    ],
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    garita: 'Mexicali Centro',
    crossingTime: 22,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    timeAgo: 'Hace 10 min',
    comment: 'Muy rápido hoy, sin problemas',
  },
  {
    id: '2',
    garita: 'Mexicali Nueva',
    crossingTime: 48,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    timeAgo: 'Hace 25 min',
  },
  {
    id: '3',
    garita: 'Mexicali Centro',
    crossingTime: 18,
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    timeAgo: 'Hace 35 min',
    comment: 'Excelente tiempo',
  },
  {
    id: '4',
    garita: 'Mexicali Nueva',
    crossingTime: 52,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    timeAgo: 'Hace 45 min',
    comment: 'Un poco lento pero fluye bien',
  },
  {
    id: '5',
    garita: 'Mexicali Centro',
    crossingTime: 28,
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    timeAgo: 'Hace 1 hora',
  },
  {
    id: '6',
    garita: 'Mexicali Nueva',
    crossingTime: 42,
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    timeAgo: 'Hace 1.5 horas',
    comment: 'Tiempo normal',
  },
];

export const quickSummary = {
  bestTime: '9:00 AM - 12:00 PM',
  worstTime: '3:00 PM - 6:00 PM',
  avgToday: 32,
};
