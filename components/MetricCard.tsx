
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
      <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark">{value}</p>
    </div>
  );
};
