import React, { TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  density?: 'compact' | 'comfortable';
}

export const Table: React.FC<TableProps> = ({ className, density = 'comfortable', children, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-gray-200/90 shadow-2xs">
    <table
      className={twMerge(
        clsx(
          'w-full text-left font-sans text-gray-700',
          density === 'compact' ? 'text-xs' : 'text-sm',
          className
        )
      )}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={twMerge(clsx('bg-gray-50/90 text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200', className))} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={twMerge(clsx('divide-y divide-gray-100 bg-white', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => (
  <tr className={twMerge(clsx('hover:bg-gray-50/70 transition-colors duration-150', className))} {...props}>
    {children}
  </tr>
);

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  density?: 'compact' | 'comfortable';
}

export const TableHead: React.FC<TableHeadProps> = ({ className, density = 'comfortable', children, ...props }) => (
  <th
    className={twMerge(
      clsx(
        'font-semibold text-gray-700 select-none',
        density === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3.5 text-xs',
        className
      )
    )}
    {...props}
  >
    {children}
  </th>
);

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  density?: 'compact' | 'comfortable';
}

export const TableCell: React.FC<TableCellProps> = ({ className, density = 'comfortable', children, ...props }) => (
  <td
    className={twMerge(
      clsx(
        'align-middle text-gray-800 font-normal',
        density === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3.5 text-sm',
        className
      )
    )}
    {...props}
  >
    {children}
  </td>
);
