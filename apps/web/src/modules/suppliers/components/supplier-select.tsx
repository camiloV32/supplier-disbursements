import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchSuppliers } from '../api/suppliers.api';
import type { Supplier } from '../types/supplier.type';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

type SupplierSelectProps = {
  label: string;
  value: Supplier | null;
  onChange: (supplier: Supplier) => void;
  error?: string;
};

export function SupplierSelect({
  label,
  value,
  onChange,
  error,
}: SupplierSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const { data: suppliers, isFetching } = useQuery({
    queryKey: ['suppliers', 'search', debouncedQuery],
    queryFn: () => searchSuppliers(debouncedQuery),
    enabled: isOpen,
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
          autoComplete="off"
          placeholder="Buscar por nombre o NIT..."
          value={isOpen ? query : (value?.name ?? '')}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          onChange={(event) => setQuery(event.target.value)}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/30 ${
            error
              ? 'border-status-rejected focus:border-status-rejected'
              : 'border-slate-300 focus:border-primary-500'
          }`}
        />

        {isOpen && (
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-surface shadow-lg"
          >
            {isFetching && (
              <li className="px-3.5 py-2 text-sm text-slate-400">
                Buscando...
              </li>
            )}

            {!isFetching && (suppliers?.length ?? 0) === 0 && (
              <li className="px-3.5 py-2 text-sm text-slate-400">
                Sin resultados
              </li>
            )}

            {suppliers?.map((supplier) => (
              <li key={supplier.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value?.id === supplier.id}
                  onClick={() => {
                    onChange(supplier);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full flex-col items-start px-3.5 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">
                    {supplier.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {supplier.taxId}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-status-rejected">{error}</p>}
    </div>
  );
}
