process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';

let server: http.Server;
let baseUrl: string;

function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

describe('PHASE 10D: Pharmacy Management & Inventory APIs Test Suite', () => {
  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      (server as any).closeAllConnections?.();
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  // Test Tokens
  const adminToken = signToken({
    userId: 'usr_admin',
    email: 'admin@medbazar.com',
    role: 'PLATFORM_ADMIN',
  });

  const ownerToken = signToken({
    userId: 'usr_owner_1',
    email: 'owner@apothecary.com',
    role: 'PHARMACY_OWNER',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const pharmacistToken = signToken({
    userId: 'usr_pharm_1',
    email: 'pharmacist@apothecary.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const customerToken = signToken({
    userId: 'usr_cust_1',
    email: 'customer@gmail.com',
    role: 'CUSTOMER',
  });

  // ==========================================
  // 1. MEDICINES & CATEGORIES
  // ==========================================
  describe('1. Medicines & Categories Catalog', () => {
    it('GET /api/v1/medicines/categories should list medicine categories', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines/categories`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
      assert.ok(body.data.some((c: any) => c.name === 'Pain Relief'));
    });

    it('POST /api/v1/medicines/categories should allow Pharmacy Owner to create category', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines/categories`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          name: 'Dermatology & Skin Care',
          description: 'Topical creams, ointments and skincare solutions',
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, 'Dermatology & Skin Care');
    });

    it('GET /api/v1/medicines should search and filter medicines by query and rx requirement', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines?query=Dolo&rx=false`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((m: any) => m.name.includes('Dolo')));
    });

    it('GET /api/v1/medicines/:id should return single medicine details with category', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines/med_1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, 'med_1');
      assert.equal(body.data.genericName, 'Paracetamol');
    });

    it('POST /api/v1/medicines should forbid Customer from adding medicines to global catalog', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          name: 'Rogue Med',
          genericName: 'Unknown',
          brand: 'BlackMarket',
          composition: 'Unknown 100mg',
          dosageForm: 'TABLET',
          strength: '100mg',
          categoryId: 'cat_pain',
          manufacturer: 'Unknown Corp',
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });

    it('POST /api/v1/medicines should allow authorized Admin/Owner to add medicine', async () => {
      const res = await fetch(`${baseUrl}/api/v1/medicines`, {
        method: 'POST',
        headers: authHeader(adminToken),
        body: JSON.stringify({
          name: 'Pantocid 40mg Tablet',
          genericName: 'Pantoprazole',
          brand: 'Sun Pharma',
          composition: 'Pantoprazole 40mg Gastro-resistant',
          dosageForm: 'TABLET',
          strength: '40mg',
          categoryId: 'cat_pain',
          prescriptionRequired: false,
          manufacturer: 'Sun Pharmaceutical Industries Ltd',
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, 'Pantocid 40mg Tablet');
    });
  });

  // ==========================================
  // 2. INVENTORY & BATCH OPERATIONS
  // ==========================================
  describe('2. Branch Inventory & Batch Management', () => {
    it('GET /api/v1/inventory should list branch inventory with stock status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory?branchId=br_1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
    });

    it('GET /api/v1/inventory?lowStock=true should filter items under reorder level', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory?lowStock=true`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.every((inv: any) => inv.status === 'LOW_STOCK' || inv.status === 'OUT_OF_STOCK'));
    });

    it('GET /api/v1/inventory?expiringSoon=true should filter items with approaching batch expiries', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory?expiringSoon=true`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.length > 0);
      assert.ok(body.data.some((inv: any) => inv.id === 'inv_2')); // inv_2 batch expires in 25 days
    });

    it('POST /api/v1/inventory/:id/adjust should safely adjust stock and update status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/adjust`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          newQuantity: 145,
          reason: 'Physical inventory cycle count reconciliation',
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.quantity, 145);
      assert.equal(body.data.status, 'IN_STOCK');
    });

    it('POST /api/v1/inventory/:id/adjust should reject negative quantity with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/adjust`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          newQuantity: -10,
          reason: 'Erroneous negative adjustment',
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
    });

    it('POST /api/v1/inventory/:id/batches should ingest batch and increment quantity', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/batches`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          batchNumber: 'DL-2027-Z9',
          expiryDate: '2027-12-31',
          quantity: 50,
          purchasePrice: 24.5,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      // Previous was 145 + 50 = 195
      assert.equal(body.data.quantity, 195);
    });

    it('GET /api/v1/inventory/:id/movements should list audit stock movement history', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/movements`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
    });
  });

  // ==========================================
  // 3. ATOMIC BRANCH TRANSFERS
  // ==========================================
  describe('3. Atomic Branch-to-Branch Transfers', () => {
    it('POST /api/v1/inventory/transfer should execute atomic transfer between branches', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'br_2',
          medicineId: 'med_1',
          quantity: 20,
          notes: 'Emergency transfer for urgent dispensary demand',
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.transferredQuantity, 20);
      assert.equal(body.data.sourceRemainingQuantity, 175); // 195 - 20
    });

    it('POST /api/v1/inventory/transfer should reject transfer to identical branch with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'br_1',
          medicineId: 'med_1',
          quantity: 10,
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
    });

    it('POST /api/v1/inventory/transfer should reject transfer exceeding available source stock', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'br_2',
          medicineId: 'med_1',
          quantity: 99999, // Exceeds stock
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.ok(body.message.includes('Insufficient stock'));
    });
  });

  // ==========================================
  // 4. SUPPLIERS & PURCHASE ORDERS
  // ==========================================
  describe('4. Suppliers & Purchase Order Ingestion', () => {
    let createdPoId: string;

    it('GET /api/v1/suppliers should list authorized distributors', async () => {
      const res = await fetch(`${baseUrl}/api/v1/suppliers?organizationId=pharm_1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((s: any) => s.name.includes('Cipla')));
    });

    it('POST /api/v1/suppliers should create a new pharmaceutical distributor', async () => {
      const res = await fetch(`${baseUrl}/api/v1/suppliers`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          name: 'Zydus Lifesciences Wholesale Depot',
          contactPerson: 'Mr. Rajesh Verma',
          phone: '+91 98980 11223',
          email: 'depot@zydus-wholesale.com',
          address: 'GIDC Industrial Estate, Vatva',
          gstNumber: '24AAACZ1234F1Z3',
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, 'Zydus Lifesciences Wholesale Depot');
    });

    it('POST /api/v1/purchases should create new purchase order in PENDING status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/purchases`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          supplierName: 'Cipla Wholesale Distributors Pvt Ltd',
          items: [
            {
              medicineId: 'med_1',
              batchNumber: 'CIP-2027-A1',
              expiryDate: '2027-11-30',
              quantity: 200,
              unitPrice: 21.0,
            },
          ],
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'PENDING');
      createdPoId = body.data.id;
    });

    it('POST /api/v1/purchases/:id/receive should ingest stock into inventory and set status to RECEIVED', async () => {
      const res = await fetch(`${baseUrl}/api/v1/purchases/${createdPoId}/receive`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'RECEIVED');
    });

    it('STRICT IDEMPOTENCY: Repeated POST /api/v1/purchases/:id/receive must be rejected to prevent duplicate stock ingestion', async () => {
      // Repeat the exact same receive request
      const res = await fetch(`${baseUrl}/api/v1/purchases/${createdPoId}/receive`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(body.message.includes('already been received'));
    });
  });

  // ==========================================
  // 5. BRANCHES & MULTI-TENANT ISOLATION
  // ==========================================
  describe('5. Branches & Multi-Tenant Isolation', () => {
    it('GET /api/v1/branches should list branches for authorized organization', async () => {
      const res = await fetch(`${baseUrl}/api/v1/branches?organizationId=pharm_1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
    });

    it('POST /api/v1/branches should allow Pharmacy Owner to create branch under their organization', async () => {
      const res = await fetch(`${baseUrl}/api/v1/branches`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          name: 'Apothecary Kalyani Nagar Dispensary',
          address: 'Shop 9, Central Avenue, Kalyani Nagar',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411006',
          phone: '+91 98221 00333',
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, 'Apothecary Kalyani Nagar Dispensary');
    });

    it('PUT /api/v1/branches/:id should update branch details for permitted owner', async () => {
      const res = await fetch(`${baseUrl}/api/v1/branches/br_1`, {
        method: 'PUT',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          operatingHours: '07:30 AM - 11:30 PM',
          phone: '+91 98221 99999',
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.operatingHours, '07:30 AM - 11:30 PM');
    });

    it('PUT /api/v1/branches/:id should prevent owner from modifying branch of another pharmacy', async () => {
      const otherOwnerToken = signToken({
        userId: 'usr_owner_2',
        email: 'owner2@medcure.com',
        role: 'PHARMACY_OWNER',
        organizationId: 'pharm_2_other',
        branchId: 'br_other_1',
      });

      const res = await fetch(`${baseUrl}/api/v1/branches/br_1`, {
        method: 'PUT',
        headers: authHeader(otherOwnerToken),
        body: JSON.stringify({
          phone: '+91 99999 99999',
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });
  });

  // ==========================================
  // 6. CRITICAL STOCK RULES & AUTHORIZATION
  // ==========================================
  describe('6. Critical Stock Rules & Authorization Guards', () => {
    it('POST /api/v1/inventory/:id/adjust should forbid Customer role with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/adjust`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          newQuantity: 50,
          reason: 'Unauthorized adjustment attempt',
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });

    it('POST /api/v1/inventory/transfer should forbid Customer role with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'br_2',
          medicineId: 'med_1',
          quantity: 10,
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });

    it('POST /api/v1/inventory/:id/batches should reject negative or zero quantity with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/batches`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          batchNumber: 'BAD-BATCH',
          expiryDate: '2028-01-01',
          quantity: -5,
          purchasePrice: 10,
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
    });

    it('POST /api/v1/inventory/transfer should reject negative quantity with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'br_2',
          medicineId: 'med_1',
          quantity: -10,
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
    });

    it('POST /api/v1/inventory/transfer should reject cross-organization transfer with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/transfer`, {
        method: 'POST',
        headers: authHeader(ownerToken),
        body: JSON.stringify({
          sourceBranchId: 'br_1',
          destinationBranchId: 'other_pharmacy_branch',
          medicineId: 'med_1',
          quantity: 5,
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });
  });
});

