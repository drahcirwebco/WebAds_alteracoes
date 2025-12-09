// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const insightsService = {
  // Get insights for a specific campaign
  async getInsightsByCampaign(campaignName: string) {
    try {
      const encodedName = encodeURIComponent(campaignName);
      const response = await fetch(`${API_BASE_URL}/insights/${encodedName}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  },

  // Get all insights
  async getAllInsights() {
    try {
      const response = await fetch(`${API_BASE_URL}/insights`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all insights:', error);
      throw error;
    }
  }
};
