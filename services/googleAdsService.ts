// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  // Get campaigns from Google Ads (from Supabase)
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
