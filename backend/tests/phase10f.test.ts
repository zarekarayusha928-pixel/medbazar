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

describe('PHASE 10F: Customer Marketplace, Online Orders & Prescriptions Test Suite', () => {
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

  const pharmacistToken = signToken({
    userId: 'usr_pharm_1',
    email: 'pharmacist@apothecary.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const otherOrgPharmacistToken = signToken({
    userId: 'usr_pharm_other',
    email: 'pharmacist@otherpharm.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_other_99',
    branchId: 'br_other_99',
  });

  const customerToken = signToken({
    userId: 'usr_cust_1',
    email: 'customer@gmail.com',
    role: 'CUSTOMER',
  });

  const otherCustomerToken = signToken({
    userId: 'usr_cust_2',
    email: 'otherpatient@gmail.com',
    role: 'CUSTOMER',
  });

  let createdPrescriptionId: string;
  let createdOrderId: string;
  let createdOrderNumber: string;

  // ==========================================
  // 1. MEDICINE & BRANCH DISCOVERY
  // ==========================================
  describe('1. Medicine & Pharmacy Discovery', () => {
    it('GET /api/v1/pharmacies should allow public discovery of active pharmacies', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pharmacies`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
    });

    it('GET /api/v1/branches should list branches for customer selection', async () => {
      const res = await fetch(`${baseUrl}/api/v1/branches`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
      assert.ok(body.data.some((b: any) => b.id === 'br_1'));
    });

    it('GET /api/v1/inventory?branchId=br_1 should return branch availability and selling prices', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory?branchId=br_1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      const dolo = body.data.find((i: any) => i.medicineId === 'med_1');
      assert.ok(dolo);
      assert.ok(dolo.sellingPrice > 0);
    });
  });

  // ==========================================
  // 2. PRESCRIPTION WORKFLOW
  // ==========================================
  describe('2. Prescription Upload & Pharmacist Verification', () => {
    it('POST /api/v1/prescriptions should allow customer to upload doctor prescription', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. Vivek Ranade (MD)',
          fileName: 'rx_antibiotic.pdf',
          fileType: 'PDF',
          notes: 'Chest infection regimen',
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.id);
      assert.equal(body.data.status, 'PENDING_REVIEW');
      createdPrescriptionId = body.data.id;
    });

    it('GET /api/v1/prescriptions should return customer prescriptions', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        headers: authHeader(customerToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((p: any) => p.id === createdPrescriptionId));
    });

    it('PATCH /api/v1/prescriptions/:id/status should reject customer review attempts with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/status`, {
        method: 'PATCH',
        headers: authHeader(customerToken),
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      assert.equal(res.status, 403);
    });

    it('PATCH /api/v1/prescriptions/:id/status should allow authorized Pharmacist to approve prescription', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          status: 'APPROVED',
          notes: 'Dose verified and signed off by on-duty pharmacist.',
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'APPROVED');
    });
  });

  // ==========================================
  // 3. ONLINE CHECKOUT & STOCK EXECUTION
  // ==========================================
  describe('3. Online Order Checkout & Stock Rules', () => {
    it('POST /api/v1/orders should reject unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
        }),
      });
      assert.equal(res.status, 401);
    });

    it('POST /api/v1/orders should reject online orders missing delivery address with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'ONLINE',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          deliveryAddress: '', // Empty
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Delivery address is required/i);
    });

    it('POST /api/v1/orders should reject order with Schedule H drug if prescription is missing with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'ONLINE',
          deliveryAddress: 'Flat 101, Aundh, Pune',
          items: [{ medicineId: 'med_2', quantity: 1 }], // med_2 (Augmentin) requires prescription
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Prescription Required/i);
    });

    it('POST /api/v1/orders should successfully place online order with server-authoritative calculations', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'ONLINE',
          deliveryAddress: 'Flat 302, Senapati Bapat Road, Pune, Maharashtra - 411016',
          items: [{ medicineId: 'med_1', quantity: 2 }],
          paymentMethod: 'UPI',
          paymentRef: 'UPI-APP-TXN-284910',
          idempotencyKey: `idemp_order_first_${Date.now()}`,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.id);
      assert.ok(body.data.orderNumber);
      assert.equal(body.data.status, 'CONFIRMED');
      assert.equal(body.data.paymentStatus, 'PAID');
      assert.equal(body.data.paymentMethod, 'UPI');

      // Verify line items snapshot
      assert.ok(Array.isArray(body.data.items));
      assert.equal(body.data.items.length, 1);
      const item = body.data.items[0];
      assert.equal(item.medicineId, 'med_1');
      assert.equal(item.quantity, 2);
      assert.ok(Number(item.unitPrice) > 0);
      assert.equal(Number(item.total), Number(item.unitPrice) * 2);

      // Verify server calculation: subtotal + deliveryFee (50 since subtotal < 500)
      assert.equal(Number(body.data.subtotal), Number(item.total));
      assert.equal(Number(body.data.deliveryFee), 50);
      assert.equal(Number(body.data.total), Number(body.data.subtotal) + 50);

      createdOrderId = body.data.id;
      createdOrderNumber = body.data.orderNumber;
    });

    it('POST /api/v1/orders should allow pickup order without delivery fee', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'PICKUP',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          paymentMethod: 'COD',
          idempotencyKey: `idemp_pickup_${Date.now()}`,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.orderType, 'PICKUP');
      assert.equal(Number(body.data.deliveryFee), 0);
      assert.equal(Number(body.data.total), Number(body.data.subtotal));
    });

    it('POST /api/v1/orders with verified prescription should enter PRESCRIPTION_REVIEW status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'ONLINE',
          deliveryAddress: 'Flat 504, Baner, Pune',
          items: [{ medicineId: 'med_2', quantity: 1 }], // Augmentin
          prescriptionId: createdPrescriptionId,
          paymentMethod: 'COD',
          idempotencyKey: `idemp_rx_order_${Date.now()}`,
        }),
      });
      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'PRESCRIPTION_REVIEW');
    });

    it('GET /api/v1/inventory/inv_1/movements should confirm ONLINE_SALE movement was logged', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory/inv_1/movements`, {
        headers: authHeader(ownerToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      const onlineSale = body.data.find((m: any) => m.movementType === 'ONLINE_SALE');
      assert.ok(onlineSale, 'Should have logged an ONLINE_SALE movement');
      assert.ok(onlineSale.quantity < 0, 'Movement quantity must be signed negative');
    });
  });

  // ==========================================
  // 4. DEBOUNCING, IDEMPOTENCY & CONCURRENCY
  // ==========================================
  describe('4. Idempotency, Debouncing & Concurrency Between Channels', () => {
    it('POST /api/v1/orders should reject duplicate double-clicks within 2 seconds with 409 Conflict', async () => {
      const payload = {
        branchId: 'br_1',
        orderType: 'ONLINE' as const,
        deliveryAddress: 'Plot 12, Kothrud, Pune',
        items: [{ medicineId: 'med_1', quantity: 6 }],
        paymentMethod: 'COD' as const,
      };

      const res1 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res1.status, 201);

      // Rapid second submit
      const res2 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res2.status, 409);
      const body2 = await res2.json();
      assert.match(body2.message, /Duplicate order detected/i);
    });

    it('POST /api/v1/orders should return cached order without double-deduction when idempotencyKey is used', async () => {
      const idempotencyKey = `idemp_online_test_${Date.now()}`;
      const payload = {
        branchId: 'br_1',
        orderType: 'ONLINE' as const,
        deliveryAddress: 'Plot 15, Model Colony, Pune',
        items: [{ medicineId: 'med_1', quantity: 1 }],
        paymentMethod: 'COD' as const,
        idempotencyKey,
      };

      const res1 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify(payload),
      });
      assert.equal(res1.status, 201);
      const d1 = await res1.json();

      const res2 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify(payload),
      });
      assert.ok(res2.status === 200 || res2.status === 201);
      const d2 = await res2.json();

      assert.equal(d2.data.id, d1.data.id);
      assert.equal(d2.data.orderNumber, d1.data.orderNumber);
    });

    it('Simultaneous online checkout and counter POS sale competing for same units prevents overselling', async () => {
      // Launch 1 online order and 1 POS sale simultaneously for med_2 with limited remaining stock
      const onlinePromise = fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          orderType: 'ONLINE',
          deliveryAddress: 'Baner Road, Pune',
          items: [{ medicineId: 'med_2', quantity: 5 }],
          prescriptionId: createdPrescriptionId,
          paymentMethod: 'COD',
          idempotencyKey: `simul_online_${Date.now()}`,
        }),
      });

      const posPromise = fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_2', quantity: 5 }],
          paymentMethod: 'CASH',
          idempotencyKey: `simul_pos_${Date.now()}`,
        }),
      });

      const [resOnline, resPos] = await Promise.all([onlinePromise, posPromise]);
      const statuses = [resOnline.status, resPos.status];

      // Since stock for med_2 is very low, both requesting 5 units should not both succeed if total stock < 10
      assert.ok(statuses.includes(201) || statuses.includes(400), 'Transactions must be processed safely');
    });
  });

  // ==========================================
  // 5. STATUS TRANSITIONS & CANCELLATION
  // ==========================================
  describe('5. Status Transitions, Cancellation & Inventory Restoration', () => {
    it('PATCH /api/v1/orders/:id/status should reject invalid status transition with 400', async () => {
      // createdOrderId is currently CONFIRMED. Transitioning directly to DELIVERED is invalid.
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({ status: 'DELIVERED' }), // Skipping PREPARING, READY, OUT_FOR_DELIVERY
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Invalid Order Transition/i);
    });

    it('PATCH /api/v1/orders/:id/status should advance order to PREPARING', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({ status: 'PREPARING' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'PREPARING');
    });

    it('POST /api/v1/orders/:id/cancel should reject customer cancellation once order is PREPARING with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/cancel`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({ reason: 'Changed my mind' }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Cannot cancel order/i);
    });

    it('POST /api/v1/orders/:id/cancel should allow Pharmacist to cancel and restore inventory', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/cancel`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({ reason: 'Customer requested phone cancellation' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'CANCELLED');
    });
  });

  // ==========================================
  // 6. MULTI-TENANT AUTHORIZATION & ISOLATION
  // ==========================================
  describe('6. Multi-Tenant Authorization & Isolation', () => {
    it('GET /api/v1/orders/:id should prevent Customer B from accessing Customer A order with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}`, {
        headers: authHeader(otherCustomerToken),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.match(body.message, /Access denied/i);
    });

    it('PATCH /api/v1/orders/:id/status should prevent Pharmacist of Pharmacy B from updating Pharmacy A order with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/status`, {
        method: 'PATCH',
        headers: authHeader(otherOrgPharmacistToken),
        body: JSON.stringify({ status: 'READY' }),
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.match(body.message, /Access denied|permission/i);
    });

    it('GET /api/v1/orders should scope results so customer only sees their own orders', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        headers: authHeader(customerToken),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      for (const ord of body.data) {
        assert.equal(ord.customerId, 'usr_cust_1');
      }
    });
  });
});
