import React, { useMemo } from 'react';
import type { Campaign } from '../types';

declare var marked: {
  parse(markdown: string): string;
};

interface AIInsightsProps {
  selectedCampaignIds: string[];
  allCampaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  insights?: string[];
  dateRange?: { start: string; end: string };
  dailyPerformanceData?: any[];
}

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mt-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
);


export const AIInsights: React.FC<AIInsightsProps> = ({ selectedCampaignIds, allCampaigns, isLoading, error, insights = [], dateRange, dailyPerformanceData = [] }) => {
    const insightsToDisplay = useMemo(() => {
        // Use the insights passed from Dashboard
        if (!insights || insights.length === 0) {
            return [];
        }
        
        // Case 1: No campaigns selected. Show last insight from all campaigns
        if (selectedCampaignIds.length === 0) {
            // Mostrar apenas o primeiro insight (mais recente, já que vem ordenado por data DESC)
            return insights.length > 0 ? [insights[0]] : [];
        }
        
        // Case 2: Specific campaigns are selected. Filter and show last insight of each
        const selectedCampaigns = allCampaigns.filter(c => selectedCampaignIds.includes(c.id));
        if (selectedCampaigns.length === 0) {
            return [];
        }
        
        const selectedCampaignNames = selectedCampaigns.map(c => c.name);
        const relevantInsights: string[] = [];
        
        selectedCampaignNames.forEach((campaignName) => {
            // Encontrar insights que mencionam essa campanha
            const matchingInsights = insights.filter(i => 
                i && i.includes(campaignName)
            );
            // Adicionar apenas o primeiro (mais recente) insight dessa campanha
            if (matchingInsights.length > 0) {
                relevantInsights.push(matchingInsights[0]);
            }
        });
        
        return relevantInsights;
    }, [selectedCampaignIds, allCampaigns, insights, dateRange, dailyPerformanceData]);


    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }

        if (error) {
            return (
                <div className="text-center text-red-500">
                    <p className="font-semibold">Erro ao carregar análise:</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            );
        }

        if (insightsToDisplay.length > 0) {
            return (
                <div className="space-y-6">
                    {insightsToDisplay.map((insightContent, index) => (
                        <div key={index}>
                             {index > 0 && <hr className="my-6 border-border-light dark:border-border-dark" />}
                            <div 
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: marked.parse(insightContent) }} 
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center h-full flex flex-col justify-center items-center">
                <SparklesIcon className="w-12 h-12 text-primary-light dark:text-primary-dark mb-2" />
                 <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {selectedCampaignIds.length > 0
                        ? 'Nenhuma análise específica encontrada para a seleção atual.'
                        : 'Nenhum insight de IA encontrado.'
                    }
                </p>
            </div>
        );
    };

    return (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark h-[440px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Insights com IA</h3>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {renderContent()}
            </div>
        </div>
    );
};