import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

import { tokenStore, integrationStore } from './store.js';

export class GoogleOAuthService {
  static async exchangeAuthCode(code, redirectUri, clientId, clientSecret) {
    try {
      // Use provided credentials or fall back to env variables
      const id = clientId || process.env.GOOGLE_CLIENT_ID;
      const secret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;

      const response = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: id,
        client_secret: secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        expiresAt: new Date(Date.now() + expires_in * 1000)
      };
    } catch (error) {
      console.error('Error exchanging auth code:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  static async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      const { access_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        expiresIn: expires_in,
        expiresAt: new Date(Date.now() + expires_in * 1000)
      };
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  static async revokeToken(accessToken) {
    try {
      await axios.post(GOOGLE_REVOKE_URL, null, {
        params: {
          token: accessToken
        }
      });
      return true;
    } catch (error) {
      console.error('Error revoking token:', error.message);
      // Don't throw, as revocation might fail but we still want to disconnect
      return false;
    }
  }

  static async getGoogleAdsAccount(accessToken) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        id: response.data.id
      };
    } catch (error) {
      console.error('Error getting Google account info:', error.message);
      throw new Error('Failed to get Google account information');
    }
  }


}

export default GoogleOAuthService;
