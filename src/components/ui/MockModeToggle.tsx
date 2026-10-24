import React, { useState, useEffect } from 'react';
import { isMockMode, setMockMode } from '@/services/api/client';
import { Database, Server, RefreshCw } from 'lucide-react';

export interface MockModeToggleProps {
  className?: string;
  showApiUrl?: boolean;
}

export const MockModeToggle: React.FC<MockModeToggleProps> = ({ className = '', showApiUrl = false }) => {
  const [mock, setMock] = useState<boolean>(isMockMode());
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail !== undefined) {
        setMock(customEvent.detail.enabled);
      } else {
        setMock(isMockMode());
      }
    };

    window.addEventListener('medbazar:mock-mode-changed', handleModeChange);
    return () => window.removeEventListener('medbazar:mock-mode-changed', handleModeChange);
  }, []);

  const handleToggle = () => {
    const nextMode = !mock;
    setMock(nextMode);
    setMockMode(nextMode);
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        title={mock ? 'Switch to Real REST API mode' : 'Switch to Mock Data mode'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all shadow-sm border ${
          mock
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
        }`}
      >
        {mock ? (
          <>
            <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>MOCK MODE</span>
          </>
        ) : (
          <>
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>REAL API MODE</span>
          </>
        )}
        <RefreshCw className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showApiUrl && (
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline" title="Current API endpoint">
          {mock ? 'Simulated latency & storage' : `Endpoint: ${apiUrl}`}
        </span>
      )}
    </div>
  );
};
