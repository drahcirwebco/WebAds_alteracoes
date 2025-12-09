

import React from 'react';
import type { Campaign } from '../types';

interface CampaignTableProps {
  data: Campaign[];
  isLoading: boolean;
  error: string | null;
}

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ArrowUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
    </svg>
);

const ArrowDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
);

const MetricWithChange: React.FC<{
    value: number;
    diff?: number;
    percent?: number;
    isCurrency?: boolean;
    isPercentage?: boolean;
    higherIsBetter?: boolean;
}> = ({ value, diff, percent, isCurrency = false, isPercentage = false, higherIsBetter = true }) => {
    const formattedValue = isCurrency 
        ? formatCurrency(value) 
        : (isPercentage ? `${value.toFixed(2)}%` : formatNumber(value));

    if (diff === undefined || percent === undefined || Number.isNaN(diff) || Number.isNaN(percent) || diff === 0) {
        return <div className="text-sm font-medium">{formattedValue}</div>;
    }
    
    const isPositive = diff > 0;

    let colorClass = 'text-text-secondary-light dark:text-text-secondary-dark';
    if (isPositive) {
        colorClass = higherIsBetter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    } else if (diff < 0) {
        colorClass = higherIsBetter ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    }
    
    const formattedDiff = isCurrency 
        ? formatCurrency(Math.abs(diff)).replace('R$', '').trim()
        : (isPercentage ? `${Math.abs(diff).toFixed(2)}` : formatNumber(Math.abs(diff)));
        
    const formattedPercent = `${Math.abs(percent).toFixed(2)}`;

    return (
        <div>
            <div className="text-sm font-medium">{formattedValue}</div>
            <div className={`text-xs flex items-center ${colorClass}`}>
                {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                <span>
                    {isCurrency && 'R$ '}
                    {formattedDiff}
                    {isPercentage && '%'}
                    &nbsp;({formattedPercent}%)
                </span>
            </div>
        </div>
    );
};


const TableSkeleton: React.FC = () => (
    <>
        {[...Array(5)].map((_, i) => (
            <tr key={i} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                </td>
                {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </td>
                ))}
            </tr>
        ))}
    </>
);

export const CampaignTable: React.FC<CampaignTableProps> = ({ data, isLoading, error }) => {
  const renderTableContent = () => {
    if (isLoading) {
      return <TableSkeleton />;
    }

    if (error) {
      return (
        <tr>
          <td colSpan={8} className="text-center py-10 px-6">
            <p className="text-red-500 font-semibold">Ocorreu um erro ao carregar os dados:</p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 text-sm">{error}</p>
          </td>
        </tr>
      );
    }
    
    if (!data || data.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center py-10 px-6 text-text-secondary-light dark:text-text-secondary-dark">
            Nenhuma campanha encontrada.
          </td>
        </tr>
      );
    }
    
    const calculatedData = data.map(campaign => {
        // Today's metrics
        const ctr_today = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
        const cpc_today = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;

        // Yesterday's metrics
        const spent_yesterday = campaign.spent - (campaign.spentDiff ?? 0);
        const impressions_yesterday = campaign.impressions - (campaign.impressionsDiff ?? 0);
        const clicks_yesterday = campaign.clicks - (campaign.clicksDiff ?? 0);

        const ctr_yesterday = impressions_yesterday > 0 ? (clicks_yesterday / impressions_yesterday) * 100 : 0;
        const cpc_yesterday = clicks_yesterday > 0 ? (spent_yesterday / clicks_yesterday) : 0;

        // Diffs
        const ctrDiff = ctr_today - ctr_yesterday;
        const cpcDiff = cpc_today - cpc_yesterday;

        // Percentages
        const ctrPercent = ctr_yesterday !== 0 ? (ctrDiff / ctr_yesterday) * 100 : undefined;
        const cpcPercent = cpc_yesterday !== 0 ? (cpcDiff / cpc_yesterday) * 100 : undefined;

        return {
            ...campaign,
            ctr: ctr_today,
            cpc: cpc_today,
            ctrDiff,
            cpcDiff,
            ctrPercent,
            cpcPercent,
        };
    });

    return calculatedData.map((campaign) => (
      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{campaign.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <MetricWithChange value={campaign.spent} diff={campaign.spentDiff} percent={campaign.spentPercent} isCurrency higherIsBetter={false} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <MetricWithChange value={campaign.impressions} diff={campaign.impressionsDiff} percent={campaign.impressionsPercent} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <MetricWithChange value={campaign.clicks} diff={campaign.clicksDiff} percent={campaign.clicksPercent} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <MetricWithChange value={campaign.leads} diff={campaign.leadsDiff} percent={campaign.leadsPercent} higherIsBetter={true} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <MetricWithChange value={campaign.ctr} diff={campaign.ctrDiff} percent={campaign.ctrPercent} isPercentage higherIsBetter />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <MetricWithChange value={campaign.cpc} diff={campaign.cpcDiff} percent={campaign.cpcPercent} isCurrency higherIsBetter={false} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <MetricWithChange value={campaign.cpa} diff={campaign.cpaDiff} percent={campaign.cpaPercent} isCurrency higherIsBetter={false} />
        </td>
      </tr>
    ));
  };


  return (
    <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
      <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Detalhes das Campanhas</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              {['Campanha', 'Gasto', 'Impressões', 'Cliques', 'Leads', 'CTR', 'CPC', 'CPA'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {renderTableContent()}
          </tbody>
        </table>
      </div>
    </div>
  );
};