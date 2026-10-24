import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center border-2 border-dashed border-sand-300 rounded-lg bg-sand-50/60 my-4">
      <div className="rounded-full bg-white p-3 shadow-sm border border-sand-200 text-gray-400 mb-3 shrink-0">
        {icon || <PackageOpen className="w-8 h-8 text-brand-600" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4 sm:mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
