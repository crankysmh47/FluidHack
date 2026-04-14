// src/types/index.ts
export type LogLevel = 'info' | 'success' | 'warning';

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  level: LogLevel;
}

export interface ChartData {
  name: string;
  ambient: number;
  stadium: number;
}
