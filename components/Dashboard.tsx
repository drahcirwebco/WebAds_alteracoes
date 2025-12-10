import React, { useState, useMemo, useEffect } from 'react';
import type { Campaign, ChartDataPoint } from '../types';
import { MetricCard } from './MetricCard';
import { CampaignPerformanceChart } from './CampaignPerformanceChart';
import { AIInsights } from './AIInsights';
import { CampaignTable } from './CampaignTable';
import { CampaignFilter } from './CampaignFilter';
import { AlertSection } from './AlertSection';
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
    
    // Insights State (Specific to Dashboard view logic, kept here)
    const [allInsights, setAllInsights] = useState<string[]>([]);
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);
    const [insightError, setInsightError] = useState<string | null>(null);

    useEffect(() => {
        const loadInsights = async () => {
            if (view === 'meta' || view === 'google') {
                setIsInsightLoading(true);
                setInsightError(null);
                try {
                    const insightsList = await fetchAllInsights(view);
                    
                    // Filtrar apenas o último insight de cada campanha
                    const campaignInsightsMap = new Map<string, string>();
                    
                    insightsList.forEach((insight: string) => {
                        // Extrair nome da campanha do insight (assumindo que está no início ou identificável)
                        // Para simplificar, vamos usar o insight como chave única e manter só o último
                        // Mas se quiser filtrar por campanha específica, precisaria parsear o conteúdo
                        // Por enquanto, vamos manter apenas um insight por "tipo" ou usar os primeiros N
                    });
                    
                    // Para manter apenas o último insight de cada campanha, vamos:
                    // 1. Se houver múltiplos insights, pegar apenas o primeiro (mais recente, já que vem ordenado)
                    // 2. Se quiser separar por campanha, precisaria parsear o conteúdo do insight
                    setAllInsights(insightsList);
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
        // Reset selection when view changes
        setSelectedCampaignIds([]);
    }, [view]);

    const filteredPerformanceDataByDate = useMemo(
        () => [],
        [dateRange]
    );

    const filteredCampaignTableData = useMemo(() => {
        if (selectedCampaignIds.length === 0) {
            return campaigns;
        }
        return campaigns.filter(campaign => selectedCampaignIds.includes(campaign.id));
    }, [campaigns, selectedCampaignIds]);

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
        // Para Meta Ads e Google Ads, usar dados diários passados via props
        if ((view === 'meta' || view === 'google') && dailyPerformanceData && dailyPerformanceData.length > 0) {
            return dailyPerformanceData;
        }
        
        // Outras plataformas: retornar array vazio até que sejam integradas
        return [];
    }, [view, dailyPerformanceData]);

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
                    
                    {/* Main Chart */}
                     <div className="h-[400px]">
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
                <CampaignTable data={filteredCampaignTableData} isLoading={isLoading} error={error} />
            </div>
        </div>
    );
};