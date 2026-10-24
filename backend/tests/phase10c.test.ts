import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app.js';
import { signToken, revokeToken, verifyToken } from '../src/utils/jwt.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

let server: http.Server;
let baseUrl: string;

// Helper to generate auth headers
function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

describe('PHASE 10C: Server, Authentication, RBAC & Multi-Tenant Test Suite', () => {
  before(async () => {
    await new Promise<void>((resolve) => {
      // Ephemeral port
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
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('1. Health Check & Root Documentation', () => {
    it('GET / should return service info and documentation link', async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.service, 'Med Bazar Healthcare API');
      assert.equal(data.version, '1.0.0');
    });

    it('GET /api/v1/health should report server online status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ONLINE');
      assert.equal(body.data.service, 'medbazar-api');
      assert.ok(typeof body.data.uptime === 'number');
      assert.ok(body.data.database === 'CONNECTED' || body.data.database === 'DISCONNECTED');
    });

    it('GET /api/v1/non-existent-route should return 404 with standard envelope', async () => {
      const res = await fetch(`${baseUrl}/api/v1/random-endpoint`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'NOT_FOUND');
    });
  });

  describe('2. Password Security & JWT Lifecycle', () => {
    it('should hash and verify passwords securely with bcrypt', async () => {
      const plaintext = 'SecurePass@2026';
      const hash = await hashPassword(plaintext);
      assert.notEqual(hash, plaintext);
      assert.ok(hash.startsWith('$2'));

      const isValid = await verifyPassword(plaintext, hash);
      assert.equal(isValid, true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      assert.equal(isInvalid, false);
    });

    it('should issue and verify valid JWT tokens with custom claims', () => {
      const payload = {
        userId: 'usr_owner_101',
        email: 'owner@apothecary.com',
        role: 'PHARMACY_OWNER' as const,
        organizationId: 'pharm_1',
        branchId: 'br_1',
      };

      const token = signToken(payload, '2h');
      assert.ok(token);

      const decoded = verifyToken(token);
      assert.equal(decoded.userId, payload.userId);
      assert.equal(decoded.email, payload.email);
      assert.equal(decoded.role, payload.role);
      assert.equal(decoded.organizationId, payload.organizationId);
    });

    it('should reject revoked tokens', () => {
      const payload = {
        userId: 'usr_logout_test',
        email: 'logout@test.com',
        role: 'CUSTOMER' as const,
      };

      const token = signToken(payload, '1h');
      assert.ok(verifyToken(token));

      // Revoke the token
      revokeToken(token);

      // Subsequent verification should throw
      assert.throws(() => verifyToken(token), /Token has been revoked/);
    });
  });

  describe('3. Authentication Middleware & Token Guards', () => {
    it('should return 401 UNAUTHORIZED when no token is provided on protected routes', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/me`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'UNAUTHORIZED');
    });

    it('should return 401 INVALID_TOKEN when a malformed Bearer token is provided', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        headers: authHeader('invalid.malformed.jwt.token'),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'INVALID_TOKEN');
    });

    it('should return 401 EXPIRED_TOKEN when token has expired', async () => {
      const expiredToken = signToken(
        { userId: 'usr_exp', email: 'exp@test.com', role: 'CUSTOMER' },
        '0s'
      );

      // Short delay to ensure expiration
      await new Promise((r) => setTimeout(r, 50));

      const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        headers: authHeader(expiredToken),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'EXPIRED_TOKEN');
    });
  });

  describe('4. Registration Security & Public Input Validation', () => {
    it('POST /api/v1/auth/login should reject invalid email format with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'VALIDATION_ERROR');
      assert.ok(body.errors?.email);
    });

    it('POST /api/v1/auth/login should reject missing password with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'VALIDATION_ERROR');
      assert.ok(body.errors?.password);
    });

    it('POST /api/v1/auth/register should sanitize or reject PLATFORM_ADMIN creation', async () => {
      // Public registration cannot escalate to PLATFORM_ADMIN
      const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacker Admin',
          email: 'hacker@test.com',
          password: 'Password123!',
          phone: '+91 99999 88888',
          role: 'PLATFORM_ADMIN',
        }),
      });

      // The registerSchema in auth.validator.ts rejects PLATFORM_ADMIN
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'VALIDATION_ERROR');
      assert.ok(body.errors?.role);
    });
  });

  describe('5. Role-Based Access Control (RBAC)', () => {
    it('CUSTOMER role should be forbidden from accessing GET /api/v1/users', async () => {
      const customerToken = signToken({
        userId: 'cust_test_1',
        email: 'customer@test.com',
        role: 'CUSTOMER',
      });

      const res = await fetch(`${baseUrl}/api/v1/users`, {
        headers: authHeader(customerToken),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
      assert.ok(body.message.includes("Role 'CUSTOMER' is not authorized"));
    });

    it('CASHIER role should be forbidden from creating users on POST /api/v1/users', async () => {
      const cashierToken = signToken({
        userId: 'cashier_test_1',
        email: 'cashier@pharmacy.com',
        role: 'CASHIER',
        organizationId: 'pharm_1',
        branchId: 'br_1',
      });

      const res = await fetch(`${baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: authHeader(cashierToken),
        body: JSON.stringify({
          name: 'New Staff',
          email: 'staff@test.com',
          role: 'PHARMACIST',
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
    });

    it('CUSTOMER role should be forbidden from onboarding new pharmacies on POST /api/v1/organizations', async () => {
      const customerToken = signToken({
        userId: 'cust_test_2',
        email: 'customer2@test.com',
        role: 'CUSTOMER',
      });

      const res = await fetch(`${baseUrl}/api/v1/organizations`, {
        method: 'POST',
        headers: authHeader(customerToken),
        body: JSON.stringify({
          name: 'Rogue Pharmacy',
          licenseNumber: 'DL-999999',
          phone: '+91 99999 00000',
          email: 'rogue@pharmacy.com',
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
    });
  });

  describe('6. Multi-Tenant Organization Boundary Isolation', () => {
    it('PHARMACY_OWNER of Org A should be forbidden from updating Org B details', async () => {
      const orgAOwnerToken = signToken({
        userId: 'owner_org_a',
        email: 'owner@pharmacy-a.com',
        role: 'PHARMACY_OWNER',
        organizationId: 'org_apothecary',
      });

      const res = await fetch(`${baseUrl}/api/v1/organizations/org_wellness`, {
        method: 'PUT',
        headers: authHeader(orgAOwnerToken),
        body: JSON.stringify({
          name: 'Hacked Wellness Pharmacy',
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
      assert.ok(body.message.includes('Tenant Access Violation'));
    });

    it('PHARMACY_OWNER of Org A should be forbidden from accessing Org B audit activities', async () => {
      const orgAOwnerToken = signToken({
        userId: 'owner_org_a',
        email: 'owner@pharmacy-a.com',
        role: 'PHARMACY_OWNER',
        organizationId: 'org_apothecary',
      });

      const res = await fetch(`${baseUrl}/api/v1/organizations/org_wellness/activities`, {
        headers: authHeader(orgAOwnerToken),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
      assert.ok(body.message.includes('Tenant Access Violation'));
    });

    it('PHARMACY_OWNER creating a branch for another organization should be rejected', async () => {
      const orgAOwnerToken = signToken({
        userId: 'owner_org_a',
        email: 'owner@pharmacy-a.com',
        role: 'PHARMACY_OWNER',
        organizationId: 'org_apothecary',
      });

      const res = await fetch(`${baseUrl}/api/v1/branches`, {
        method: 'POST',
        headers: authHeader(orgAOwnerToken),
        body: JSON.stringify({
          organizationId: 'org_wellness', // Different org!
          name: 'Unauthorized Wellness Branch',
          address: 'Main Street',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          phone: '+91 98765 43210',
        }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
      assert.ok(body.message.includes('Tenant Access Violation'));
    });
  });

  describe('7. Customer Ownership Enforcement', () => {
    it('Customer A should be forbidden from accessing Customer B profile records', async () => {
      const customerAToken = signToken({
        userId: 'cust_alice_123',
        email: 'alice@customer.com',
        role: 'CUSTOMER',
      });

      const res = await fetch(`${baseUrl}/api/v1/users/cust_bob_456`, {
        headers: authHeader(customerAToken),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'FORBIDDEN');
      assert.ok(body.message.includes('Access Denied'));
    });
  });
});
