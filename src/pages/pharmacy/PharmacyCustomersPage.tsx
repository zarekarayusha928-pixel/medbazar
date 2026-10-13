import React, { useState } from 'react';
import { Search, Users, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '@/services/api/mockData';

export const PharmacyCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');

  // Expand customers with order counts and last order from MOCK_ORDERS
  const customerList = [
    {
      id: 'cust_1',
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      ordersCount: 8,
      lastOrder: '2026-10-12 (MB-2026-8801)',
      status: 'ACTIVE' as const
    },
    {
      id: 'cust_2',
      name: 'Priya Verma',
      phone: '+91 97654 32109',
      ordersCount: 5,
      lastOrder: '2026-10-03 (MB-2026-8803)',
      status: 'ACTIVE' as const
    },
    {
      id: 'cust_3',
      name: 'Anita Desai',
      phone: '+91 98221 44332',
      ordersCount: 3,
      lastOrder: '2026-10-13 (MB-2026-8804)',
      status: 'ACTIVE' as const
    },
    {
      id: 'cust_4',
      name: 'Sunil Joshi',
      phone: '+91 98901 22334',
      ordersCount: 1,
      lastOrder: '2026-09-15 (MB-2026-8740)',
      status: 'INACTIVE' as const
    }
  ];

  const filtered = customerList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-4 font-sans text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Customer Registry
            </h1>
            <span className="font-mono text-[11px] bg-sand-200 text-gray-700 px-2 py-0.5 rounded border border-sand-300">
              {filtered.length} patients
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered patients, chronic refill histories, and contact records
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-sand-300 rounded-md p-3 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-sand-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-pine-700"
          />
        </div>
      </div>

      {/* Table: Customer, Phone, Orders, Last Order, Status */}
      <div className="bg-white border border-sand-300 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-sand-50/80">
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Orders</th>
                <th className="py-2.5 px-3">Last Order</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 font-sans">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-sand-50/50 transition-colors">
                  {/* Customer */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-gray-900 block">{c.name}</span>
                    <span className="font-mono text-[10px] text-gray-400">ID #{c.id}</span>
                  </td>

                  {/* Phone */}
                  <td className="py-2.5 px-3 font-mono text-gray-700">
                    {c.phone}
                  </td>

                  {/* Orders */}
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                    {c.ordersCount} orders
                  </td>

                  {/* Last Order */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                    {c.lastOrder}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {c.status === 'ACTIVE' ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Inactive</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
