// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const metaAdsService = {
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
