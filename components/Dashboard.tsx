import React, { useState, useMemo, useEffect } from 'react';
import type { Campaign, ChartDataPoint } from '../types';
import { MetricCard } from './MetricCard';
import { CampaignPerformanceChart } from './CampaignPerformanceChart';
import { AIInsights } from './AIInsights';
import { CampaignTable } from './CampaignTable';
import { CampaignFilter } from './CampaignFilter';
import { AlertSection } from './AlertSection';
import { DateFilterCalendar } from './DateFilterCalendar';
import { fetchAllInsights } from '../services/geminiService';

const getInitialDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

interface DashboardProps {
    view: string;
    campaigns: Campaign[];
    dailyPerformanceData?: any[];
    isLoading: boolean;
    error: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ view, campaigns, dailyPerformanceData = [], isLoading, error }) => {
    const [dateRange, setDateRange] = useState(getInitialDateRange);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [selectedDailyDate, setSelectedDailyDate] = useState<string | null>(null);
    const [selectedTableDate, setSelectedTableDate] = useState<string | null>(null);
    const [availableTableDates, setAvailableTableDates] = useState<string[]>([]);
    
    // Insights State (Specific to Dashboard view logic, kept here)
    const [allInsights, setAllInsights] = useState<string[]>([]);
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);
    const [insightError, setInsightError] = useState<string | null>(null);

    // Efeito para selecionar todas as campanhas por padrão
    useEffect(() => {
        if (campaigns && campaigns.length > 0) {
            setSelectedCampaignIds(campaigns.map(c => c.id));
        }
    }, [campaigns]);

    // Buscar datas disponíveis do backend
    useEffect(() => {
        const loadAvailableDates = async () => {
            // @ts-ignore
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            try {
                let dates: string[] = [];
                
                if (view === 'google') {
                    const response = await fetch(`${apiUrl}/dates/google-ads`, { credentials: 'include' });
                    const json = await response.json();
                    dates = json.dates || [];
                } else if (view === 'meta') {
                    const response = await fetch(`${apiUrl}/dates/meta-ads`, { credentials: 'include' });
                    const json = await response.json();
                    dates = json.dates || [];
                } else if (view === 'principal') {
                    // Buscar de ambas as plataformas e combinar
                    const [googleRes, metaRes] = await Promise.all([
                        fetch(`${apiUrl}/dates/google-ads`, { credentials: 'include' }),
                        fetch(`${apiUrl}/dates/meta-ads`, { credentials: 'include' })
                    ]);
                    const googleJson = await googleRes.json();
                    const metaJson = await metaRes.json();
                    const allDates = [...new Set([...(googleJson.dates || []), ...(metaJson.dates || [])])];
                    dates = allDates.sort();
                }
                
                console.log(`[Dashboard] Available dates for ${view}:`, dates.length);
                setAvailableTableDates(dates);
            } catch (error) {
                console.error('[Dashboard] Error loading dates:', error);
                setAvailableTableDates([]);
            }
        };
        
        loadAvailableDates();
    }, [view]);

    useEffect(() => {
        const loadInsights = async () => {
            if (view === 'meta' || view === 'google') {
                setIsInsightLoading(true);
                setInsightError(null);
                try {
                    const insightsList = await fetchAllInsights(view);
                    setAllInsights(insightsList);
                } catch (error: any) {
                    setInsightError("Não foi possível carregar os insights de IA neste momento.");
                } finally {
                    setIsInsightLoading(false);
                }
            } else if (view === 'principal') {
                // Para visão principal, carregar insights de ambas as plataformas
                setIsInsightLoading(true);
                setInsightError(null);
                try {
                    const googleInsights = await fetchAllInsights('google');
                    const metaInsights = await fetchAllInsights('meta');
                    
                    // Combinar insights de ambas as plataformas
                    const combinedInsights = [...googleInsights, ...metaInsights];
                    setAllInsights(combinedInsights);
                } catch (error: any) {
                    setInsightError("Não foi possível carregar os insights de IA neste momento.");
                } finally {
                    setIsInsightLoading(false);
                }
            } else {
                setAllInsights([]);
                setIsInsightLoading(false);
            }
        };
        loadInsights();
    }, [view]);

    const filteredPerformanceDataByDate = useMemo(
        () => [],
        [dateRange]
    );

    const filteredCampaignTableData = useMemo(() => {
        let filtered = campaigns;
        
        console.log('[Dashboard] Filtrando campanhas:', {
            totalCampaigns: campaigns.length,
            selectedCampaignIds,
            selectedTableDate,
            sampleCampaigns: campaigns.slice(0, 2).map(c => ({ id: c.id, name: c.name, startDate: c.startDate }))
        });
        
        // Filtrar por campanhas selecionadas
        if (selectedCampaignIds.length > 0) {
            filtered = filtered.filter(campaign => selectedCampaignIds.includes(campaign.id));
        }
        
        // Filtrar por data selecionada na tabela
        if (selectedTableDate) {
            console.log('[Dashboard] Aplicando filtro de data:', selectedTableDate);
            filtered = filtered.filter(campaign => {
                const campaignDate = campaign.startDate;
                if (!campaignDate) {
                    console.log('[Dashboard] Campaign sem startDate:', campaign.name);
                    return false;
                }
                
                // Normalizar data para ISO (yyyy-MM-dd) para comparação
                let normalizedCampaignDate = '';
                if (typeof campaignDate === 'string') {
                    if (/^\d{4}-\d{2}-\d{2}/.test(campaignDate)) {
                        // Já está em ISO
                        normalizedCampaignDate = campaignDate.split('T')[0];
                    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(campaignDate)) {
                        // Converter pt-BR para ISO
                        const [day, month, year] = campaignDate.split('/');
                        normalizedCampaignDate = `${year}-${month}-${day}`;
                    }
                }
                
                const matches = normalizedCampaignDate === selectedTableDate;
                console.log('[Dashboard] Comparando:', {
                    campaign: campaign.name,
                    campaignDate,
                    normalized: normalizedCampaignDate,
                    selectedTableDate,
                    matches
                });
                
                // selectedTableDate vem em formato ISO do backend
                return matches;
            });
            console.log('[Dashboard] Após filtro de data:', filtered.length, 'campanhas');
        }
        
        return filtered;
    }, [campaigns, selectedCampaignIds, selectedTableDate]);

    const aggregatedTotals = useMemo(() => {
        const result = { spent: 0, impressions: 0, clicks: 0, leads: 0 };
        
        // Se houver dados diários, somar todos eles
        if (dailyPerformanceData && Array.isArray(dailyPerformanceData) && dailyPerformanceData.length > 0) {
            dailyPerformanceData.forEach((d: any) => {
                result.spent += parseFloat(d.spend) || 0;
                result.impressions += parseFloat(d.impressions) || 0;
                result.clicks += parseFloat(d.clicks) || 0;
                result.leads += parseFloat(d.leads) || 0;
            });
            return result;
        }
        
        // Fallback: usar dados das campanhas
        if (filteredCampaignTableData && Array.isArray(filteredCampaignTableData) && filteredCampaignTableData.length > 0) {
            filteredCampaignTableData.forEach((campaign: any) => {
                result.spent += parseFloat(campaign.spent) || 0;
                result.impressions += parseFloat(campaign.impressions) || 0;
                result.clicks += parseFloat(campaign.clicks) || 0;
                result.leads += parseFloat(campaign.leads) || 0;
            });
        }
        
        return result;
    }, [dailyPerformanceData, filteredCampaignTableData]);

    const chartData = useMemo(() => {
        // Para Meta Ads, Google Ads e Visão Principal, usar dados diários passados via props
        if ((view === 'meta' || view === 'google' || view === 'principal') && dailyPerformanceData && dailyPerformanceData.length > 0) {
            const source = dailyPerformanceData[0]?._source || 'unknown';
            console.log(`[Dashboard] chartData for ${view} (source: ${source}):`, dailyPerformanceData.length, 'days');
            
            // Se tem uma data selecionada, filtrar apenas aquele dia
            if (selectedDailyDate) {
                return dailyPerformanceData.filter((d: any) => d.date === selectedDailyDate);
            }
            
            return dailyPerformanceData;
        }
        
        // Outras plataformas: retornar array vazio até que sejam integradas
        return [];
    }, [view, dailyPerformanceData, selectedDailyDate]);

    const allCampaignsForFilter = useMemo(
        () => campaigns.map(({ id, name }) => ({ id, name })), 
        [campaigns]
    );

    const handleCampaignSelectionChange = (selectedIds: string[]) => {
        setSelectedCampaignIds(selectedIds);
    };
    
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
    const formatNumber = (value: number) =>
        new Intl.NumberFormat('pt-BR').format(value);

    return (
        <div className="space-y-6">
            {/* Top Bar Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border-light dark:border-border-dark pb-4">
                <div className="flex flex-wrap items-center gap-4">
                    <CampaignFilter 
                        campaigns={allCampaignsForFilter}
                        selectedCampaignIds={selectedCampaignIds}
                        onSelectionChange={handleCampaignSelectionChange}
                        disabled={isLoading || !!error}
                    />
                </div>
                 {/* Add date picker here later if needed */}
            </div>
            
            {/* 1. Problem Finder / Distortion Area (HERO) */}
            <section>
                <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Diagnóstico de Distorções</h2>
                <AlertSection campaigns={filteredCampaignTableData} />
            </section>

            {/* 2. AI Insights contextually placed next to Alerts in a bigger view, or below */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    {/* General Metrics reduced in visual hierarchy */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetricCard title="Investimento" value={formatCurrency(aggregatedTotals.spent)} />
                        <MetricCard title="Impressões" value={formatNumber(aggregatedTotals.impressions)} />
                        <MetricCard title="Cliques" value={formatNumber(aggregatedTotals.clicks)} />
                        <MetricCard title="Leads" value={formatNumber(aggregatedTotals.leads)} />
                    </div>
                    
                    {/* Filtro de Data para Dados Diários */}
                    {(view === 'meta' || view === 'google' || view === 'principal') && dailyPerformanceData && dailyPerformanceData.length > 0 && (
                        <DateFilterCalendar
                            availableDates={dailyPerformanceData.map((d: any) => d.date)}
                            selectedDate={selectedDailyDate}
                            onDateChange={setSelectedDailyDate}
                            label="Filtrar dados diários:"
                        />
                    )}
                    
                    {/* Main Chart */}
                     <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md border border-border-light dark:border-border-dark" style={{ height: '400px' }}>
                        <CampaignPerformanceChart data={chartData} />
                     </div>
                 </div>

                 {/* AI Insights Column */}
                 <div className="lg:col-span-1">
                    <AIInsights
                        selectedCampaignIds={selectedCampaignIds}
                        allCampaigns={campaigns}
                        isLoading={isInsightLoading}
                        error={insightError}
                        insights={allInsights}
                    />
                 </div>
            </div>

            {/* 3. Detailed Data */}
            <div>
                {/* Filtro de Data para Tabela */}
                {(view === 'meta' || view === 'google' || view === 'principal') && availableTableDates && availableTableDates.length > 0 && (
                    <DateFilterCalendar
                        availableDates={availableTableDates}
                        selectedDate={selectedTableDate}
                        onDateChange={setSelectedTableDate}
                        label="Filtrar tabela por data:"
                    />
                )}
                <CampaignTable data={filteredCampaignTableData} isLoading={isLoading} error={error} />
            </div>
        </div>
    );
};