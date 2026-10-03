import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading pharmacy data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};
