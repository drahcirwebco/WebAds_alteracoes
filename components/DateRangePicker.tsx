import React, { useState } from 'react';

interface DateRangePickerProps {
  onFilter: (startDate: string, endDate: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onFilter }) => {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const defaultStartDate = sevenDaysAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);

  const handleFilterClick = () => {
    if (startDate && endDate) {
      onFilter(startDate, endDate);
    }
  };

  return (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md border border-border-light dark:border-border-dark flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="start-date" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">De:</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md p-2 text-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="end-date" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Até:</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md p-2 text-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        />
      </div>
      <button
        onClick={handleFilterClick}
        className="bg-primary-light hover:bg-indigo-700 dark:bg-primary-dark dark:hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
      >
        Filtrar
      </button>
    </div>
  );
};
