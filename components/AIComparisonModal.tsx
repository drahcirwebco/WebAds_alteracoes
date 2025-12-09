import React from 'react';

declare var marked: {
  parse(markdown: string): string;
};

interface AIComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  content: string;
  period1: string;
  period2: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark"></div>
        <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Analisando e comparando períodos...</p>
    </div>
);

export const AIComparisonModal: React.FC<AIComparisonModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  content,
  period1,
  period2,
}) => {
  if (!isOpen) return null;

  const htmlContent = content ? marked.parse(content) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">Análise Comparativa de Período</h2>
          <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          { (period1 && period2) &&
            <div className="mb-4 text-center">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Comparando <span className="font-bold text-primary-light dark:text-primary-dark">{period1}</span> com <span className="font-bold text-primary-light dark:text-primary-dark">{period2}</span></p>
            </div>
          }
          <div className="min-h-[400px]">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!isLoading && content && (
                <div className="prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </div>
        </div>
        <div className="p-4 border-t border-border-light dark:border-border-dark text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-text-primary-light dark:text-text-primary-dark font-bold py-2 px-4 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
