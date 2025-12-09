# Google Ads Integration - Setup Guide

## Overview

Este guia descreve como configurar a integração completa com Google Ads no WebAds Analytics, com backend Node.js/Express.

## Architecture

```
Frontend (React/Vite)
    ↓
Backend API (Express)
    ↓
Google OAuth 2.0
    ↓
Google Ads API
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Crie um arquivo `.env` na pasta `backend`:

```env
BACKEND_PORT=5000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5173/callback

# Google Ads (optional - for real API calls)
GOOGLE_ADS_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN
GOOGLE_ADS_CUSTOMER_ID=YOUR_CUSTOMER_ID

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the following APIs:
   - Google Ads API
   - Google Analytics API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`, `http://localhost`
   - Authorized redirect URIs: `http://localhost:5173/callback`
5. Copy the Client ID and Secret to your `.env` file

### 4. Start Backend

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Configure Environment Variables

Create `.env.local` or `.env.development.local` in the root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GEMINI_API_KEY=your_gemini_key
```

### 2. Start Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## OAuth Flow

1. **User clicks "Conectar"** in Settings > Integrations
2. **Frontend calls backend** `/api/auth/google-ads/auth-url`
3. **Backend generates OAuth URL** with proper credentials
4. **User redirected to Google** to grant permissions
5. **Google redirects back** to `http://localhost:5173?code=AUTH_CODE`
6. **Frontend captures the code** and calls `/api/auth/google-ads/callback`
7. **Backend exchanges code** for access/refresh tokens
8. **Tokens stored** in backend (and localStorage as backup)
9. **Frontend marked as connected**

## API Endpoints

### Authentication

- `GET /api/auth/google-ads/auth-url` - Get OAuth authorization URL
- `POST /api/auth/google-ads/callback` - Handle OAuth callback and exchange code
- `GET /api/auth/google-ads/status/:userId` - Check connection status
- `POST /api/auth/google-ads/disconnect` - Disconnect integration

### Integrations

- `GET /api/integrations/:userId` - List all integrations
- `GET /api/integrations/:userId/google-ads` - Get Google Ads integration
- `DELETE /api/integrations/:integrationId` - Disconnect integration

### Campaigns

- `GET /api/campaigns/google-ads/:integrationId` - Get campaigns from Google Ads

## Troubleshooting

### CORS Errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### OAuth Fails

1. Check that redirect URI in Google Console matches `GOOGLE_REDIRECT_URI` in `.env`
2. Verify Client ID and Secret are correct
3. Check browser console for specific errors

### Backend Not Responding

1. Verify backend is running: `curl http://localhost:5000/api/health`
2. Check backend logs for errors
3. Ensure ports are not in use

## Production Deployment

### For Production:

1. Use environment variables from your hosting provider
2. Replace in-memory token storage with a database (PostgreSQL, MongoDB, etc.)
3. Implement proper JWT authentication
4. Use HTTPS for all OAuth flows
5. Store refresh tokens securely
6. Implement token rotation and expiration checks

### Recommended Changes:

```javascript
// Replace tokenStore Map with database
// Example with Supabase:
const { data, error } = await supabase
  .from('integrations')
  .insert([{ userId, provider, tokens: {...} }]);
```

## Security Considerations

- ✅ Client Secret never exposed to frontend
- ✅ Tokens stored securely in backend
- ✅ CORS configured to allow only your frontend
- ✅ OAuth uses `offline` access for refresh tokens
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting on API endpoints
- ⚠️ Add proper authentication middleware
- ⚠️ Validate all user inputs

## Next Steps

1. Integrate with Google Ads API for real campaign data
2. Implement database for persistent token storage
3. Add more OAuth providers (GA4, TikTok)
4. Deploy to production
5. Set up monitoring and error tracking

## References

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
- [Express.js](https://expressjs.com/)
- [React OAuth](https://react.dev/reference/react-dom/createRoot)
