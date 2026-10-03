import React, { TableHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
    <table className={twMerge(clsx('w-full text-left text-sm text-gray-700', className))} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={twMerge(clsx('bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200', className))} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={twMerge(clsx('divide-y divide-gray-100 bg-white', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => (
  <tr className={twMerge(clsx('hover:bg-gray-50/80 transition-colors', className))} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={twMerge(clsx('px-4 py-3.5 font-semibold text-gray-700', className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={twMerge(clsx('px-4 py-3.5 align-middle text-gray-800 font-normal', className))} {...props}>
    {children}
  </th>
);
