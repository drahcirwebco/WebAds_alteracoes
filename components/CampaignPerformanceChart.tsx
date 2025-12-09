import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types';

interface CampaignPerformanceChartProps {
  data: ChartDataPoint[];
}

export const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({ data }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark h-full">
      <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Desempenho ao Longo do Tempo</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid-stroke)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card-background)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-primary)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{fontSize: "14px", color: 'var(--color-text-secondary)'}}/>
            <Line 
                type="monotone" 
                dataKey="clicks" 
                name="Cliques" 
                stroke="#4f46e5" 
                activeDot={{ r: 8 }} 
                label={{ 
                    position: 'top', 
                    fill: '#4f46e5', 
                    fontSize: 12, 
                    fontWeight: 500,
                    dy: -5 
                }}
            />
            <Line 
                type="monotone" 
                dataKey="leads" 
                name="Leads" 
                stroke="#22c55e" 
                label={{ 
                    position: 'top', 
                    fill: '#22c55e', 
                    fontSize: 12, 
                    fontWeight: 500,
                    dy: -5 
                }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};