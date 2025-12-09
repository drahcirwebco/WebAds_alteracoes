import React, { useState, useRef, useEffect } from 'react';

interface CampaignFilterProps {
  // Array of campaign objects with id and name
  campaigns: { id: string; name:string }[];
  // Array of selected campaign IDs
  selectedCampaignIds: string[];
  // Callback function when selection changes
  onSelectionChange: (selectedIds: string[]) => void;
  // Prop to disable the filter, e.g., while data is loading
  disabled: boolean;
}

export const CampaignFilter: React.FC<CampaignFilterProps> = ({ campaigns, selectedCampaignIds, onSelectionChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Effect to close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Handler for individual checkbox changes
  const handleCheckboxChange = (campaignId: string) => {
    const newSelection = selectedCampaignIds.includes(campaignId)
      ? selectedCampaignIds.filter(id => id !== campaignId)
      : [...selectedCampaignIds, campaignId];
    onSelectionChange(newSelection);
  };
  
  // Handler for the "Select/Deselect All" option
  const handleSelectAll = () => {
    if (selectedCampaignIds.length === campaigns.length) {
      onSelectionChange([]); // Deselect all
    } else {
      onSelectionChange(campaigns.map(c => c.id)); // Select all
    }
  };
  
  const allSelected = selectedCampaignIds.length > 0 && selectedCampaignIds.length === campaigns.length;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="bg-card-light dark:bg-card-dark p-2 rounded-lg shadow-md border border-border-light dark:border-border-dark flex items-center justify-between w-60 h-[52px] disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
      >
        <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-left">
          {selectedCampaignIds.length === 0 ? 'Todas as Campanhas' : `${selectedCampaignIds.length} campanha(s)`}
        </span>
        <svg className={`w-5 h-5 ml-2 transition-transform text-text-secondary-light dark:text-text-secondary-dark ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-60 bg-card-light dark:bg-card-dark rounded-md shadow-lg border border-border-light dark:border-border-dark max-h-60 overflow-y-auto">
          <ul className="py-1">
             <li className="px-3 py-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center" onClick={handleSelectAll}>
                <input
                    type="checkbox"
                    checked={allSelected}
                    readOnly
                    className="mr-2 h-4 w-4 text-primary-light rounded"
                />
                <span>{allSelected ? 'Desmarcar Todas' : 'Selecionar Todas'}</span>
            </li>
            {campaigns.map(campaign => (
              <li key={campaign.id} className="px-3 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center" onClick={() => handleCheckboxChange(campaign.id)}>
                <input
                  type="checkbox"
                  checked={selectedCampaignIds.includes(campaign.id)}
                  onChange={() => {}} // The li's onClick handles the logic
                  className="mr-2 h-4 w-4 text-primary-light rounded"
                />
                <span className="truncate">{campaign.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
