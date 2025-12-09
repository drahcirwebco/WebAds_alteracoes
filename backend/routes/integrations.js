import express from 'express';
import GoogleOAuthService from '../services/googleOAuthService.js';

const router = express.Router();

// Get all integrations for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const integrations = GoogleOAuthService.getAllIntegrations(userId);

    res.json({
      success: true,
      integrations: integrations,
      count: integrations.length
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get specific integration
router.get('/:userId/google-ads', (req, res) => {
  try {
    const { userId } = req.params;
    const integrations = GoogleOAuthService.getAllIntegrations(userId);
    const googleAdsIntegration = integrations.find(i => i.provider === 'google-ads');

    if (!googleAdsIntegration) {
      return res.status(404).json({ error: 'Google Ads integration not found' });
    }

    res.json({
      success: true,
      integration: googleAdsIntegration
    });
  } catch (error) {
    console.error('Error fetching Google Ads integration:', error);
    res.status(500).json({ error: 'Failed to fetch Google Ads integration' });
  }
});

// Disconnect integration
router.delete('/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;

    const integration = GoogleOAuthService.getTokens(integrationId);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    if (integration.accessToken) {
      try {
        await GoogleOAuthService.revokeToken(integration.accessToken);
      } catch (err) {
        console.warn('Warning: Could not revoke token, but continuing with disconnection');
      }
    }

    GoogleOAuthService.removeIntegration(integrationId);

    res.json({ success: true, message: 'Integration disconnected' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

export default router;
