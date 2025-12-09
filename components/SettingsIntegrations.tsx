
import React, { useState, useEffect } from 'react';
import { googleAdsService } from '../services/googleAdsService';
import { metaAdsService } from '../services/metaAdsService';

// --- CONFIGURAÇÃO OAUTH GOOGLE ADS ---
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"; 
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/adwords";

// --- CONFIGURAÇÃO OAUTH GA4 ---
const GA4_CLIENT_ID = "YOUR_GA4_CLIENT_ID.apps.googleusercontent.com";
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

// --- CONFIGURAÇÃO OAUTH TIKTOK ADS ---
// URL Oficial da API de Marketing do TikTok
const TIKTOK_APP_ID = "YOUR_TIKTOK_APP_ID";
const TIKTOK_AUTH_URL = "https://ads.tiktok.com/marketing_api/auth";

const REDIRECT_URI = window.location.origin;

// Get a unique user ID (in production, get from auth context)
const getUserId = () => {
  let userId = localStorage.getItem('app_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('app_user_id', userId);
  }
  return userId;
};

const GoogleIcon = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
  </svg>
);

const GA4Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 mr-2">
    <path fill="#F9AB00" d="M12 40h24v4H12z"/>
    <path fill="#E37400" d="M28 16h8v20h-8zM12 28h8v8h-8z"/>
    <circle cx="32" cy="14" r="4" fill="#E37400"/>
  </svg>
);

const MetaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#0668E1]" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M17.25,10c-2.25,0-3.75,1.5-3.75,3.5s1.5,3.5,3.75,3.5S21,15.5,21,13.5S19.5,10,17.25,10z M6.75,10C4.5,10,3,11.5,3,13.5S4.5,17,6.75,17S10.5,15.5,10.5,13.5S9,10,6.75,10z M17.25,18.5c-1.33,0-2.53-0.47-3.5-1.26c-0.97-0.79-1.75-2.74-1.75-2.74s-0.78,1.95-1.75,2.74c-0.97,0.79-2.17,1.26-3.5,1.26C2.91,18.5,0,16.22,0,13.5S2.91,8.5,6.75,8.5c1.33,0,2.53,0.47,3.5,1.26c0.97,0.79,1.75,2.74,1.75,2.74s0.78-1.95,1.75-2.74c0.97-0.79,2.17-1.26,3.5-1.26C21.09,8.5,24,10.78,24,13.5S21.09,18.5,17.25,18.5z" />
  </svg>
);

const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" stroke="currentColor" fill="currentColor"></path>
    </svg>
);

export const SettingsIntegrations: React.FC = () => {
  // Google Ads States
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleAccountId, setGoogleAccountId] = useState<string | null>(null);
  const [googleIntegrationId, setGoogleIntegrationId] = useState<string | null>(null);
  const [googleName, setGoogleName] = useState<string | null>(null);
  
  // Modal States for credentials
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [credentialsError, setCredentialsError] = useState('');

  // GA4 States
  const [ga4Connected, setGa4Connected] = useState(false);
  const [isConnectingGA4, setIsConnectingGA4] = useState(false);
  const [ga4AccountId, setGa4AccountId] = useState<string | null>(null);

  // TikTok States
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
  const [tiktokAccountId, setTiktokAccountId] = useState<string | null>(null);

  // Meta Ads States
  const [metaConnected, setMetaConnected] = useState(false);
  const [isConnectingMeta, setIsConnectingMeta] = useState(false);
  const [metaAccountId, setMetaAccountId] = useState<string | null>(null);
  const [metaIntegrationId, setMetaIntegrationId] = useState<string | null>(null);
  const [metaName, setMetaName] = useState<string | null>(null);

  // Setup inicial e Listener de OAuth Callback
  useEffect(() => {
    const userId = getUserId();
    
    // Carregar integrações do localStorage (fallback principal)
    const storedGoogle = localStorage.getItem('google_ads_connected');
    if (storedGoogle === 'true') {
      setGoogleConnected(true);
      setGoogleAccountId(localStorage.getItem('google_account_id'));
      setGoogleName(localStorage.getItem('google_account_name'));
      setGoogleIntegrationId(localStorage.getItem('google_integration_id'));
    }

    // Verificar retorno de OAuth (Auth Code na URL)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const connectingProvider = localStorage.getItem('connecting_provider');

    if (code && connectingProvider === 'google' && !googleConnected) {
      handleOAuthCallback(code, userId);
    }

    // Carregar outros integrações do localStorage (GA4, TikTok, Meta)
    const storedGA4 = localStorage.getItem('ga4_connected');
    if (storedGA4 === 'true') {
      setGa4Connected(true);
      setGa4AccountId(localStorage.getItem('ga4_account_id') || 'UA-998877-GA4');
    }

    const storedTikTok = localStorage.getItem('tiktok_ads_connected');
    if (storedTikTok === 'true') {
      setTiktokConnected(true);
      setTiktokAccountId(localStorage.getItem('tiktok_account_id') || 'tiktok-adv-888');
    }

    const storedMeta = localStorage.getItem('meta_ads_connected');
    if (storedMeta === 'true') {
      setMetaConnected(true);
      setMetaAccountId(localStorage.getItem('meta_account_id'));
      setMetaName(localStorage.getItem('meta_account_name'));
      setMetaIntegrationId(localStorage.getItem('meta_integration_id'));
    }
  }, []);

  const handleOAuthCallback = async (code: string, userId: string) => {
    try {
      setIsConnectingGoogle(true);
      
      // Get stored credentials
      const clientId = localStorage.getItem('google_oauth_client_id');
      const clientSecret = localStorage.getItem('google_oauth_client_secret');

      const result = await googleAdsService.handleCallback(
        code,
        window.location.origin + '/callback',
        userId,
        clientId,
        clientSecret
      );

      if (result.success && result.integration) {
        setGoogleConnected(true);
        setGoogleAccountId(result.integration.email);
        setGoogleName(result.integration.name);
        setGoogleIntegrationId(result.integration.id);
        
        // Save to localStorage as backup
        localStorage.setItem('google_ads_connected', 'true');
        localStorage.setItem('google_account_id', result.integration.email);
        localStorage.setItem('google_account_name', result.integration.name);
        localStorage.setItem('google_integration_id', result.integration.id);
        
        localStorage.removeItem('connecting_provider');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Erro ao conectar com Google Ads. Por favor, tente novamente.');
      localStorage.removeItem('connecting_provider');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // --- GOOGLE ADS HANDLERS ---
  const handleConnectGoogle = async () => {
    try {
      // Check if credentials are stored locally
      const storedClientId = localStorage.getItem('google_oauth_client_id');
      const storedClientSecret = localStorage.getItem('google_oauth_client_secret');
      
      if (!storedClientId || !storedClientSecret) {
        // Show modal to enter credentials
        setShowCredentialsModal(true);
        setCredentialsError('');
        return;
      }
      
      initiateOAuthFlow(storedClientId, storedClientSecret);
    } catch (error) {
      console.error('Error initiating Google Ads connection:', error);
      alert('Erro ao iniciar conexão com Google Ads');
    }
  };

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setCredentialsError('Por favor, preencha Client ID e Client Secret');
      return;
    }

    if (!clientId.includes('.apps.googleusercontent.com')) {
      setCredentialsError('Client ID inválido. Deve terminar com .apps.googleusercontent.com');
      return;
    }

    // Save credentials to localStorage (in production, use secure storage)
    localStorage.setItem('google_oauth_client_id', clientId);
    localStorage.setItem('google_oauth_client_secret', clientSecret);
    
    setShowCredentialsModal(false);
    setCredentialsError('');
    
    // Now initiate OAuth flow
    initiateOAuthFlow(clientId, clientSecret);
  };

  const initiateOAuthFlow = async (id: string, secret: string) => {
    try {
      setIsConnectingGoogle(true);
      localStorage.setItem('connecting_provider', 'google');
      
      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Enviar credenciais para o backend gerar a URL OAuth
      const response = await fetch(`${apiUrl}/auth/google-ads/oauth-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: id,
          clientSecret: secret,
          redirectUri: window.location.origin + '/callback'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get OAuth URL from backend');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      alert('Erro ao iniciar fluxo OAuth: ' + (error as any).message);
      setIsConnectingGoogle(false);
      localStorage.removeItem('connecting_provider');
    }
  };

  const handleDisconnectGoogle = async () => {
    if (confirm('Tem certeza que deseja desconectar sua conta do Google Ads?')) {
      try {
        if (googleIntegrationId) {
          await googleAdsService.disconnect(googleIntegrationId);
        }
        
        // Clean up storage
        localStorage.removeItem('google_ads_connected');
        localStorage.removeItem('google_account_id');
        localStorage.removeItem('google_account_name');
        localStorage.removeItem('google_integration_id');
        
        setGoogleConnected(false);
        setGoogleAccountId(null);
        setGoogleName(null);
        setGoogleIntegrationId(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Erro ao desconectar. Por favor, tente novamente.');
      }
    }
  };

  // --- GA4 HANDLERS ---
  const handleConnectGA4 = () => {
    localStorage.setItem('connecting_provider', 'ga4');
    // Usa o endpoint do Google, mas com escopo do Analytics
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GA4_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GA4_SCOPE)}&access_type=offline&prompt=consent&include_granted_scopes=true`;
    window.location.href = oauthUrl;
  };

  const handleDisconnectGA4 = () => {
    if (confirm('Tem certeza que deseja desconectar sua conta do Google Analytics?')) {
        localStorage.removeItem('ga4_connected');
        setGa4Connected(false);
        setGa4AccountId(null);
    }
  };

  // --- TIKTOK HANDLERS ---
  const handleConnectTikTok = () => {
    localStorage.setItem('connecting_provider', 'tiktok');
    const state = Math.random().toString(36).substring(7);
    const tiktokUrl = `${TIKTOK_AUTH_URL}?app_id=${TIKTOK_APP_ID}&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&rid=${state}`;
    window.location.href = tiktokUrl;
  };

  const handleDisconnectTikTok = () => {
      if (confirm('Tem certeza que deseja desconectar sua conta do TikTok Ads?')) {
          localStorage.removeItem('tiktok_ads_connected');
          setTiktokConnected(false);
          setTiktokAccountId(null);
      }
  };

  // --- META ADS HANDLERS ---
  // Meta Ads agora lê direto do Supabase, sem necessidade de OAuth
  const handleConnectMeta = async () => {
    try {
      setIsConnectingMeta(true);
      
      // Verificar se dados estão disponíveis no Supabase
      const isAvailable = await metaAdsService.isAvailable();
      
      if (isAvailable) {
        // Simular integração (dados vêm do Supabase)
        localStorage.setItem('meta_ads_connected', 'true');
        setMetaConnected(true);
        setMetaName('Meta Ads (Supabase)');
        alert('Meta Ads conectado com sucesso!');
      } else {
        alert('Nenhum dado de Meta Ads encontrado no Supabase.');
      }
    } catch (error) {
      console.error('Error connecting Meta Ads:', error);
      alert('Erro ao conectar com Meta Ads');
    } finally {
      setIsConnectingMeta(false);
    }
  };

  const handleDisconnectMeta = async () => {
    if (confirm('Tem certeza que deseja desconectar Meta Ads?')) {
      try {
        // Clean up storage
        localStorage.removeItem('meta_ads_connected');
        localStorage.removeItem('meta_account_id');
        localStorage.removeItem('meta_account_name');
        localStorage.removeItem('meta_integration_id');
        
        setMetaConnected(false);
        setMetaAccountId(null);
        setMetaName(null);
        setMetaIntegrationId(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Erro ao desconectar. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
          Integrações de Plataformas
        </h3>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Gerencie as conexões com suas contas de anúncio e analytics para permitir a importação automática de métricas.
        </p>

        <div className="space-y-4">
            
            {/* Google Ads Integration Card */}
            <div className="border border-border-light dark:border-border-dark rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                        <GoogleIcon />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">Google Ads</h4>
                            {googleConnected && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Ativo
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            {googleConnected 
                                ? `Conectado: ${googleName || googleAccountId}` 
                                : 'Importe campanhas, grupos de anúncios e palavras-chave.'}
                        </p>
                    </div>
                </div>
                
                <div>
                    {googleConnected ? (
                        <button 
                            onClick={handleDisconnectGoogle}
                            className="px-4 py-2 border border-border-light dark:border-border-dark text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors"
                        >
                            Desconectar
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnectGoogle}
                            disabled={isConnectingGoogle}
                            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isConnectingGoogle ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Finalizando...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2"><GoogleIcon /></span>
                                    Conectar
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

             {/* Google Analytics 4 Integration Card */}
             <div className="border border-border-light dark:border-border-dark rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                        <GA4Icon />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">Google Analytics 4</h4>
                            {ga4Connected && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Ativo
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            {ga4Connected 
                                ? `Conectado à propriedade: ${ga4AccountId}` 
                                : 'Sincronize dados de tráfego, sessões e conversões do site.'}
                        </p>
                    </div>
                </div>
                
                <div>
                    {ga4Connected ? (
                        <button 
                            onClick={handleDisconnectGA4}
                            className="px-4 py-2 border border-border-light dark:border-border-dark text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors"
                        >
                            Desconectar
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnectGA4}
                            disabled={isConnectingGA4}
                            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isConnectingGA4 ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Finalizando...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2"><GA4Icon /></span>
                                    Conectar
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Meta Ads Integration Card */}
            <div className="border border-border-light dark:border-border-dark rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-75">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-[#0668E1]">
                        <MetaIcon />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">Meta Ads</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Gerenciado
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            Conexão gerenciada via Supabase Integration.
                        </p>
                    </div>
                </div>
                <button className="px-4 py-2 text-gray-400 cursor-not-allowed text-sm font-medium border border-transparent">
                    Configurado
                </button>
            </div>
            
             {/* TikTok Ads Integration Card */}
             <div className="border border-border-light dark:border-border-dark rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-black rounded-full shadow-sm border border-gray-100 text-white">
                       <TikTokIcon />
                    </div>
                    <div>
                         <div className="flex items-center gap-2">
                            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">TikTok Ads</h4>
                            {tiktokConnected && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Ativo
                                </span>
                            )}
                         </div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            {tiktokConnected 
                                ? `Conectado à conta ID: ${tiktokAccountId}`
                                : 'Conecte sua conta TikTok Business para importar dados.'}
                        </p>
                    </div>
                </div>
                
                <div>
                    {tiktokConnected ? (
                        <button 
                            onClick={handleDisconnectTikTok}
                            className="px-4 py-2 border border-border-light dark:border-border-dark text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors"
                        >
                            Desconectar
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnectTikTok}
                            disabled={isConnectingTikTok}
                             className="flex items-center justify-center px-4 py-2 bg-black text-white border border-black rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isConnectingTikTok ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Conectando...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2"><TikTokIcon /></span>
                                    Conectar
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* Modal para credenciais do Google OAuth */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg max-w-md w-full p-6 border border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Configurar Google Ads
            </h3>
            
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
              Cole suas credenciais OAuth do Google Cloud Console.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="xxxxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Sua chave secreta"
                  className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {credentialsError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                  {credentialsError}
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-xs">
                <p className="font-semibold mb-2">Como obter suas credenciais:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
                  <li>Crie um novo projeto</li>
                  <li>Ative "Google Ads API"</li>
                  <li>Vá em Credenciais → OAuth 2.0 Client ID</li>
                  <li>Copie Client ID e Secret</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="flex-1 px-4 py-2 border border-border-light dark:border-border-dark rounded-md text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCredentials}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
