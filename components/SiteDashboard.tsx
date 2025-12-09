
import React from 'react';

export const SiteDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">Site Dashboard</h3>
        <div className="text-text-secondary-light dark:text-text-secondary-dark">
          <p className="mb-4">O dashboard de análise de website foi removido pois utilizava dados mockados.</p>
          <p className="mb-4">Para ativar a visualização de dados reais de website, integre com:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Google Analytics API:</strong> Para dados de tráfego, usuários e conversões</li>
            <li><strong>Supabase:</strong> Para armazenar métricas de website</li>
            <li><strong>APIs de terceiros:</strong> Mapas de calor, heatmaps, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
