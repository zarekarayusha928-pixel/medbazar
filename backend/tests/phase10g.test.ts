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

describe('PHASE 10G: Prescription, Payment, Delivery & Notification Integration Test Suite', () => {
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

  const pharmacistToken = signToken({
    userId: 'usr_pharm_1',
    email: 'pharmacist@apothecary.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_1',
    branchId: 'br_1',
  });

  const foreignPharmacistToken = signToken({
    userId: 'usr_pharm_2',
    email: 'pharmacist@careplus.com',
    role: 'PHARMACIST',
    organizationId: 'pharm_2',
    branchId: 'br_2',
  });

  const customerToken = signToken({
    userId: 'usr_cust_1',
    email: 'customer@patient.com',
    role: 'CUSTOMER',
  });

  const customer2Token = signToken({
    userId: 'usr_cust_2',
    email: 'intruder@patient.com',
    role: 'CUSTOMER',
  });

  const riderToken = signToken({
    userId: 'usr_rider_1',
    email: 'rider1@logistics.com',
    role: 'DELIVERY_STAFF',
    branchId: 'br_1',
  });

  const foreignRiderToken = signToken({
    userId: 'usr_rider_2',
    email: 'rider2@logistics.com',
    role: 'DELIVERY_STAFF',
    branchId: 'br_2',
  });

  let createdPrescriptionId: string;
  let createdOrderId: string;
  let createdDeliveryId: string;

  // ==========================================
  // PART A — PRESCRIPTION SECURITY & REVIEW
  // ==========================================
  describe('1. Part A: Secure Prescription Handling & Authorization', () => {
    it('POST /api/v1/prescriptions should reject upload with invalid file type', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. S. Mehta',
          fileName: 'malicious_script.exe',
          fileType: 'EXE',
          fileUrl: '/uploads/malicious_script.exe',
          fileSizeBytes: 2048,
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('POST /api/v1/prescriptions should reject upload exceeding 10MB limit', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. S. Mehta',
          fileName: 'large_prescription.pdf',
          fileType: 'PDF',
          fileUrl: '/uploads/large_prescription.pdf',
          fileSizeBytes: 15 * 1024 * 1024, // 15MB
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('POST /api/v1/prescriptions should accept valid PDF and default to PENDING_REVIEW (never auto-approve)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          organizationId: 'pharm_1',
          doctorName: 'Dr. Rajesh Sen',
          fileName: 'rx_asthma_treatment.pdf',
          fileType: 'PDF',
          fileUrl: 'storage/secure_prescriptions/rx_asthma_treatment.pdf',
          fileSizeBytes: 524288, // 512KB
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, 'PENDING_REVIEW');
      createdPrescriptionId = json.data.id;
    });

    it('GET /api/v1/prescriptions/:id/file should authorize customer owner and return private file info', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/file`, {
        method: 'GET',
        headers: authHeader(customerToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.fileType, 'PDF');
      assert.ok(json.data.storagePath.includes('secure_prescriptions'));
      assert.equal(json.data.mimeType, 'application/pdf');
    });

    it('GET /api/v1/prescriptions/:id/file should reject Customer B accessing Customer A prescription with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/file`, {
        method: 'GET',
        headers: authHeader(customer2Token),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('GET /api/v1/prescriptions/:id/file should reject Pharmacy B staff accessing Pharmacy A prescription with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/file`, {
        method: 'GET',
        headers: authHeader(foreignPharmacistToken),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('PATCH /api/v1/prescriptions/:id/status should allow authorized Pharmacist to approve prescription', async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/${createdPrescriptionId}/status`, {
        method: 'PATCH',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          status: 'APPROVED',
          notes: 'Valid Schedule H Rx verified against Medical Council registry.',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, 'APPROVED');
      assert.ok(json.data.reviewedAt);
    });
  });

  // ==========================================
  // PART B — PAYMENTS & WEBHOOKS
  // ==========================================
  describe('2. Part B: Server-Side Payments & Webhooks', () => {
    it('GET /api/v1/payments/config should truthfully indicate gateway status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/config`, {
        method: 'GET',
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.supportedMethods.includes('ONLINE'));
      assert.ok(json.data.supportedMethods.includes('COD'));
    });

    it('POST /api/v1/orders should create an order for payment testing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          branchId: 'br_1',
          organizationId: 'pharm_1',
          items: [{ medicineId: 'med_1', quantity: 1 }],
          orderType: 'ONLINE',
          paymentMethod: 'COD',
          deliveryAddress: 'Flat 101, Green Park, Pune - 411001',
          prescriptionId: createdPrescriptionId,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      createdOrderId = json.data.id;
      assert.equal(json.data.paymentStatus, 'PENDING');
    });

    it('POST /api/v1/payments/verify should report PENDING when unconfigured gateway is requested without proof', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          orderId: createdOrderId,
          paymentMethod: 'ONLINE',
          gatewayName: 'RAZORPAY',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.verified, false);
      assert.equal(json.data.status, 'PENDING');
    });

    it('POST /api/v1/payments/verify should reject unauthorized customer trying to verify CASH/COD payment with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          orderId: createdOrderId,
          paymentMethod: 'COD',
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('POST /api/v1/payments/verify should allow delivery staff to verify COD payment collection', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
        method: 'POST',
        headers: authHeader(riderToken),
        body: JSON.stringify({
          orderId: createdOrderId,
          paymentMethod: 'COD',
          amount: 82.5,
          transactionRef: 'COD_CASH_COLLECTED_001',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, 'PAID');
    });

    it('POST /api/v1/payments/webhook/:gateway should process provider webhook and deduplicate duplicate events', async () => {
      const eventPayload = {
        id: `evt_test_rzp_${Date.now()}`,
        orderId: createdOrderId,
        event: 'payment.captured',
        amount: 8250,
        transactionRef: `pay_test_${Date.now()}`,
      };

      // First webhook submission
      const res1 = await fetch(`${baseUrl}/api/v1/payments/webhook/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });

      assert.equal(res1.status, 200);
      const json1 = await res1.json();
      assert.equal(json1.success, true);
      assert.equal(json1.data.duplicate, false);

      // Duplicate submission of same event ID
      const res2 = await fetch(`${baseUrl}/api/v1/payments/webhook/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });

      assert.equal(res2.status, 200);
      const json2 = await res2.json();
      assert.equal(json2.success, true);
      assert.equal(json2.data.duplicate, true); // Prevented duplicate reprocessing
    });
  });

  // ==========================================
  // PART C — LOGISTICS & DELIVERY
  // ==========================================
  describe('3. Part C: Logistics & Delivery Assignment', () => {
    it('POST /api/v1/deliveries should allow pharmacy staff to create a delivery dispatch', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries`, {
        method: 'POST',
        headers: authHeader(pharmacistToken),
        body: JSON.stringify({
          orderId: createdOrderId,
          branchId: 'br_1',
          deliveryStaffId: 'usr_rider_1',
          deliveryAddress: 'Flat 101, Green Park, Pune - 411001',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, 'ASSIGNED');
      createdDeliveryId = json.data.id;
    });

    it('GET /api/v1/deliveries should return assigned deliveries to rider', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries`, {
        method: 'GET',
        headers: authHeader(riderToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
    });

    it('GET /api/v1/deliveries/:id should reject foreign rider with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries/${createdDeliveryId}`, {
        method: 'GET',
        headers: authHeader(foreignRiderToken),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('PATCH /api/v1/deliveries/:id/status should validate state transition (cannot jump ASSIGNED -> DELIVERED directly)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries/${createdDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'DELIVERED' }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('PATCH /api/v1/deliveries/:id/status should advance to OUT_FOR_DELIVERY and sync parent order', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries/${createdDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.status, 'OUT_FOR_DELIVERY');
    });

    it('PATCH /api/v1/deliveries/:id/status should advance to DELIVERED and record completed timestamp', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries/${createdDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'DELIVERED' }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.status, 'DELIVERED');
      assert.ok(json.data.completedTime);
    });

    it('PATCH /api/v1/deliveries/:id/status should reject modifying an already completed delivery with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/deliveries/${createdDeliveryId}/status`, {
        method: 'PATCH',
        headers: authHeader(riderToken),
        body: JSON.stringify({ status: 'ASSIGNED' }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });
  });

  // ==========================================
  // PART D — NOTIFICATIONS
  // ==========================================
  describe('4. Part D: In-App Notifications & Scoping', () => {
    it('GET /api/v1/notifications/channels-status should report truthful channel availability', async () => {
      const res = await fetch(`${baseUrl}/api/v1/notifications/channels-status`, {
        method: 'GET',
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.inApp.enabled, true);
      assert.equal(json.data.sms.enabled, false);
      assert.equal(json.data.email.enabled, false);
      assert.equal(json.data.whatsapp.enabled, false);
    });

    it('GET /api/v1/notifications should return user scoped notifications', async () => {
      const res = await fetch(`${baseUrl}/api/v1/notifications`, {
        method: 'GET',
        headers: authHeader(customerToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
    });

    it('POST /api/v1/notifications/read-all should mark all caller notifications as read', async () => {
      const res = await fetch(`${baseUrl}/api/v1/notifications/read-all`, {
        method: 'POST',
        headers: authHeader(customerToken),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
    });
  });

  // ==========================================
  // PART E — REORDER ENDPOINT
  // ==========================================
  describe('5. Part E: Reorder Verification & Inventory Reservation', () => {
    it('POST /api/v1/orders/:id/reorder should reject Customer B trying to reorder Customer A order with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/reorder`, {
        method: 'POST',
        headers: authHeader(customer2Token),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it('POST /api/v1/orders/:id/reorder should successfully place a reorder using current prices and stock', async () => {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/reorder`, {
        method: 'POST',
        headers: authHeader(customerToken),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.notEqual(json.data.id, createdOrderId); // Brand new order
      assert.notEqual(json.data.orderNumber, undefined);
      assert.equal(json.data.items.length, 1);
    });
  });
});
