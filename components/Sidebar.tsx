

import React, { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
}> = ({ icon, label, active, collapsed, onClick, hasSubmenu, isSubmenuOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors duration-200 group relative ${
      active
        ? 'bg-primary-light text-white dark:bg-primary-dark'
        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-slate-800'
    }`}
    title={collapsed ? label : undefined}
  >
    <div className={`flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-primary-light dark:group-hover:text-primary-dark'}`}>
      {icon}
    </div>
    <span
      className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 text-left ${
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
      }`}
    >
      {label}
    </span>
    {hasSubmenu && !collapsed && (
       <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
       </svg>
    )}
  </button>
);

const SidebarSubItem: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full pl-11 pr-3 py-2 text-sm text-left rounded-lg transition-colors duration-200 mb-1 ${
            active 
            ? 'text-primary-light dark:text-primary-dark font-medium bg-indigo-50 dark:bg-slate-800/50' 
            : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-50 dark:hover:bg-slate-800/30'
        }`}
    >
        {label}
    </button>
);

// Logo Component reflecting the CW design
const LogoCW: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stylized C - Light Blue */}
    <path d="M82 30 A 40 40 0 1 0 82 70" stroke="#0ea5e9" strokeWidth="12" strokeLinecap="round" />
    {/* Stylized W - Dark Blue (Light in dark mode) - Slightly larger and centered in C */}
    <path d="M32 40 L 41 62 L 48 48 L 55 62 L 64 40" className="stroke-indigo-900 dark:stroke-white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MetaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 10.174c1.766 -2.784 3.315 -4.174 4.648 -4.174c2.026 0 3.288 1.653 3.288 4.299c0 2.122 -1.275 3.7 -3.288 3.7c-1.766 0 -3.4 -1.569 -4.648 -2.714c-1.248 1.145 -2.882 2.714 -4.648 2.714c-2.013 0 -3.288 -1.578 -3.288 -3.7c0 -2.646 1.275 -4.299 3.288 -4.299c1.333 0 2.882 1.39 4.648 4.174z"></path>
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8"></path>
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5"></path>
  </svg>
);

const SiteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
);

const SimulatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setCurrentView }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Ensure settings menu opens if a settings view is active and sidebar is open
    useEffect(() => {
        if (currentView.startsWith('settings-') && isOpen) {
            setIsSettingsOpen(true);
        }
    }, [currentView, isOpen]);

    const handleSettingsClick = () => {
        if (!isOpen) {
            setIsOpen(true);
            setIsSettingsOpen(true);
        } else {
            setIsSettingsOpen(!isSettingsOpen);
        }
    };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark transition-all duration-300 flex flex-col h-screen sticky top-0 z-20 shadow-lg`}
    >
      {/* Logo / Title Area */}
      <div className="h-16 flex items-center justify-center border-b border-border-light dark:border-border-dark overflow-hidden">
         <div className="flex items-center justify-center gap-3 px-4">
            <LogoCW className="h-10 w-10 flex-shrink-0" />
            <span className={`font-bold text-primary-light dark:text-text-primary-dark text-xl whitespace-nowrap transition-all duration-300 ${
              isOpen ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 hidden'
            }`}>
              WebAds
            </span>
         </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
        <SidebarItem
          icon={<HomeIcon />}
          label="Visão Geral"
          active={currentView === 'principal'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('principal')}
        />
        <SidebarItem
          icon={<MetaIcon />}
          label="Meta Ads"
          active={currentView === 'meta'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('meta')}
        />
        <SidebarItem
          icon={<GoogleIcon />}
          label="Google Ads"
          active={currentView === 'google'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('google')}
        />
        <SidebarItem
          icon={<TikTokIcon />}
          label="TikTok Ads"
          active={currentView === 'tiktok'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('tiktok')}
        />
        <SidebarItem
          icon={<SiteIcon />}
          label="Site"
          active={currentView === 'site'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('site')}
        />
        <SidebarItem
          icon={<SimulatorIcon />}
          label="Simulador IA"
          active={currentView === 'simulator'}
          collapsed={!isOpen}
          onClick={() => setCurrentView('simulator')}
        />

        <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark">
             <SidebarItem
                icon={<SettingsIcon />}
                label="Configurações"
                active={currentView.startsWith('settings')}
                collapsed={!isOpen}
                onClick={handleSettingsClick}
                hasSubmenu={true}
                isSubmenuOpen={isSettingsOpen}
            />
            
            {/* Submenu Animation/Logic - Increased max-h to accommodate 3 items */}
            <div className={`overflow-hidden transition-all duration-300 ${isSettingsOpen && isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <SidebarSubItem 
                    label="Usuário" 
                    active={currentView === 'settings-user'} 
                    onClick={() => setCurrentView('settings-user')} 
                />
                <SidebarSubItem 
                    label="Parametrização" 
                    active={currentView === 'settings-params'} 
                    onClick={() => setCurrentView('settings-params')} 
                />
                <SidebarSubItem 
                    label="Integrações" 
                    active={currentView === 'settings-integrations'} 
                    onClick={() => setCurrentView('settings-integrations')} 
                />
            </div>
        </div>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
    </aside>
  );
};
