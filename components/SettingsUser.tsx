
import React from 'react';

export const SettingsUser: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-white text-3xl font-bold">
            WA
          </div>
          <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Admin User</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">admin@webads.com.br</p>
          <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold rounded-full">
            Administrador
          </span>
        </div>
      </div>

      {/* Formulário de Edição */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark border-b border-border-light dark:border-border-dark pb-2">
          Informações Pessoais
        </h3>
        
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Nome Completo</label>
            <input 
              type="text" 
              defaultValue="Admin User" 
              className="w-full p-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Cargo / Função</label>
            <input 
              type="text" 
              defaultValue="Head de Performance" 
              className="w-full p-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">E-mail</label>
            <input 
              type="email" 
              defaultValue="admin@webads.com.br" 
              className="w-full p-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Telefone</label>
            <input 
              type="tel" 
              defaultValue="+55 (11) 99999-9999" 
              className="w-full p-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary-light outline-none transition-all"
            />
          </div>
        </form>

        <div className="mt-8 flex justify-end gap-3">
            <button className="px-4 py-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                Cancelar
            </button>
            <button className="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-sm transition-colors">
                Salvar Alterações
            </button>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark border-b border-border-light dark:border-border-dark pb-2">
          Segurança
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">Alterar Senha</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Recomendamos alterar sua senha periodicamente.</p>
            </div>
            <button className="px-4 py-2 border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Redefinir Senha
            </button>
        </div>
      </div>
    </div>
  );
};
