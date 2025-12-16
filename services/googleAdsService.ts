// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { SUPABASE_URL_GOOGLE, SUPABASE_ANON_KEY_GOOGLE } from './supabaseClient';

export const googleAdsService = {
  // Get OAuth URL for initiating the flow
  async getOAuthUrl(redirectUri?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-ads/auth-url?${new URLSearchParams({
        redirectUri: redirectUri || window.location.origin
      })}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to get auth URL');
      return await response.json();
    } catch (error) {
      console.error('Error getting OAuth URL:', error);
      throw error;
    }
  },

  // Handle OAuth callback
  async handleCallback(code: string, redirectUri: string, userId: string, clientId?: string, clientSecret?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-ads/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, redirectUri, userId, clientId, clientSecret })
      });

      if (!response.ok) throw new Error('Failed to complete OAuth callback');
      return await response.json();
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  },

  // Check integration status
  async getStatus(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-ads/status/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to get status');
      return await response.json();
    } catch (error) {
      console.error('Error getting integration status:', error);
      throw error;
    }
  },

  // Disconnect integration
  async disconnect(integrationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-ads/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ integrationId })
      });

      if (!response.ok) throw new Error('Failed to disconnect');
      return await response.json();
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  },

  // Get campaigns from Google Ads directly from Supabase (for production/Vercel)
  async getCampaignsSupabase() {
    try {
      console.log('[Google getCampaignsSupabase] Starting fetch from:', `${SUPABASE_URL_GOOGLE}/rest/v1/Gallant_dadosDiarios`);
      
      const response = await fetch(
        `${SUPABASE_URL_GOOGLE}/rest/v1/Gallant_dadosDiarios?select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY_GOOGLE,
            'Accept': 'application/json',
          }
        }
      );

      console.log('[Google getCampaignsSupabase] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Google getCampaignsSupabase] Error response:', errorText);
        throw new Error(`Supabase error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Google] Raw data from Supabase:', data);
      console.log('[Google] Data length:', data?.length);
      
      if (data && data.length > 0) {
        console.log('[Google] Campaign row keys:', Object.keys(data[0]));
      }

      // Transform to expected format
      const campaigns = (data || []).map((row: any) => ({
        id: `google-${row.id}`,
        name: row.campanha || row.Campaign || row.campaign || row.campaign_name || row.name || 'Unknown Campaign',
        platform: 'Google Ads',
        status: row.status || 'active',
        metrics: {
          impressions: parseFloat(row.impressoes || row.Impressions || row.impressions || 0),
          clicks: parseFloat(row.cliques || row.Clicks || row.clicks || 0),
          spend: parseFloat(row.custo || row.Cost || row.spend || row.cost || 0),
          conversions: parseFloat(row.conversoes || row.Conversions || row.conversions || 0),
          leads: parseFloat(row.Leads || row.leads || 0),
          cpa: parseFloat(row.cpa || row.CPA || row.cpa || 0)
        }
      }));

      return {
        success: true,
        campaigns
      };
    } catch (error) {
      console.error('Error fetching Google Ads campaigns from Supabase:', error);
      throw error;
    }
  },

  // Get daily performance data directly from Supabase (for production/Vercel)
  async getDailyPerformanceSupabase() {
    try {
      console.log('[Google getDailyPerformanceSupabase] Starting fetch');
      
      const response = await fetch(
        `${SUPABASE_URL_GOOGLE}/rest/v1/Gallant_dadosDiarios?select=*&order=data.asc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY_GOOGLE,
            'Accept': 'application/json',
          }
        }
      );

      console.log('[Google getDailyPerformanceSupabase] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Google getDailyPerformanceSupabase] Error:', errorText);
        throw new Error(`Supabase error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Google] Daily data length:', data?.length);
      if (data && data.length > 0) {
        console.log('[Google] Daily row keys:', Object.keys(data[0]));
      }

      // Transform data to daily performance format
      const dailyData = (data || []).map((row: any) => {
        let dateObj;
        const dateField = row.data || row.Date || row.date;
        if (dateField) {
          if (typeof dateField === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateField)) {
            dateObj = new Date(dateField + 'T00:00:00');
          } else {
            dateObj = new Date(dateField);
          }
        }
        const formattedDate = dateObj && !isNaN(dateObj.getTime()) 
          ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : String(dateField);

        return {
          date: formattedDate,
          clicks: parseFloat(row.cliques || row.Clicks || row.clicks || 0),
          leads: parseFloat(row.Leads || row.leads || 0),
          impressions: parseFloat(row.impressoes || row.Impressions || row.impressions || 0),
          conversions: parseFloat(row.conversoes || row.Conversions || row.conversions || 0),
          spend: parseFloat(row.custo || row.Cost || row.spend || row.cost || 0)
        };
      });

      return {
        success: true,
        data: dailyData
      };
    } catch (error) {
      console.error('Error fetching Google Ads daily data from Supabase:', error);
      throw error;
    }
  },

  // Get campaigns from API
  async getCampaigns() {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/google-ads`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get daily performance data
  async getDailyPerformance() {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/google-ads/daily`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch daily performance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily performance:', error);
      throw error;
    }
  },

  // Get insights
  async getInsights() {
    try {
      const response = await fetch(`${API_BASE_URL}/insights/google-ads`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  },

  // Get insights by campaign
  async getInsightsByCampaign(campaignName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/insights/google-ads/${encodeURIComponent(campaignName)}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch campaign insights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaign insights:', error);
      throw error;
    }
  },

  // Get campaigns from Google Ads (OLD - for OAuth integration)
  async getCampaignsOAuth(integrationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/google-ads/${integrationId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get all integrations
  async getIntegrations(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch integrations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }
};
