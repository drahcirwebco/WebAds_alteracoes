
import React from 'react';

export const SettingsParams: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
          Parâmetros Globais
        </h3>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Defina as configurações padrão para o cálculo de métricas e alertas no dashboard.
        </p>

        <div className="space-y-6">
            {/* Alertas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Limite de CPA Crítico (R$)</label>
                    <div className="flex items-center">
                        <span className="bg-gray-100 dark:bg-slate-800 border border-r-0 border-border-light dark:border-border-dark rounded-l-md px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark">R$</span>
                        <input 
                        type="number" 
                        defaultValue="40.00" 
                        className="w-full p-2 rounded-r-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none"
                        />
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Valores acima deste limite gerarão um alerta vermelho.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Meta de ROAS Mínimo</label>
                    <input 
                        type="number" 
                        step="0.1"
                        defaultValue="4.0" 
                        className="w-full p-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none"
                    />
                </div>
            </div>

            <div className="border-t border-border-light dark:border-border-dark my-4"></div>

            {/* Preferências de Visualização */}
            <div>
                <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-4">Preferências de Visualização</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Modo Escuro Automático</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Sincronizar com as configurações do sistema operacional.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Notificações de IA</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Receber sugestões proativas do Chatbot.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button className="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-sm transition-colors">
                Salvar Parâmetros
            </button>
        </div>
      </div>
    </div>
  );
};
