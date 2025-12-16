
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { ChatBot } from './components/ChatBot';
import { SettingsUser } from './components/SettingsUser';
import { SettingsParams } from './components/SettingsParams';
import { SettingsIntegrations } from './components/SettingsIntegrations';
import { SiteDashboard } from './components/SiteDashboard';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { fetchCampaignDetails } from './services/geminiService';
import { googleAdsService } from './services/googleAdsService';
import { metaAdsService } from './services/metaAdsService';
import type { Theme, Campaign } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('principal');

  // Lifted State from Dashboard
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [dailyPerformanceData, setDailyPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // OAuth Callback Handling - Detecta retorno do Google
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      // Se houver um código de autorização na URL, assume-se que é o retorno do Google Ads
      if (code) {
          setCurrentView('settings-integrations');
      }
  }, []);

  // Fetch Data Logic (moved from Dashboard)
  useEffect(() => {
    // Don't fetch data for settings or site pages to save resources
    if (currentView.startsWith('settings-') || currentView === 'site' || currentView === 'simulator') {
        return;
    }

    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);
        setDailyPerformanceData([]); // Reset daily data when view changes
        
        console.log('[App] loadInitialData called for view:', currentView);
        
        try {
            let data: Campaign[] = [];
            
            if (currentView === 'principal') {
                // Carregar dados consolidados de Google + Meta
                try {
                    console.log('[App] Loading PRINCIPAL view data');
                    
                    // Buscar Google Ads do Supabase
                    const googleResponse = await googleAdsService.getCampaignsSupabase();
                    const googleDailyResponse = await googleAdsService.getDailyPerformanceSupabase();
                    
                    console.log('[App] googleDailyResponse:', googleDailyResponse);
                    
                    // Buscar Meta Ads do Supabase
                    const metaResponse = await metaAdsService.getCampaignsSupabase();
                    const metaDailyResponse = await metaAdsService.getDailyPerformanceSupabase();
                    const metaDailyJson = metaDailyResponse;
                    
                    console.log('[App] Loading consolidated data:', {
                        googleDaily: googleDailyResponse,
                        metaDaily: metaDailyJson
                    });
                    
                    // Processar Google Ads
                    if (googleResponse.success && googleResponse.campaigns && googleResponse.campaigns.length > 0) {
                        const googleCampaigns = googleResponse.campaigns.map((campaign: any) => ({
                            id: campaign.id,
                            name: campaign.name,
                            platform: campaign.platform || 'Google Ads',
                            status: campaign.status || 'active',
                            impressions: campaign.metrics?.impressions || 0,
                            clicks: campaign.metrics?.clicks || 0,
                            spent: campaign.metrics?.spend || 0,
                            conversions: campaign.metrics?.conversions || 0,
                            leads: campaign.metrics?.leads || 0,
                            cpa: campaign.metrics?.cpa || 0,
                        }));
                        data.push(...googleCampaigns);
                    }
                    
                    // Processar Meta Ads
                    if (metaResponse.success && metaResponse.campaigns && metaResponse.campaigns.length > 0) {
                        const metaCampaigns = metaResponse.campaigns.map((campaign: any) => ({
                            id: campaign.id,
                            name: campaign.name,
                            platform: 'Facebook Ads',
                            status: campaign.status || 'active',
                            impressions: campaign.metrics?.impressions || 0,
                            clicks: campaign.metrics?.clicks || 0,
                            spent: campaign.metrics?.spend || 0,
                            conversions: 0,
                            leads: campaign.metrics?.leads || 0,
                            cpa: campaign.metrics?.leads > 0 ? parseFloat((campaign.metrics?.spend / campaign.metrics?.leads).toFixed(2)) : 0,
                        }));
                        data.push(...metaCampaigns);
                    }
                    
                    // Função auxiliar para formatar data
                    const formatDate = (dateField: any): string => {
                        let dateObj;
                        if (dateField) {
                            if (typeof dateField === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateField)) {
                                // Já está em ISO, retorna direto
                                return dateField.split('T')[0];
                            } else {
                                dateObj = new Date(dateField);
                            }
                        }
                        return dateObj && !isNaN(dateObj.getTime()) 
                            ? dateObj.toISOString().split('T')[0]
                            : String(dateField);
                    };

                    // Processar dados diários consolidados
                    const googleDailyFormatted = googleDailyResponse.data?.map((d: any) => {
                        const formattedDate = formatDate(d.date || d.data);
                        
                        return {
                            date: formattedDate,
                            clicks: parseFloat(d.clicks || d.cliques || 0),
                            leads: parseFloat(d.leads || 0),
                            impressions: parseFloat(d.impressions || d.impressoes || 0),
                            conversions: parseFloat(d.conversions || d.conversoes || 0),
                            spend: parseFloat(d.spend || d.custo || 0)
                        };
                    }) || [];
                    
                    const metaDailyFormatted = metaDailyJson.data?.map((d: any) => ({
                        date: formatDate(d.date),
                        clicks: d.clicks,
                        leads: d.leads,
                        impressions: d.impressions,
                        conversions: d.leads,
                        spend: d.spend || d.investimento || d.gasto || 0
                    })) || [];
                    
                    // Consolidar dados por data
                    const dateMap = new Map<string, any>();
                    
                    googleDailyFormatted.forEach((d: any) => {
                        if (!dateMap.has(d.date)) {
                            dateMap.set(d.date, {
                                date: d.date,
                                clicks: 0,
                                leads: 0,
                                impressions: 0,
                                conversions: 0,
                                spend: 0
                            });
                        }
                        const entry = dateMap.get(d.date);
                        entry.clicks += d.clicks;
                        entry.leads += d.leads;
                        entry.impressions += d.impressions;
                        entry.conversions += d.conversions;
                        entry.spend += d.spend;
                    });
                    
                    metaDailyFormatted.forEach((d: any) => {
                        if (!dateMap.has(d.date)) {
                            dateMap.set(d.date, {
                                date: d.date,
                                clicks: 0,
                                leads: 0,
                                impressions: 0,
                                conversions: 0,
                                spend: 0
                            });
                        }
                        const entry = dateMap.get(d.date);
                        entry.clicks += d.clicks;
                        entry.leads += d.leads;
                        entry.impressions += d.impressions;
                        entry.conversions += d.conversions;
                        entry.spend += d.spend;
                    });
                    
                    const combinedDailyData = Array.from(dateMap.values()).sort((a, b) => {
                        // Parsear datas em formato ISO (yyyy-MM-dd)
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                    }).map((d: any) => ({
                        ...d,
                        _source: 'consolidated' // Marcar como dados consolidados
                    }));
                    console.log('[App] Combined daily data for principal:', combinedDailyData.length, 'days', combinedDailyData);
                    console.log('[App] Setting dailyPerformanceData for PRINCIPAL:', combinedDailyData.length, 'days');
                    setDailyPerformanceData(combinedDailyData);
                    
                } catch (e) {
                    console.error("Error loading consolidated data:", e);
                    setError("Erro ao carregar dados consolidados das plataformas.");
                }
            } else if (currentView === 'meta') {
                try {
                    console.log('[App] Loading META view data');
                    
                    // Buscar campanhas do Supabase (facebook-ads table)
                    const response = await metaAdsService.getCampaignsSupabase();
                    console.log('[DEBUG] Meta Ads response:', response);
                    
                    // Buscar dados diários para o gráfico do Supabase
                    const dailyJson = await metaAdsService.getDailyPerformanceSupabase();
                    console.log('[Meta Ads] Daily response:', dailyJson);
                    
                    if (dailyJson.success && dailyJson.data) {
                        // Formatar dados diários para o gráfico - manter em ISO para filtros
                        const formattedDaily = dailyJson.data.map((d: any) => ({
                            date: typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d.date) 
                                ? d.date.split('T')[0]
                                : new Date(d.date).toISOString().split('T')[0],
                            clicks: d.clicks,
                            leads: d.leads,
                            impressions: d.impressions,
                            conversions: d.leads,
                            spend: d.spend || d.investimento || d.gasto || 0
                        }));
                        console.log('[App] Setting dailyPerformanceData for META:', formattedDaily.length, 'days');
                        setDailyPerformanceData(formattedDaily);
                    }
                    
                    if (response.success && response.campaigns && response.campaigns.length > 0) {
                        // Consolidar dados por campanha (agregar múltiplas linhas do mesmo dia)
                        const campaignMap = new Map();
                        
                        response.campaigns.forEach((campaign: any) => {
                            const key = campaign.name;
                            
                            if (!campaignMap.has(key)) {
                                campaignMap.set(key, {
                                    id: campaign.id,
                                    name: campaign.name,
                                    platform: 'Facebook Ads',
                                    status: campaign.status || 'active',
                                    startDate: campaign.startDate,
                                    endDate: campaign.endDate,
                                    metrics: {
                                        impressions: 0,
                                        clicks: 0,
                                        spend: 0,
                                        leads: 0,
                                        costPerClick: 0,
                                        cpa: 0
                                    }
                                });
                            }
                            
                            const existing = campaignMap.get(key);
                            existing.metrics.impressions += campaign.metrics?.impressions || 0;
                            existing.metrics.clicks += campaign.metrics?.clicks || 0;
                            existing.metrics.spend += campaign.metrics?.spend || 0;
                            existing.metrics.leads += campaign.metrics?.leads || 0;
                        });
                        
                        // Converter map para array
                        data = Array.from(campaignMap.values()).map((campaign: any) => ({
                            id: campaign.id,
                            name: campaign.name,
                            platform: campaign.platform,
                            status: campaign.status,
                            impressions: campaign.metrics.impressions,
                            clicks: campaign.metrics.clicks,
                            spent: campaign.metrics.spend,
                            conversions: 0,
                            leads: campaign.metrics.leads,
                            cpa: campaign.metrics.leads > 0 ? parseFloat((campaign.metrics.spend / campaign.metrics.leads).toFixed(2)) : 0,
                        }));
                    } else {
                        setError("Nenhuma campanha encontrada no Meta Ads.");
                        data = [];
                    }
                } catch (e) {
                    console.error("Meta Ads fetch error:", e);
                    setError("Erro ao buscar dados do Meta Ads do Supabase.");
                    data = [];
                }
            } else if (currentView === 'google') {
                try {
                    console.log('[App] Loading GOOGLE view data');
                    
                    // Buscar dados do Google Ads do Supabase
                    const response = await googleAdsService.getCampaignsSupabase();
                    console.log('[Google Ads] Campaign response:', response);
                    
                    const dailyResponse = await googleAdsService.getDailyPerformanceSupabase();
                    console.log('[Google Ads] Daily response:', dailyResponse);
                    
                    if (dailyResponse.data) {
                        // Formatar dados diários para o gráfico - manter em ISO para filtros
                        const formattedDaily = dailyResponse.data.map((d: any) => {
                            // Tentar diferentes formas de parsear a data
                            const dateField = d.date || d.data; // Tenta 'date' ou 'data'
                            
                            let isoDate = '';
                            if (dateField) {
                                // Se é uma string de data YYYY-MM-DD
                                if (typeof dateField === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateField)) {
                                    isoDate = dateField.split('T')[0];
                                } else {
                                    const dateObj = new Date(dateField);
                                    isoDate = dateObj && !isNaN(dateObj.getTime()) 
                                        ? dateObj.toISOString().split('T')[0]
                                        : dateField;
                                }
                            }
                            
                            return {
                                date: isoDate,
                                clicks: parseFloat(d.clicks || d.cliques || 0),
                                leads: parseFloat(d.leads || 0),
                                impressions: parseFloat(d.impressions || d.impressoes || 0),
                                conversions: parseFloat(d.conversions || d.conversoes || 0),
                                spend: parseFloat(d.spend || d.custo || 0)
                            };
                        });
                        setDailyPerformanceData(formattedDaily);
                        console.log('[Google Ads] Formatted daily data:', formattedDaily);
                    }
                    
                    if (response.success && response.campaigns && response.campaigns.length > 0) {
                        console.log('[Google Ads] Found campaigns:', response.campaigns.length, response.campaigns.map((c: any) => c.name));
                        data = response.campaigns.map((campaign: any) => {
                            console.log('[Google Ads Map] Campaign:', campaign);
                            return {
                                id: campaign.id,
                                name: campaign.name,
                                platform: campaign.platform || 'Google Ads',
                                status: campaign.status || 'active',
                                impressions: campaign.metrics?.impressions || 0,
                                clicks: campaign.metrics?.clicks || 0,
                                spent: campaign.metrics?.spend || 0,
                                conversions: campaign.metrics?.conversions || 0,
                                leads: campaign.metrics?.leads || 0,
                                cpa: campaign.metrics?.cpa || 0,
                            };
                        });
                        console.log('[Google Ads] Mapped campaign data:', data);
                        console.log('[App] About to set campaign data for Google');
                    } else {
                        console.log('[Google Ads] No campaigns found. response.success:', response.success, 'campaigns length:', response.campaigns?.length);
                        setError("Nenhuma campanha encontrada no Google Ads.");
                        data = [];
                    }
                } catch (e) {
                    console.error("Google Ads fetch error:", e);
                    setError("Erro ao buscar dados do Google Ads do Supabase.");
                    data = [];
                }
            } else if (currentView === 'tiktok') {
                await new Promise(resolve => setTimeout(resolve, 600));
                setError("TikTok Ads não foi integrado. Aguardando implementação com API real.");
                data = [];
            } else {
                await new Promise(resolve => setTimeout(resolve, 600));
                setError("Plataforma não integrada. Apenas Meta Ads possui dados reais no momento.");
                data = [];
            }

            console.log('[App] About to setCampaignData with:', data);
            setCampaignData(data);
        } catch (error: any) {
            setError(error.message || 'Falha ao carregar os dados das campanhas.');
        } finally {
            setIsLoading(false);
        }
    };
    
    loadInitialData();
  }, [currentView]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'meta': return 'Meta Ads Performance';
      case 'google': return 'Google Ads Performance';
      case 'tiktok': return 'TikTok Ads Performance';
      case 'site': return 'Analytics do Site';
      case 'simulator': return 'Simulador de Cenários';
      case 'settings-user': return 'Configurações de Usuário';
      case 'settings-params': return 'Parametrização do Sistema';
      case 'settings-integrations': return 'Integrações';
      default: return 'Visão Geral';
    }
  };

  const renderContent = () => {
      if (currentView === 'settings-user') {
          return <SettingsUser />;
      }
      if (currentView === 'settings-params') {
          return <SettingsParams />;
      }
      if (currentView === 'settings-integrations') {
          return <SettingsIntegrations />;
      }
      if (currentView === 'site') {
          return <SiteDashboard />;
      }
      if (currentView === 'simulator') {
          return <ScenarioSimulator />;
      }
      return (
        <Dashboard 
            view={currentView} 
            campaigns={campaignData}
            dailyPerformanceData={dailyPerformanceData}
            isLoading={isLoading}
            error={error}
        />
      );
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          currentTheme={theme} 
          toggleTheme={toggleTheme} 
          title={getPageTitle()}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
        
        {/* ChatBot Component Overlay - Passing campaignData context */}
        <ChatBot campaignData={campaignData} />
      </div>
    </div>
  );
};

export default App;
