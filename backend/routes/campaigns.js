import express from 'express';
import GoogleOAuthService from '../services/googleOAuthService.js';

const router = express.Router();

// Get campaigns from Google Ads (mock for now, can be extended with real API)
router.get('/google-ads/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;

    const integration = GoogleOAuthService.getTokens(integrationId);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // In a real implementation, you would use the accessToken to call the Google Ads API
    // For now, returning mock data
    const mockCampaigns = [
      {
        id: 'campaign_1',
        name: 'Summer Campaign 2024',
        status: 'ENABLED',
        spent: 2500.00,
        impressions: 45000,
        clicks: 1200,
        conversions: 85,
        leads: 45,
        cpa: 29.41,
        platform: 'Google Ads'
      },
      {
        id: 'campaign_2',
        name: 'Brand Awareness Q4',
        status: 'ENABLED',
        spent: 5000.00,
        impressions: 120000,
        clicks: 2800,
        conversions: 156,
        leads: 89,
        cpa: 32.05,
        platform: 'Google Ads'
      }
    ];

    res.json({
      success: true,
      email: integration.email,
      campaigns: mockCampaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

export default router;
