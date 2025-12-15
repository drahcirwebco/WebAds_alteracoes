import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Campaign, ChartDataPoint } from '../types';
import { MetricCard } from './MetricCard';
import { CampaignPerformanceChart } from './CampaignPerformanceChart';
import { AIInsights } from './AIInsights';
import { CampaignTable } from './CampaignTable';
import { CampaignFilter } from './CampaignFilter';
import { AlertSection } from './AlertSection';
import { DateFilterCalendar } from './DateFilterCalendar';
import { fetchAllInsights } from '../services/geminiService';

interface DashboardProps {
    view: string;
    campaigns: Campaign[];
    dailyPerformanceData?: any[];
    isLoading: boolean;
    error: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ view, campaigns, dailyPerformanceData = [], isLoading, error }) => {
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return {
            start: yesterdayStr,
            end: yesterdayStr,
        };
    });
    
    // Refs para os inputs de data
    const startDateInputRef = useRef<HTMLInputElement>(null);
    const endDateInputRef = useRef<HTMLInputElement>(null);
    
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
        () => {
            if (!dailyPerformanceData || dailyPerformanceData.length === 0) return [];
            
            return dailyPerformanceData.filter((d: any) => {
                const date = d.date;
                return date >= dateRange.start && date <= dateRange.end;
            });
        },
        [dailyPerformanceData, dateRange]
    );

    const filteredCampaignTableData = useMemo(() => {
        // Se houver dados diários filtrados por data, usar apenas esses dados
        if (filteredPerformanceDataByDate && Array.isArray(filteredPerformanceDataByDate) && filteredPerformanceDataByDate.length > 0) {
            // Calcular totais agregados dos dados diários por período
            const dailyTotals = {
                spent: 0,
                impressions: 0,
                clicks: 0,
                leads: 0
            };
            
            filteredPerformanceDataByDate.forEach((d: any) => {
                dailyTotals.spent += parseFloat(d.spend) || 0;
                dailyTotals.impressions += parseFloat(d.impressions) || 0;
                dailyTotals.clicks += parseFloat(d.clicks) || 0;
                dailyTotals.leads += parseFloat(d.leads) || 0;
            });
            
            // Calcular totais das campanhas filtradas
            const campaignTotals = {
                spent: 0,
                impressions: 0,
                clicks: 0,
                leads: 0
            };
            
            let filtered = campaigns;
            if (selectedCampaignIds.length > 0) {
                filtered = filtered.filter(campaign => selectedCampaignIds.includes(campaign.id));
            }
            
            filtered.forEach((campaign: any) => {
                campaignTotals.spent += parseFloat(campaign.spent) || 0;
                campaignTotals.impressions += parseFloat(campaign.impressions) || 0;
                campaignTotals.clicks += parseFloat(campaign.clicks) || 0;
                campaignTotals.leads += parseFloat(campaign.leads) || 0;
            });
            
            // Calcular ratios para cada métrica
            const ratios = {
                spent: campaignTotals.spent > 0 ? dailyTotals.spent / campaignTotals.spent : 0,
                impressions: campaignTotals.impressions > 0 ? dailyTotals.impressions / campaignTotals.impressions : 0,
                clicks: campaignTotals.clicks > 0 ? dailyTotals.clicks / campaignTotals.clicks : 0,
                leads: campaignTotals.leads > 0 ? dailyTotals.leads / campaignTotals.leads : 0
            };
            
            // Aplicar ratios a cada campanha
            return filtered.map((campaign: any) => ({
                ...campaign,
                spent: (parseFloat(campaign.spent) || 0) * ratios.spent,
                impressions: (parseFloat(campaign.impressions) || 0) * ratios.impressions,
                clicks: (parseFloat(campaign.clicks) || 0) * ratios.clicks,
                leads: (parseFloat(campaign.leads) || 0) * ratios.leads,
            }));
        }
        
        // Se não houver dados diários para o período, retornar vazio
        return [];
    }, [campaigns, selectedCampaignIds, filteredPerformanceDataByDate]);

    const aggregatedTotals = useMemo(() => {
        const result = { spent: 0, impressions: 0, clicks: 0, leads: 0 };
        
        // Se houver dados diários filtrados por data, somar eles
        if (filteredPerformanceDataByDate && Array.isArray(filteredPerformanceDataByDate) && filteredPerformanceDataByDate.length > 0) {
            filteredPerformanceDataByDate.forEach((d: any) => {
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
    }, [filteredPerformanceDataByDate, filteredCampaignTableData]);

    const chartData = useMemo(() => {
        if ((view === 'meta' || view === 'google' || view === 'principal') && filteredPerformanceDataByDate && filteredPerformanceDataByDate.length > 0) {
            return filteredPerformanceDataByDate;
        }
        return [];
    }, [view, filteredPerformanceDataByDate]);

    const allCampaignsForFilter = useMemo(
        () => campaigns && campaigns.length > 0 ? campaigns.map(({ id, name }) => ({ id, name })) : [], 
        [campaigns]
    );

    const handleCampaignSelectionChange = (selectedIds: string[]) => {
        setSelectedCampaignIds(selectedIds);
    };

    const handleDateRangeChange = (startDate: string, endDate: string) => {
        setDateRange({ start: startDate, end: endDate });
    };

    const handleResetDateRange = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        setDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
        });
    };

    // Get today's date for max date validation
    const todayDate = new Date().toISOString().split('T')[0];
    
    // Get available dates for the calendar
    const availableDatesForCalendar = useMemo(() => {
        if (!dailyPerformanceData || dailyPerformanceData.length === 0) return [];
        return dailyPerformanceData.map((d: any) => d.date);
    }, [dailyPerformanceData]);
    
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
    const formatNumber = (value: number) =>
        new Intl.NumberFormat('pt-BR').format(value);

    // Debug log
    console.log('[Dashboard] Render - campaigns:', campaigns?.length || 0, 'dateRange:', dateRange);

    return (
        <div className="space-y-6">
            {/* Top Bar Controls */}
            <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Filtro de Campanhas */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            Campanhas:
                        </label>
                        <CampaignFilter 
                            campaigns={allCampaignsForFilter}
                            selectedCampaignIds={selectedCampaignIds}
                            onSelectionChange={handleCampaignSelectionChange}
                            disabled={isLoading || !!error}
                        />
                    </div>

                    {/* Filtro de Data */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            Período:
                        </label>
                        <div className="flex items-center gap-2">
                            <DateFilterCalendar
                                availableDates={availableDatesForCalendar}
                                selectedDate={dateRange.start}
                                onDateChange={(date) => {
                                    if (date) {
                                        handleDateRangeChange(date, dateRange.end);
                                    }
                                }}
                                label=""
                            />
                            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">até</span>
                            <DateFilterCalendar
                                availableDates={availableDatesForCalendar}
                                selectedDate={dateRange.end}
                                onDateChange={(date) => {
                                    if (date) {
                                        handleDateRangeChange(dateRange.start, date);
                                    }
                                }}
                                label=""
                            />
                            <button
                                onClick={handleResetDateRange}
                                disabled={isLoading || !!error}
                                className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-10"
                                title="Limpar período"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {allCampaignsForFilter.length === 0 && !isLoading && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma campanha encontrada</p>
                    )}
                    {isLoading && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
                    )}
                </div>
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
                    {console.log('[Dashboard] Renderizar filtro?', {
                        view,
                        hasDaily: !!dailyPerformanceData,
                        dailyLength: dailyPerformanceData?.length || 0,
                        shouldShow: (view === 'meta' || view === 'google' || view === 'principal') && dailyPerformanceData && dailyPerformanceData.length > 0
                    })}
                    
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
                        dateRange={dateRange}
                        dailyPerformanceData={filteredPerformanceDataByDate}
                    />
                 </div>
            </div>

            {/* 3. Detailed Data */}
            <div className="space-y-4">
                <CampaignTable data={filteredCampaignTableData} isLoading={isLoading} error={error} dateRange={dateRange} />
            </div>
        </div>
    );
};