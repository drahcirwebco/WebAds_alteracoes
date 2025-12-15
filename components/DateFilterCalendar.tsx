import React, { useState, useMemo, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';

interface DateFilterCalendarProps {
  availableDates: string[];
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  label: string;
}

export const DateFilterCalendar: React.FC<DateFilterCalendarProps> = ({
  availableDates,
  selectedDate,
  onDateChange,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Processar e validar datas disponíveis
  const availableDateObjects = useMemo(() => {
    console.log('availableDates recebidas:', availableDates);
    if (availableDates.length > 0) {
      console.log('Primeira data recebida:', availableDates[0], 'tipo:', typeof availableDates[0]);
    }
    
    const processed = availableDates
      .filter(dateStr => dateStr && typeof dateStr === 'string')
      .map(dateStr => {
        let date: Date | null = null;
        let originalStr = dateStr.trim();
        let displayStr = originalStr; // Para exibição no calendário
        
        console.log(`Processando data: "${originalStr}"`);
        
        // Esperamos formato ISO (yyyy-MM-dd)
        if (/^\d{4}-\d{2}-\d{2}$/.test(originalStr)) {
          console.log(`  ✓ Formato ISO detectado`);
          date = new Date(originalStr + 'T00:00:00');
          // Converter para display em pt-BR
          displayStr = new Date(originalStr + 'T00:00:00').toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(originalStr)) {
          console.log(`  ✓ Formato pt-BR detectado`);
          // Se vier em pt-BR, converte para ISO internamente
          const [day, month, year] = originalStr.split('/');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          displayStr = originalStr;
          originalStr = `${year}-${month}-${day}`; // Normaliza para ISO
        } else {
          console.log(`  ✗ Formato não reconhecido: "${originalStr}"`);
        }
        
        if (date && !isNaN(date.getTime())) {
          console.log(`  ✓ Data processada com sucesso`);
          return { date, originalStr, displayStr };
        }
        console.log(`  ✗ Data inválida`);
        return null;
      })
      .filter((item): item is { date: Date; originalStr: string; displayStr: string } => item !== null);
    
    console.log('Datas processadas com sucesso:', processed.length, processed.map(p => p.displayStr));
    return processed;
  }, [availableDates]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate || availableDateObjects.length === 0) return null;
    
    return availableDateObjects.find(item => item.originalStr === selectedDate)?.date || null;
  }, [selectedDate, availableDateObjects]);

  const selectedDateDisplay = useMemo(() => {
    if (!selectedDate || availableDateObjects.length === 0) return null;
    
    return availableDateObjects.find(item => item.originalStr === selectedDate)?.displayStr || null;
  }, [selectedDate, availableDateObjects]);

  const handleDateSelect = (date: Date | null) => {
    if (!date || availableDateObjects.length === 0) {
      onDateChange(null);
      setIsOpen(false);
      return;
    }

    // Encontrar a data exata que foi selecionada
    const matching = availableDateObjects.find(
      item => item.date.getTime() === date.getTime()
    );

    if (matching) {
      // Se clicar na mesma data já selecionada, limpar
      if (selectedDate === matching.originalStr) {
        console.log('Data desmarcada:', matching.originalStr);
        onDateChange(null);
      } else {
        console.log('Data selecionada:', matching.originalStr);
        onDateChange(matching.originalStr);
      }
      setIsOpen(false);
    }
  };

  if (availableDateObjects.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
        <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          {label}
        </label>
        <span className="text-sm text-yellow-600 dark:text-yellow-300">Nenhuma data disponível</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex items-center gap-3 p-4 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
      <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
        {label}
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-primary-light dark:border-primary-dark rounded-lg bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 transition-opacity font-medium"
        >
          {selectedDateDisplay || 'Selecionar data'}
          <span className="ml-2">📅</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-3 datepicker-container">
            <DatePicker
              selected={selectedDateObj}
              onChange={handleDateSelect}
              filterDate={(date) =>
                availableDateObjects.some(
                  item => item.date.getTime() === date.getTime()
                )
              }
              includeDates={availableDateObjects.map(item => item.date)}
              inline
              locale={ptBR}
              dateFormat="dd/MM/yyyy"
              calendarClassName="custom-datepicker"
              shouldCloseOnSelect={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
