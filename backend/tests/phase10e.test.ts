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

describe('PHASE 10E: Real Pharmacy POS Terminal & Checkout APIs Test Suite', () => {
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

  // Auth tokens
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

  const cashierToken = signToken({
    userId: 'usr_cashier_1',
    email: 'cashier@apothecary.com',
    role: 'CASHIER',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const otherOrgCashierToken = signToken({
    userId: 'usr_cashier_other',
    email: 'cashier@otherpharm.com',
    role: 'CASHIER',
    organizationId: 'pharm_other_99',
    branchId: 'br_other_99',
  });

  const customerToken = signToken({
    userId: 'usr_customer',
    email: 'patient@gmail.com',
    role: 'CUSTOMER',
  });

  let createdReceiptId: string;
  let createdReceiptNumber: string;

  // ==========================================
  // 1. AUTHENTICATION & ACCESS CONTROL
  // ==========================================
  describe('1. Authentication & Role Permissions', () => {
    it('POST /api/v1/pos/sales should reject unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 401);
    });

    it('POST /api/v1/pos/sales should reject CUSTOMER role with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 403);
    });

    it('POST /api/v1/pos/sales should prevent Cashier of Org A from executing sale on Org B branch', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(otherOrgCashierToken),
        body: JSON.stringify({
          branchId: 'br_1', // br_1 belongs to pharm_1
          organizationId: 'pharm_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.match(body.message, /Tenant Access Violation|permission/i);
    });

    it('POST /api/v1/pos/sales should prevent Cashier from executing sale on another branch of same org', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_2', // Cashier is assigned to br_1
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.match(body.message, /Branch Access Violation|assigned branch/i);
    });
  });

  // ==========================================
  // 2. INPUT VALIDATION & PAYMENT CHECKS
  // ==========================================
  describe('2. Input Validation & Payment Verification', () => {
    it('POST /api/v1/pos/sales should reject empty items list with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 400);
    });

    it('POST /api/v1/pos/sales should reject non-positive integer quantities with 400', async () => {
      const resZero = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 0 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(resZero.status, 400);

      const resNegative = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: -3 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(resNegative.status, 400);

      const resDecimal = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 2.5 }],
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(resDecimal.status, 400);
    });

    it('POST /api/v1/pos/sales should reject external CARD payment without paymentRef', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CARD',
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Payment Verification Required/i);
    });

    it('POST /api/v1/pos/sales should reject external UPI payment with short paymentRef', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'UPI',
          paymentRef: '12', // too short (< 4 chars)
        }),
      });
      assert.equal(res.status, 400);
    });

    it('POST /api/v1/pos/sales should reject discount exceeding subtotal', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CASH',
          discount: 99999, // Way higher than 1 unit price
        }),
      });
      assert.equal(res.status, 400);
    });
  });

  // ==========================================
  // 3. POS CHECKOUT & STOCK EXECUTION
  // ==========================================
  describe('3. POS Checkout, Server Calculations & Stock Deduction', () => {
    it('POST /api/v1/pos/sales should successfully complete a cash sale with server-authoritative pricing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 2 }],
          paymentMethod: 'CASH',
          customerName: 'Aarav Sharma',
          customerPhone: '+91 98765 43210',
          discount: 5,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.id);
      assert.ok(body.data.receiptNumber);
      assert.equal(body.data.customerName, 'Aarav Sharma');
      assert.equal(body.data.customerPhone, '+91 98765 43210');
      assert.equal(body.data.paymentMethod, 'CASH');
      assert.equal(body.data.discount, 5);

      // Verify line items and server prices
      assert.ok(Array.isArray(body.data.items));
      assert.equal(body.data.items.length, 1);
      const item = body.data.items[0];
      assert.equal(item.medicineId, 'med_1');
      assert.equal(item.quantity, 2);
      assert.ok(item.unitPrice > 0, 'Unit price must be retrieved from inventory');
      assert.equal(item.total, item.unitPrice * 2);
      assert.equal(body.data.subtotal, item.total);
      assert.equal(body.data.total, Math.round((body.data.subtotal - 5) * 100) / 100);

      // Verify payment details
      assert.ok(body.data.payment);
      assert.equal(body.data.payment.amount, body.data.total);
      assert.equal(body.data.payment.status, 'PAID');

      createdReceiptId = body.data.id;
      createdReceiptNumber = body.data.receiptNumber;
    });

    it('POST /api/v1/pos/sales should successfully process verified CARD sale with terminal reference', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'CARD',
          paymentRef: 'POS-TXN-984726-AUTH',
          customerName: 'Sunita Patil',
          idempotencyKey: `card_sale_test_${Date.now()}`,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.paymentMethod, 'CARD');
      assert.equal(body.data.payment.transactionRef, 'POS-TXN-984726-AUTH');
    });

    it('POST /api/v1/pos/sales should reject sale when inventory stock is insufficient', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_2', quantity: 9999 }], // only 8 units in stock
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Insufficient stock/i);
    });

    it('GET /api/v1/inventory/:id/movements should confirm OFFLINE_SALE movement was logged', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/movements`, {
        headers: authHeader(ownerToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      const saleMovements = body.data.filter((m: any) => m.movementType === 'OFFLINE_SALE');
      assert.ok(saleMovements.length > 0, 'Should have logged an OFFLINE_SALE movement');
      assert.ok(saleMovements[0].quantity < 0, 'OFFLINE_SALE quantity must be signed negative');
    });
  });

  // ==========================================
  // 4. DEBOUNCING, IDEMPOTENCY & CONCURRENCY
  // ==========================================
  describe('4. Debouncing, Idempotency & Concurrency Guarantees', () => {
    it('POST /api/v1/pos/sales should reject rapid duplicate clicks within 2 seconds with 409 Conflict', async () => {
      const payload = {
        branchId: 'br_1',
        items: [{ medicineId: 'med_1', quantity: 4 }],
        paymentMethod: 'CASH',
      };

      // First submit
      const res1 = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res1.status, 201);

      // Fast second submit (same items, same branch, same cashier, no idempotency key)
      const res2 = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res2.status, 409);
      const body2 = await res2.json();
      assert.match(body2.message, /Duplicate submission detected/i);
    });

    it('POST /api/v1/pos/sales should return cached receipt without duplicate deduction when idempotencyKey is used', async () => {
      const idempotencyKey = `idemp_pos_test_${Date.now()}`;
      const payload = {
        branchId: 'br_1',
        items: [{ medicineId: 'med_1', quantity: 3 }],
        paymentMethod: 'CASH',
        idempotencyKey,
      };

      // First call
      const res1 = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res1.status, 201);
      const data1 = await res1.json();

      // Second call with same idempotencyKey (even within 2 seconds)
      const res2 = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify(payload),
      });
      assert.ok(res2.status === 200 || res2.status === 201);
      const data2 = await res2.json();

      // Must return identical receipt number and id
      assert.equal(data2.data.id, data1.data.id);
      assert.equal(data2.data.receiptNumber, data1.data.receiptNumber);
      assert.equal(data2.data.total, data1.data.total);
    });

    it('Concurrent sales for limited stock should not result in overselling or negative stock', async () => {
      // med_2 has limited stock
      // Launch concurrent sales of 5 units each with separate idempotency keys
      const concurrentPromises = Array.from({ length: 4 }).map((_, index) =>
        fetch(`${baseUrl}/api/v1/pos/sales`, {
          method: 'POST',
          headers: authHeader(adminToken),
          body: JSON.stringify({
            branchId: 'br_1',
            organizationId: 'pharm_1',
            items: [{ medicineId: 'med_2', quantity: 5 }],
            paymentMethod: 'CASH',
            customerName: `Concurrent Buyer ${index + 1}`,
            idempotencyKey: `concurrent_key_${index}_${Date.now()}`,
          }),
        })
      );

      const results = await Promise.all(concurrentPromises);
      const statuses = results.map((r) => r.status);

      const successCount = statuses.filter((s) => s === 201).length;
      const failureCount = statuses.filter((s) => s === 400 || s === 409).length;

      assert.ok(successCount <= 2, `Oversold! Success count was ${successCount}, exceeding available stock`);
      assert.ok(failureCount > 0, 'At least one request must fail due to stock depletion');
    });
  });

  // ==========================================
  // 5. RECEIPT PRINTING & SALES HISTORY
  // ==========================================
  describe('5. Receipt Retrieval & Sales History Isolation', () => {
    it('GET /api/v1/pos/sales/:id should retrieve complete receipt by sale ID', async () => {
      assert.ok(createdReceiptId);
      const res = await fetch(`${baseUrl}/api/v1/pos/sales/${createdReceiptId}`, {
        headers: authHeader(cashierToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, createdReceiptId);
      assert.equal(body.data.receiptNumber, createdReceiptNumber);
      assert.ok(body.data.items);
      assert.ok(body.data.branch);
      assert.ok(body.data.createdBy);
    });

    it('GET /api/v1/pos/sales/:receiptNumber should retrieve receipt by receipt number', async () => {
      assert.ok(createdReceiptNumber);
      const res = await fetch(`${baseUrl}/api/v1/pos/sales/${createdReceiptNumber}`, {
        headers: authHeader(cashierToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.receiptNumber, createdReceiptNumber);
    });

    it('GET /api/v1/pos/sales/:id should prevent Pharmacy B cashier from accessing Pharmacy A receipt', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales/${createdReceiptId}`, {
        headers: authHeader(otherOrgCashierToken),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.match(body.message, /Access denied|organization/i);
    });

    it('GET /api/v1/pos/sales should return list of sales filtered to permitted branch/organization', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        headers: authHeader(cashierToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);

      // Verify that every sale belongs to pharm_1
      for (const sale of body.data) {
        assert.equal(sale.organizationId, 'pharm_1');
      }
    });

    it('GET /api/v1/pos/sales should search sales by customer name or receipt number', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales?search=Aarav`, {
        headers: authHeader(cashierToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((s: any) => s.customerName.includes('Aarav')));
    });

    it('GET /api/v1/pos/sales/:id should return 404 for non-existent receipt', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales/non_existent_rec_9999`, {
        headers: authHeader(cashierToken),
      });
      assert.equal(res.status, 404);
    });
  });
});
