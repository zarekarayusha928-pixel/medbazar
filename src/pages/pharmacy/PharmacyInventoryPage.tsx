import React, { useState } from 'react';
import { Package, Search, Plus, Edit2, AlertTriangle, ArrowUpDown, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_INVENTORY } from '@/services/api/mockData';
import { Inventory } from '@/types';

export const PharmacyInventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [inventory, setInventory] = useState<Inventory[]>(MOCK_INVENTORY);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock Audit Correction');

  const filtered = inventory.filter(i => 
    i.medicine?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.medicine?.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveAdjustment = () => {
    if (!editingItem) return;
    const updated = inventory.map(item => {
      if (item.id === editingItem.id) {
        const q = Number(adjustQty);
        return {
          ...item,
          quantity: q,
          status: (q === 0 ? 'OUT_OF_STOCK' : q <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK') as any
        };
      }
      return item;
    });

    setInventory(updated);
    showToast('Inventory Updated', `Adjusted stock for ${editingItem.medicine?.name} to ${adjustQty} units. Logged in stock movements.`, 'success');
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Inventory Management</h1>
          <p className="text-xs text-gray-500 mt-1">Single source of truth stock for Pune Station Branch</p>
        </div>

        <div className="flex items-center gap-2">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Add Stock Batch</Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search stock by medicine or brand..." />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine Product</TableHead>
            <TableHead>Batch Number</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Min Level</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-bold text-gray-900">
                {item.medicine?.name}
                <span className="text-gray-400 block text-[10px] font-normal">{item.medicine?.brand}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">{item.batches?.[0]?.batchNumber || 'BCH-2025-091'}</TableCell>
              <TableCell className="font-mono text-xs">{item.batches?.[0]?.expiryDate || '2027-08-31'}</TableCell>
              <TableCell className="font-extrabold text-gray-900 text-sm">{item.quantity} units</TableCell>
              <TableCell className="text-gray-500 text-xs">{item.reorderLevel} units</TableCell>
              <TableCell className="font-bold text-brand-700">₹{item.sellingPrice.toFixed(2)}</TableCell>
              <TableCell>
                {item.status === 'IN_STOCK' && <Badge variant="success" dot>In Stock</Badge>}
                {item.status === 'LOW_STOCK' && <Badge variant="warning" dot>Low Stock Warning</Badge>}
                {item.status === 'OUT_OF_STOCK' && <Badge variant="danger" dot>Out of Stock</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setEditingItem(item);
                    setAdjustQty(item.quantity);
                  }}
                >
                  Adjust
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Adjust Modal */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title={`Adjust Stock: ${editingItem.medicine?.name}`}
          size="md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveAdjustment}>Save Stock Adjustment</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="New Quantity Count"
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              helperText={`Previous count was ${editingItem.quantity} units`}
            />

            <Input
              label="Reason for Adjustment"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Stock Audit, Damaged Unit, Supplier Return"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
