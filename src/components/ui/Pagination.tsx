import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-sand-200 rounded-b-lg text-center sm:text-left" aria-label="Pagination Navigation">
      <div className="text-xs text-gray-600">
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <span>
            Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium text-gray-900">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium text-gray-900">{totalItems}</span> results
          </span>
        ) : (
          <span>
            Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
            <span className="font-medium text-gray-900">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
          leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
          rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
