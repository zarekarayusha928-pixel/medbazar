import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-red-50/50 border border-red-200/80 rounded-lg my-4" role="alert">
      <AlertOctagon className="w-8 h-8 text-red-600 mb-2 shrink-0" aria-hidden="true" />
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-red-700 max-w-md">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="border-red-300 text-red-800 hover:bg-red-100">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
