# Med Bazar — Roles & Permissions

## 1. Platform Admin

Scope: Entire Med Bazar platform.

Can:
- Manage pharmacies
- Verify/onboard pharmacies
- Manage global catalogue
- Manage platform users
- View platform analytics
- Manage subscriptions
- View audit logs
- Configure platform settings

Should not automatically access private pharmacy business data unless explicitly authorized and legally appropriate.

## 2. Pharmacy Owner

Scope: Own organization.

Can:
- Manage branches
- Manage staff
- View sales
- Manage inventory
- Manage online orders
- Manage POS
- View reports
- Configure pharmacy settings

## 3. Branch Manager

Scope: Assigned branch.

Can:
- View branch dashboard
- Manage branch inventory
- Manage orders
- Manage POS
- View branch reports
- Manage assigned staff according to policy

## 4. Pharmacist

Scope: Assigned pharmacy/branch.

Can:
- Review prescriptions
- Process medicine-related orders
- View relevant inventory
- Handle dispensing workflow
- View customer/order information required for the job

## 5. Cashier

Scope: Assigned branch.

Can:
- Use POS
- Create offline sales
- Take configured payments
- Print/send receipts
- View necessary product/stock information

Should not manage platform settings or sensitive administrative data.

## 6. Delivery Staff

Scope: Assigned deliveries.

Can:
- View assigned orders
- View necessary delivery information
- Update delivery status

## 7. Customer

Can:
- Manage own account
- Search medicines
- View participating pharmacies
- Create own orders
- Upload prescriptions
- View own orders
- Track own deliveries

A customer must never access another customer's data.

---

## Authorization Rule

Permissions must be enforced server-side.

UI hiding is not security.

Every protected request should verify:
1. User identity.
2. Organization membership.
3. Branch access if applicable.
4. Role permission.
5. Resource ownership where applicable.
