
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const SimulatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const MetaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 10.174c1.766 -2.784 3.315 -4.174 4.648 -4.174c2.026 0 3.288 1.653 3.288 4.299c0 2.122 -1.275 3.7 -3.288 3.7c-1.766 0 -3.4 -1.569 -4.648 -2.714c-1.248 1.145 -2.882 2.714 -4.648 2.714c-2.013 0 -3.288 -1.578 -3.288 -3.7c0 -2.646 1.275 -4.299 3.288 -4.299c1.333 0 2.882 1.39 4.648 4.174z"></path>
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8"></path>
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5"></path>
  </svg>
);

const WarningBanner = () => (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg flex items-start">
        <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        </div>
        <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Funcionalidade em Desenvolvimento (Beta)
            </h3>
            <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                <p>
                    Este simulador utiliza algoritmos preditivos experimentais. Os resultados são estimativas baseadas no histórico da conta e benchmarks de mercado, não garantias de performance futura.
                </p>
            </div>
        </div>
    </div>
);

type Platform = 'meta' | 'google' | 'tiktok';

export const ScenarioSimulator: React.FC = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('meta');
    const [budgetMultiplier, setBudgetMultiplier] = useState(1.0); // 1.0 = 100%
    const [cpcMultiplier, setCpcMultiplier] = useState(1.0);

    // Base stats Mock based on Platform
    const baseStatsMap = {
        meta: { budget: 15000, cpc: 2.50, conversions: 450, ctr: 1.8, name: 'Meta Ads' },
        google: { budget: 22000, cpc: 4.10, conversions: 580, ctr: 3.2, name: 'Google Ads' },
        tiktok: { budget: 9000, cpc: 1.80, conversions: 310, ctr: 1.1, name: 'TikTok Ads' }
    };

    const baseStats = baseStatsMap[selectedPlatform];

    // Simulation Logic
    const simulatedData = useMemo(() => {
        const newBudget = baseStats.budget * budgetMultiplier;
        const newCpc = baseStats.cpc * cpcMultiplier;
        
        // Diminishing returns logic: 
        // If budget doubles (2.0), exposure doesn't exactly double due to audience saturation (power of 0.85).
        // If CPC increases, we win more auctions, improving quality but costing more.
        
        const saturationFactor = Math.pow(budgetMultiplier, 0.85); 
        const bidCompetitiveness = Math.pow(cpcMultiplier, 1.2); // Higher bid = better slots
        
        const projectedClicks = (newBudget / newCpc) * bidCompetitiveness;
        const projectedConversions = Math.floor((baseStats.conversions / baseStats.budget * baseStats.cpc) * projectedClicks * 0.95); // Slight efficiency loss
        
        const projectedCpa = newBudget / projectedConversions;
        const projectedRoas = (projectedConversions * 150) / newBudget; // Assuming ticket medio R$ 150

        // Chart Data Generation
        const data = [];
        const days = 30;
        for (let i = 0; i < days; i++) {
            const progress = i / days;
            // Linear to curve interpolation
            const currentCurve = (baseStats.conversions / days) * (1 + (Math.random() * 0.2 - 0.1));
            const simCurve = (projectedConversions / days) * (1 + (Math.random() * 0.2 - 0.1));
            
            // Ease-in simulation
            const mixedCurve = currentCurve + (simCurve - currentCurve) * progress;

            data.push({
                day: `Dia ${i + 1}`,
                atual: Math.floor(currentCurve),
                simulado: Math.floor(mixedCurve),
            });
        }

        return {
            newBudget,
            newCpc,
            projectedConversions,
            projectedCpa,
            projectedRoas,
            chartData: data
        };
    }, [budgetMultiplier, cpcMultiplier, baseStats]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <SimulatorIcon />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Simulador de Cenários</h2>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">What-If Machine: Projete o futuro baseado em ajustes estratégicos.</p>
                </div>
            </div>

            <WarningBanner />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
                        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 border-b border-border-light dark:border-border-dark pb-2">Parâmetros de Entrada</h3>
                        
                        {/* Budget Slider */}
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Orçamento Mensal</label>
                                <span className={`text-sm font-bold ${budgetMultiplier > 1 ? 'text-green-600' : budgetMultiplier < 1 ? 'text-red-500' : 'text-text-primary-light'}`}>
                                    {budgetMultiplier > 1 && '+'}
                                    {Math.round((budgetMultiplier - 1) * 100)}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="3.0" 
                                step="0.1" 
                                value={budgetMultiplier} 
                                onChange={(e) => setBudgetMultiplier(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-light"
                            />
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>R$ {baseStats.budget/2}</span>
                                <span className="font-bold text-primary-light">{formatCurrency(simulatedData.newBudget)}</span>
                                <span>R$ {baseStats.budget*3}</span>
                            </div>
                        </div>

                        {/* CPC/Bid Slider */}
                        <div className="mb-6">
                             <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Agressividade do Lance (CPC)</label>
                                <span className={`text-sm font-bold ${cpcMultiplier > 1 ? 'text-amber-600' : cpcMultiplier < 1 ? 'text-green-600' : 'text-text-primary-light'}`}>
                                    {cpcMultiplier > 1 && '+'}
                                    {Math.round((cpcMultiplier - 1) * 100)}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="2.0" 
                                step="0.1" 
                                value={cpcMultiplier} 
                                onChange={(e) => setCpcMultiplier(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                            />
                             <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>Conservador</span>
                                <span className="font-bold text-primary-light">{formatCurrency(simulatedData.newCpc)}</span>
                                <span>Agressivo</span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-sm text-indigo-800 dark:text-indigo-200">
                            <p><strong>Insight IA:</strong> {budgetMultiplier > 1.5 
                                ? "Atenção: Aumentos drásticos de verba podem elevar o CPA devido à necessidade de alcançar públicos mais frios." 
                                : budgetMultiplier < 0.8 
                                    ? "Reduzir a verba drasticamente pode fazer o algoritmo perder aprendizado, reduzindo a eficiência."
                                    : "Ajustes moderados tendem a manter o CPA estável enquanto escalam o volume."}
                            </p>
                        </div>
                    </div>

                    {/* Account Selection Container */}
                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
                         <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 border-b border-border-light dark:border-border-dark pb-2">Conta de Simulação</h3>
                         <div className="space-y-3">
                            <button 
                                onClick={() => setSelectedPlatform('meta')}
                                className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 ${
                                    selectedPlatform === 'meta' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${selectedPlatform === 'meta' ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                                    <MetaIcon />
                                </div>
                                <div className="ml-3 text-left">
                                    <p className={`text-sm font-bold ${selectedPlatform === 'meta' ? 'text-blue-700 dark:text-blue-300' : 'text-text-primary-light dark:text-text-primary-dark'}`}>Meta Ads</p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Conta Principal</p>
                                </div>
                                {selectedPlatform === 'meta' && <div className="ml-auto text-blue-500">●</div>}
                            </button>

                            <button 
                                onClick={() => setSelectedPlatform('google')}
                                className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 ${
                                    selectedPlatform === 'google' 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500' 
                                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${selectedPlatform === 'google' ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                                    <GoogleIcon />
                                </div>
                                <div className="ml-3 text-left">
                                    <p className={`text-sm font-bold ${selectedPlatform === 'google' ? 'text-red-700 dark:text-red-300' : 'text-text-primary-light dark:text-text-primary-dark'}`}>Google Ads</p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Search & Display</p>
                                </div>
                                {selectedPlatform === 'google' && <div className="ml-auto text-red-500">●</div>}
                            </button>

                            <button 
                                onClick={() => setSelectedPlatform('tiktok')}
                                className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 ${
                                    selectedPlatform === 'tiktok' 
                                    ? 'border-gray-900 dark:border-gray-400 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-900 dark:ring-gray-400' 
                                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${selectedPlatform === 'tiktok' ? 'bg-gray-800 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                                    <TikTokIcon />
                                </div>
                                <div className="ml-3 text-left">
                                    <p className={`text-sm font-bold ${selectedPlatform === 'tiktok' ? 'text-gray-900 dark:text-white' : 'text-text-primary-light dark:text-text-primary-dark'}`}>TikTok Ads</p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Conta Viral</p>
                                </div>
                                {selectedPlatform === 'tiktok' && <div className="ml-auto text-gray-900 dark:text-white">●</div>}
                            </button>
                         </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8 space-y-6">
                     {/* Metric Cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">Conversões Estimadas</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{simulatedData.projectedConversions}</span>
                                <span className={`text-xs font-bold ${simulatedData.projectedConversions >= baseStats.conversions ? 'text-green-500' : 'text-red-500'}`}>
                                    {simulatedData.projectedConversions >= baseStats.conversions ? '▲' : '▼'} 
                                    {Math.abs(Math.round(((simulatedData.projectedConversions - baseStats.conversions) / baseStats.conversions) * 100))}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Base Atual ({baseStats.name}): {baseStats.conversions}</p>
                        </div>

                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">CPA Projetado</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{formatCurrency(simulatedData.projectedCpa)}</span>
                                 <span className={`text-xs font-bold ${simulatedData.projectedCpa <= (baseStats.budget/baseStats.conversions) ? 'text-green-500' : 'text-red-500'}`}>
                                    {simulatedData.projectedCpa > (baseStats.budget/baseStats.conversions) ? '▲' : '▼'} 
                                    {Math.abs(Math.round(((simulatedData.projectedCpa - (baseStats.budget/baseStats.conversions)) / (baseStats.budget/baseStats.conversions)) * 100))}%
                                </span>
                            </div>
                             <p className="text-xs text-gray-400 mt-1">Base Atual: {formatCurrency(baseStats.budget/baseStats.conversions)}</p>
                        </div>

                         <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">ROAS Esperado</p>
                             <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{simulatedData.projectedRoas.toFixed(2)}x</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Meta Mínima: 4.0x</p>
                        </div>
                     </div>

                    {/* Chart */}
                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm h-[350px] flex flex-col">
                        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">Projeção de Volume (30 Dias) - {baseStats.name}</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={simulatedData.chartData}>
                                    <defs>
                                        <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid-stroke)" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'var(--color-card-background)',
                                            borderColor: 'var(--color-card-border)',
                                            color: 'var(--color-text-primary)',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="atual" 
                                        stroke="#94a3b8" 
                                        fillOpacity={1} 
                                        fill="url(#colorAtual)" 
                                        name="Cenário Atual"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="simulado" 
                                        stroke="#4f46e5" 
                                        strokeDasharray="5 5"
                                        fillOpacity={1} 
                                        fill="url(#colorSim)" 
                                        name="Simulação"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
