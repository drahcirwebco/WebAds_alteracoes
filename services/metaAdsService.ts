// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { SUPABASE_URL_META, SUPABASE_ANON_KEY_META } from './supabaseClient';

export const metaAdsService = {
  // Get Facebook Ads daily data directly from Supabase (for production/Vercel)
  async getDailyPerformanceSupabase() {
    try {
      const response = await fetch(
        `${SUPABASE_URL_META}/rest/v1/facebook-ads?select=*&order=Data_inicio.asc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY_META,
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      const data = await response.json();

      // Transform data to daily performance format
      const dailyData: any = {};
      
      (data || []).forEach((row: any) => {
        const date = row.Data_inicio; // Format: YYYY-MM-DD
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            clicks: 0,
            leads: 0,
            impressions: 0,
            spend: 0
          };
        }
        
        dailyData[date].clicks += parseFloat(row.Cliques) || 0;
        dailyData[date].leads += parseFloat(row.leads) || 0;
        dailyData[date].impressions += parseFloat(row.Impressoes) || 0;
        dailyData[date].spend += parseFloat(row['Valor investido']) || 0;
      });

      // Convert to array and sort by date
      const dailyArray = Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        success: true,
        data: dailyArray,
        total: dailyArray.length
      };
    } catch (error) {
      console.error('Error fetching Meta Ads daily data from Supabase:', error);
      throw error;
    }
  },

  // Get Facebook Ads campaigns from Supabase
  async getCampaigns() {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/meta-ads`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch Meta Ads campaigns');
      return await response.json();
    } catch (error) {
      console.error('Error fetching Meta Ads campaigns:', error);
      throw error;
    }
  },

  // Check if Meta Ads data is available
  async isAvailable() {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/meta-ads/status`, {
        credentials: 'include'
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.available && data.campaignCount > 0;
    } catch (error) {
      console.error('Error checking Meta Ads availability:', error);
      return false;
    }
  }
};
