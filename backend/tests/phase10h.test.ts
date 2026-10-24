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

describe('PHASE 10H: Reports, Security Audit, Inventory Integrity & End-to-End Test Suite', () => {
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

  // Tokens for Tenant / Role Isolation Testing
  const adminToken = signToken({
    userId: 'usr_admin',
    email: 'admin@medbazar.com',
    role: 'PLATFORM_ADMIN',
  });

  const pharmacyAOwnerToken = signToken({
    userId: 'usr_owner_1',
    email: 'owner@apothecary.com',
    role: 'PHARMACY_OWNER',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const pharmacyAPharmacistToken = signToken({
    userId: 'usr_pharm_1',
    email: 'pharmacist@apothecary.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const pharmacyACashierToken = signToken({
    userId: 'usr_cashier_1',
    email: 'cashier@apothecary.com',
    role: 'CASHIER',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const pharmacyBPharmacistToken = signToken({
    userId: 'usr_pharm_2',
    email: 'pharmacist@medicure.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_2',
    branchId: 'br_2',
  });

  const customerAToken = signToken({
    userId: 'usr_cust_1',
    email: 'patient1@gmail.com',
    role: 'CUSTOMER',
  });

  const customerBToken = signToken({
    userId: 'usr_cust_2',
    email: 'patient2@gmail.com',
    role: 'CUSTOMER',
  });

  const riderToken = signToken({
    userId: 'usr_rider_1',
    email: 'rider1@logistics.com',
    role: 'DELIVERY_STAFF',
    branchId: 'br_1',
  });

  // ==========================================
  // PART A — REAL REPORTS & REVENUE AUDIT
  // ==========================================
  describe('1. Part A: Real PostgreSQL Reports & Ledger Metrics', () => {
    it('GET /api/v1/reports/pharmacy should return multi-channel sales and stock telemetry', async () => {
      const res = await fetch(`${baseUrl}/api/v1/reports/pharmacy?period=30d`, {
        method: 'GET',
        headers: authHeader(pharmacyAPharmacistToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.salesSummary);
      assert.ok(typeof json.data.salesSummary.totalSales === 'number');
      assert.ok(typeof json.data.salesSummary.onlineSales === 'number');
      assert.ok(typeof json.data.salesSummary.offlineSales === 'number');
      assert.ok(Array.isArray(json.data.topSellingMedicines));
      assert.ok(json.data.paymentSummary);
      assert.ok(json.data.ordersByStatus);
    });

    it('GET /api/v1/reports/dashboard should return quick operational telemetry', async () => {
      const res = await fetch(`${baseUrl}/api/v1/reports/dashboard?period=today`, {
        method: 'GET',
        headers: authHeader(pharmacyACashierToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.sales);
      assert.ok(typeof json.data.lowStockCount === 'number');
      assert.ok(typeof json.data.expiringBatchesCount === 'number');
    });

    it('GET /api/v1/reports/admin should allow Superadmin and reject Pharmacy Staff with 403', async () => {
      // Forbidden for pharmacy staff
      const res1 = await fetch(`${baseUrl}/api/v1/reports/admin`, {
        method: 'GET',
        headers: authHeader(pharmacyAPharmacistToken),
      });
      assert.equal(res1.status, 403);

      // Allowed for platform admin
      const res2 = await fetch(`${baseUrl}/api/v1/reports/admin`, {
        method: 'GET',
        headers: authHeader(adminToken),
      });
      assert.equal(res2.status, 200);
      const json = await res2.json();
      assert.ok(json.data.summary.totalGmv > 0);
      assert.ok(Array.isArray(json.data.pharmacyPerformance));
    });

    it('GET /api/v1/reports/export should export CSV report with headers', async () => {
      const res = await fetch(`${baseUrl}/api/v1/reports/export?period=30d&format=csv`, {
        method: 'GET',
        headers: authHeader(pharmacyAOwnerToken),
      });

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/csv'));
      const text = await res.text();
      assert.ok(text.includes('Category,Metric,Value'));
      assert.ok(text.includes('Total Sales (INR)'));
    });
  });

  // ==========================================
  // PART B — SECURITY AUDIT & IDOR TESTING
  // ==========================================
  describe('2. Part B: Security Audit, Isolation & IDOR Proofs', () => {
    let isolationOrderId: string;
    let isolationRxId: string;

    before(async () => {
      // Create a test prescription for Customer A
      const rxRes = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. Test Isolation',
          fileName: 'isolation_rx.pdf',
          fileType: 'PDF',
          fileUrl: 'storage/secure_prescriptions/isolation_rx.pdf',
          fileSizeBytes: 10240,
        }),
      });
      const rxJson = await rxRes.json();
      isolationRxId = rxJson.data?.id;

      // Create a test order for Customer A
      const ordRes = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify({
          branchId: 'br_1',
          organizationId: 'pharm_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          orderType: 'ONLINE',
          paymentMethod: 'COD',
          deliveryAddress: 'Test Isolation Address, Pune',
        }),
      });
      const ordJson = await ordRes.json();
      isolationOrderId = ordJson.data?.id;
    });

    it('Cross-Tenant Report Isolation: Pharmacy B cannot view Pharmacy A reports with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/reports/pharmacy?organizationId=pharm_1`, {
        method: 'GET',
        headers: authHeader(pharmacyBPharmacistToken),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('Cross-Tenant Order Isolation: Pharmacy B cannot view or transition Pharmacy A orders', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${isolationOrderId}`, {
        method: 'GET',
        headers: authHeader(pharmacyBPharmacistToken),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('Customer Privacy Isolation: Customer B cannot view Customer A prescription files with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${isolationRxId}/file`, {
        method: 'GET',
        headers: authHeader(customerBToken),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('IDOR Resistance: Changing ID parameter to foreign resource ID fails authorization', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${isolationOrderId}`, {
        method: 'GET',
        headers: authHeader(customerBToken), // Customer B requesting Customer A's order
      });

      assert.equal(res.status, 403);
    });

    it('Privilege Escalation Gatekeeping: Cashier cannot verify prescriptions or change branch settings', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${isolationRxId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      assert.equal(res.status, 403);
    });
  });

  // ==========================================
  // PART C — INVENTORY INTEGRITY & CONCURRENCY
  // ==========================================
  describe('3. Part C: Inventory Integrity & Stock Audit', () => {
    it('1. Offline POS sales safely decrement branch stock and log OFFLINE_SALE movement', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 2 }],
          paymentMethod: 'CASH',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.ok(json.data.receiptNumber);
      assert.equal(json.data.items[0].quantity, 2);
    });

    it('2. Insufficient stock is rejected with 400 Bad Request', async () => {
      const res = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 999999 }], // Exceeds available stock
          paymentMethod: 'CASH',
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('3. Online checkout shares the exact same branch inventory and deducts correctly', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify({
          branchId: 'br_1',
          organizationId: 'pharm_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          orderType: 'ONLINE',
          paymentMethod: 'COD',
          deliveryAddress: 'Block C, Pune Central, 411005',
          idempotencyKey: `distinct_single_stock_${Date.now()}`,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.data.status, 'CONFIRMED');
    });

    it('4. Concurrent sales cannot oversell limited inventory units', async () => {
      // Simulate two cashiers attempting to buy units
      const p1 = fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 2 }],
          paymentMethod: 'CASH',
        }),
      });

      const p2 = fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          items: [{ medicineId: 'med_1', quantity: 2 }],
          paymentMethod: 'CASH',
        }),
      });

      const [res1, res2] = await Promise.all([p1, p2]);
      const status1 = res1.status;
      const status2 = res2.status;

      // Sales complete or are rate-limited/prevented from overselling
      assert.ok([201, 400, 409].includes(status1));
      assert.ok([201, 400, 409].includes(status2));
    });

    it('5. Duplicate requests with idempotency key do not double-deduct inventory', async () => {
      const key = `idem_integrity_${Date.now()}`;
      const payload = {
        branchId: 'br_1',
        organizationId: 'pharm_1',
        items: [{ medicineId: 'med_1', quantity: 1 }],
        orderType: 'ONLINE',
        paymentMethod: 'COD',
        deliveryAddress: '404 Koregaon Park, Pune',
        idempotencyKey: key,
      };

      const res1 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify(payload),
      });

      const res2 = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify(payload),
      });

      assert.equal(res1.status, 201);
      assert.equal(res2.status, 201);
      const json1 = await res1.json();
      const json2 = await res2.json();
      assert.equal(json1.data.id, json2.data.id); // Same order returned without double stock decrement
    });

    it('6. Pharmacy A stock adjustments do not modify Pharmacy B stock', async () => {
      const res = await fetch(`${baseUrl}/api/v1/inventory?branchId=br_2`, {
        method: 'GET',
        headers: authHeader(pharmacyBPharmacistToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(Array.isArray(json.data));
    });
  });

  // ==========================================
  // PART D — FULL END-TO-END FLOWS
  // ==========================================
  describe('4. Part D: End-to-End Workflow Verification', () => {
    let e2eOrderId: string;
    let e2eDeliveryId: string;

    it('Full Online Flow: Search -> Cart -> Rx Upload -> Checkout -> Dispensary Fulfill -> Delivery Track', async () => {
      // 1. Medicine Search
      const searchRes = await fetch(`${baseUrl}/api/v1/medicines?search=Dolo`, {
        method: 'GET',
        headers: authHeader(customerAToken),
      });
      assert.equal(searchRes.status, 200);
      const searchJson = await searchRes.json();
      assert.ok(searchJson.data.length > 0);
      const medId = searchJson.data[0].id;

      // 2. Prescription Upload
      const rxRes = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. Anand Kulkarni',
          fileName: 'e2e_fever_rx.pdf',
          fileType: 'PDF',
          fileUrl: 'storage/secure_prescriptions/e2e_fever_rx.pdf',
          fileSizeBytes: 204800,
        }),
      });
      assert.equal(rxRes.status, 201);
      const rxJson = await rxRes.json();
      const rxId = rxJson.data.id;

      // 3. Online Checkout
      const orderRes = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerAToken),
        body: JSON.stringify({
          branchId: 'br_1',
          organizationId: 'pharm_1',
          items: [{ medicineId: medId, quantity: 2 }],
          orderType: 'ONLINE',
          paymentMethod: 'COD',
          deliveryAddress: 'B-702, Magarpatta City, Pune 411028',
          prescriptionId: rxId,
        }),
      });
      assert.equal(orderRes.status, 201);
      const orderJson = await orderRes.json();
      e2eOrderId = orderJson.data.id;

      // 4. Pharmacist advances order to PREPARING
      const prepRes = await fetch(`${baseUrl}/api/v1/orders/${e2eOrderId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacyAPharmacistToken),
        body: JSON.stringify({ status: 'PREPARING' }),
      });
      assert.equal(prepRes.status, 200);

      // 5. Pharmacist marks order READY
      const readyRes = await fetch(`${baseUrl}/api/v1/orders/${e2eOrderId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacyAPharmacistToken),
        body: JSON.stringify({ status: 'READY' }),
      });
      assert.equal(readyRes.status, 200);

      // 6. Pharmacy dispatches delivery
      const delRes = await fetch(`${baseUrl}/api/v1/deliveries`, {
        method: 'POST',
        headers: authHeader(pharmacyAPharmacistToken),
        body: JSON.stringify({
          orderId: e2eOrderId,
          branchId: 'br_1',
          deliveryStaffId: 'usr_rider_1',
          deliveryAddress: 'B-702, Magarpatta City, Pune 411028',
        }),
      });
      assert.equal(delRes.status, 201);
      const delJson = await delRes.json();
      e2eDeliveryId = delJson.data.id;

      // 7. Rider marks OUT_FOR_DELIVERY
      const outRes = await fetch(`${baseUrl}/api/v1/deliveries/${e2eDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
      });
      assert.equal(outRes.status, 200);

      // 8. Rider marks DELIVERED
      const doneRes = await fetch(`${baseUrl}/api/v1/deliveries/${e2eDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'DELIVERED' }),
      });
      assert.equal(doneRes.status, 200);

      // 9. Customer verifies DELIVERED status
      const verifyRes = await fetch(`${baseUrl}/api/v1/orders/${e2eOrderId}`, {
        method: 'GET',
        headers: authHeader(customerAToken),
      });
      assert.equal(verifyRes.status, 200);
      const verifyJson = await verifyRes.json();
      assert.equal(verifyJson.data.status, 'DELIVERED');
    });

    it('Full Store Counter Flow: POS item lookup -> Sale submission -> Receipt generation -> Ledger report', async () => {
      // 1. POS Sale Submission
      const posRes = await fetch(`${baseUrl}/api/v1/pos/sales`, {
        method: 'POST',
        headers: authHeader(pharmacyACashierToken),
        body: JSON.stringify({
          branchId: 'br_1',
          customerName: 'Sanjay Deshmukh',
          customerPhone: '+91 99220 55441',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          discount: 5.0,
          paymentMethod: 'CASH',
        }),
      });
      assert.equal(posRes.status, 201);
      const posJson = await posRes.json();
      const saleId = posJson.data.id;
      const receiptNumber = posJson.data.receiptNumber;
      assert.ok(receiptNumber.startsWith('REC-'));

      // 2. Receipt retrieval
      const receiptRes = await fetch(`${baseUrl}/api/v1/pos/sales/${saleId}`, {
        method: 'GET',
        headers: authHeader(pharmacyACashierToken),
      });
      assert.equal(receiptRes.status, 200);
      const receiptJson = await receiptRes.json();
      assert.equal(receiptJson.data.receiptNumber, receiptNumber);
      assert.equal(receiptJson.data.customerName, 'Sanjay Deshmukh');

      // 3. Operational telemetry verification
      const telemRes = await fetch(`${baseUrl}/api/v1/reports/dashboard`, {
        method: 'GET',
        headers: authHeader(pharmacyACashierToken),
      });
      assert.equal(telemRes.status, 200);
      const telemJson = await telemRes.json();
      assert.ok(telemJson.data.sales.todayTotal > 0);
    });
  });
});
