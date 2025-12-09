

export type Theme = 'light' | 'dark';

export interface Campaign {
  id: string;
  name: string;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  cpa: number;
  // Fix: Add missing properties from mock data. They are optional because they are not present in data fetched from Supabase.
  platform?: string;
  status?: string;
  budget?: number;
  // Daily changes
  spentDiff?: number;
  impressionsDiff?: number;
  clicksDiff?: number;
  conversionsDiff?: number;
  leadsDiff?: number;
  cpaDiff?: number;
  spentPercent?: number;
  impressionsPercent?: number;
  clicksPercent?: number;
  conversionsPercent?: number;
  leadsPercent?: number;
  cpaPercent?: number;
}


export interface ChartDataPoint {
  date: string;
  clicks: number;
  conversions: number;
  impressions: number;
}

export interface WebsiteDailyMetric {
    date: string;
    visitors: number;
    pageviews: number;
    sessions: number;
    bounceRate: number; // percentage
    avgSessionDuration: number; // seconds
}

export interface GeoData {
    country: string;
    visitors: number;
}

export interface BrazilStateMetric {
    id: string; // UF code (e.g., 'SP', 'RJ')
    name: string;
    visitors: number;
}

export interface TrafficSource {
    source: string;
    visitors: number;
}

export interface PageViewData {
    path: string;
    title: string;
    views: number;
    avgTime: number;
}