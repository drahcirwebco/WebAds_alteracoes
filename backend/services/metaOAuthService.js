import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const META_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const META_API_BASE = 'https://graph.facebook.com/v19.0';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const META_TOKENS_FILE = path.join(__dirname, '../meta-tokens.json');

// In-memory storage (with file persistence)
const tokenStore = new Map();

// Load tokens from file on startup
function loadTokensFromFile() {
  try {
    if (fs.existsSync(META_TOKENS_FILE)) {
      const data = fs.readFileSync(META_TOKENS_FILE, 'utf-8');
      const tokens = JSON.parse(data);
      Object.entries(tokens).forEach(([key, value]) => {
        tokenStore.set(key, value);
      });
      console.log(`[MetaTokenStore] Loaded ${tokenStore.size} integration(s) from disk`);
    }
  } catch (error) {
    console.warn('[MetaTokenStore] Failed to load tokens from file:', error.message);
  }
}

// Save tokens to file
function saveTokensToFile() {
  try {
    const data = Object.fromEntries(tokenStore);
    fs.writeFileSync(META_TOKENS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[MetaTokenStore] Saved ${tokenStore.size} integration(s) to disk`);
  } catch (error) {
    console.error('[MetaTokenStore] Failed to save tokens to file:', error.message);
  }
}

// Load tokens on module import
loadTokensFromFile();

export class MetaOAuthService {
  /**
   * Exchanges an authorization code for an access token.
   * @param {string} code The authorization code.
   * @param {string} redirectUri The redirect URI used in the initial OAuth request.
   * @param {string} clientId The client ID of the Meta App.
   * @param {string} clientSecret The client secret of the Meta App.
   * @returns {Promise<object>} An object containing the access token and other token details.
   */
  static async exchangeAuthCode(code, redirectUri, clientId, clientSecret) {
    try {
      const response = await axios.get(META_TOKEN_URL, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      const { access_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        expiresIn: expires_in,
        expiresAt: new Date(Date.now() + expires_in * 1000)
      };
    } catch (error) {
      console.error('Error exchanging auth code with Meta:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for Meta access token');
    }
  }

  /**
   * Retrieves user account information from Meta.
   * @param {string} accessToken The access token.
   * @returns {Promise<object>} An object containing user information.
   */
  static async getMetaAccountInfo(accessToken) {
    try {
      const response = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email',
          access_token: accessToken
        }
      });

      return {
        email: response.data.email,
        name: response.data.name,
        id: response.data.id
      };
    } catch (error) {
      console.error('Error getting Meta account info:', error.response?.data || error.message);
      throw new Error('Failed to get Meta account information');
    }
  }

  /**
   * Fetches ad accounts associated with the user
   * @param {string} accessToken The access token.
   * @returns {Promise<array>} List of ad accounts
   */
  static async getAdAccounts(accessToken) {
    try {
      const response = await axios.get(`${META_API_BASE}/me/adaccounts`, {
        params: {
          fields: 'id,name,currency,account_status',
          access_token: accessToken,
          limit: 100
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad accounts:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Fetches campaigns from a specific ad account
   * @param {string} accessToken The access token.
   * @param {string} adAccountId The ad account ID
   * @returns {Promise<array>} List of campaigns with metrics
   */
  static async getCampaignsFromMeta(accessToken, adAccountId) {
    try {
      // Remover prefixo 'act_' se existir
      const accountId = adAccountId.replace('act_', '');
      
      const response = await axios.get(`${META_API_BASE}/act_${accountId}/campaigns`, {
        params: {
          fields: 'id,name,status,created_time,updated_time,daily_budget,lifetime_budget,objective,adset_count',
          access_token: accessToken,
          limit: 100
        }
      });

      // Buscar insights para cada campanha (impressões, cliques, spend)
      const campaigns = await Promise.all(
        (response.data.data || []).map(async (campaign) => {
          try {
            // Get insights from the last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            const insightsResponse = await axios.get(
              `${META_API_BASE}/${campaign.id}/insights`,
              {
                params: {
                  fields: 'impressions,clicks,spend,actions,action_values',
                  time_range: JSON.stringify({
                    since: thirtyDaysAgo.toISOString().split('T')[0],
                    until: today.toISOString().split('T')[0]
                  }),
                  access_token: accessToken
                }
              }
            );

            const insights = insightsResponse.data.data[0] || {};
            const conversions = insights.actions?.find(a => a.action_type === 'offsite_conversion.post_purchase')?.value || 0;

            return {
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              spent: parseFloat(insights.spend || 0),
              conversions: parseInt(conversions),
              objective: campaign.objective,
              createdTime: campaign.created_time
            };
          } catch (err) {
            console.warn(`Failed to get insights for campaign ${campaign.id}:`, err.message);
            return {
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              impressions: 0,
              clicks: 0,
              spent: 0,
              conversions: 0,
              objective: campaign.objective,
              createdTime: campaign.created_time
            };
          }
        })
      );

      return campaigns;
    } catch (error) {
      console.error('Error fetching Meta Ads campaigns:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Store tokens for future use
   */
  static storeTokens(userId, provider, tokens) {
    const integrationId = uuidv4();
    const integration = {
      id: integrationId,
      userId,
      provider,
      ...tokens,
      connectedAt: new Date().toISOString()
    };

    tokenStore.set(integrationId, integration);
    saveTokensToFile(); // Persist to disk
    return integration;
  }

  /**
   * Get stored tokens by integration ID
   */
  static getTokens(integrationId) {
    return tokenStore.get(integrationId);
  }

  /**
   * Get all integrations for a user
   */
  static getAllIntegrations(userId) {
    const integrations = Array.from(tokenStore.values())
      .filter(int => int.userId === userId)
      .map(int => ({
        id: int.id,
        provider: int.provider,
        email: int.email,
        connectedAt: int.connectedAt,
        name: int.name,
        adAccountId: int.adAccountId
      }));

    return integrations;
  }

  /**
   * Remove an integration
   */
  static removeIntegration(integrationId) {
    const result = tokenStore.delete(integrationId);
    saveTokensToFile(); // Persist to disk
    return result;
  }
}

export default MetaOAuthService;
