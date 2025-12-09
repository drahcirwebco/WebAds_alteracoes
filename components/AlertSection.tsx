
import React, { useMemo } from 'react';
import type { Campaign } from '../types';

interface AlertSectionProps {
  campaigns: Campaign[];
}

interface AlertItem {
  campaignName: string;
  platform: string;
  metric: string;
  value: string;
  message: string;
  type: 'critical' | 'warning';
}

const AlertIcon: React.FC<{ type: 'critical' | 'warning' }> = ({ type }) => {
  if (type === 'critical') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export const AlertSection: React.FC<AlertSectionProps> = ({ campaigns }) => {
  const alerts = useMemo(() => {
    const items: AlertItem[] = [];

    campaigns.forEach(campaign => {
      // Lógica para PERIGO (Critical)
      // Exemplo: CPA acima de R$ 40,00 ou Queda de Conversões > 50%
      if (campaign.cpa > 40) {
        items.push({
          campaignName: campaign.name,
          platform: campaign.platform || 'N/A',
          metric: 'CPA Alto',
          value: `R$ ${campaign.cpa.toFixed(2)}`,
          message: 'O custo por aquisição está acima do limite de segurança. Verifique a segmentação.',
          type: 'critical'
        });
      }

      if (campaign.conversionsPercent && campaign.conversionsPercent < -20) {
        items.push({
          campaignName: campaign.name,
          platform: campaign.platform || 'N/A',
          metric: 'Queda em Conversões',
          value: `${campaign.conversionsPercent.toFixed(1)}%`,
          message: 'Queda brusca no volume de conversões comparado ao período anterior.',
          type: 'critical'
        });
      }

      // Lógica para ATENÇÃO (Warning)
      // Exemplo: CTR abaixo de 1% ou CPA subiu mais de 10%
      const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      
      if (ctr < 1.0 && campaign.status !== 'Pausada') {
        items.push({
          campaignName: campaign.name,
          platform: campaign.platform || 'N/A',
          metric: 'CTR Baixo',
          value: `${ctr.toFixed(2)}%`,
          message: 'Anúncios com baixa atratividade. Considere revisar os criativos.',
          type: 'warning'
        });
      }

      if (campaign.cpaPercent && campaign.cpaPercent > 10 && campaign.cpa <= 40) {
         items.push({
          campaignName: campaign.name,
          platform: campaign.platform || 'N/A',
          metric: 'CPA em Alta',
          value: `+${campaign.cpaPercent.toFixed(1)}%`,
          message: 'Tendência de encarecimento da aquisição.',
          type: 'warning'
        });
      }
    });

    return items.sort((a, b) => (a.type === 'critical' ? -1 : 1));
  }, [campaigns]);

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 flex items-center gap-4">
        <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Tudo Operando Normalmente</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">Nenhuma distorção significativa detectada nas campanhas ativas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Card de Perigo */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-red-100 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertIcon type="critical" />
            <h3 className="font-bold text-red-800 dark:text-red-200">Pontos de Perigo ({criticalAlerts.length})</h3>
        </div>
        <div className="p-4 space-y-3">
            {criticalAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum problema crítico detectado.</p>
            ) : (
                criticalAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-white dark:bg-card-dark p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{alert.platform}</span>
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">{alert.metric}: {alert.value}</span>
                        </div>
                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">{alert.campaignName}</h4>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{alert.message}</p>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Card de Atenção */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-6 py-4 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
            <AlertIcon type="warning" />
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Pontos de Atenção ({warningAlerts.length})</h3>
        </div>
         <div className="p-4 space-y-3">
            {warningAlerts.length === 0 ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum ponto de atenção detectado.</p>
            ) : (
                warningAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-white dark:bg-card-dark p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                        <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{alert.platform}</span>
                             <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">{alert.metric}: {alert.value}</span>
                        </div>
                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">{alert.campaignName}</h4>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{alert.message}</p>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
