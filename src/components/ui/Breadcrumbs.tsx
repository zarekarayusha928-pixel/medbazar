import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-2" aria-label="Breadcrumb">
      <Link to="/" aria-label="Home" className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
        <Home className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
            {isLast || !item.href ? (
              <span className="font-medium text-gray-800" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-brand-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
