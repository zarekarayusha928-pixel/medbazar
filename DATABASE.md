# Med Bazar — Database Blueprint

This is a logical blueprint. Exact SQL can be generated during implementation.

## Core Tables

### organizations
Represents a pharmacy business/tenant.

Fields:
- id
- name
- legal/business details
- contact details
- status
- created_at

### branches
Represents a physical pharmacy location.

Fields:
- id
- organization_id
- name
- address
- city
- state
- pincode
- phone
- status
- created_at

### users
Platform users.

Fields:
- id
- name
- email
- phone
- status
- created_at

### organization_members
Connects users to organizations.

Fields:
- id
- organization_id
- user_id
- role
- branch_id (nullable for organization-wide roles)

### medicines
Global medicine/product catalogue.

Fields:
- id
- name
- generic_name
- brand
- composition
- dosage_form
- strength
- category_id
- prescription_required
- barcode
- status

### categories
Medicine/product categories.

### inventory
Branch-level stock.

Fields:
- id
- organization_id
- branch_id
- medicine_id
- quantity
- reorder_level
- selling_price
- status

### inventory_batches
Batch-level tracking.

Fields:
- id
- inventory_id
- batch_number
- expiry_date
- quantity
- purchase_price

### stock_movements
Every stock change should have a traceable movement.

Fields:
- id
- organization_id
- branch_id
- inventory_id
- movement_type
- quantity
- reference_type
- reference_id
- created_by
- created_at

Examples of movement_type:
- PURCHASE
- ONLINE_SALE
- OFFLINE_SALE
- RETURN
- ADJUSTMENT
- TRANSFER_IN
- TRANSFER_OUT
- EXPIRY

### customers
Customer profiles.

### orders
Online/customer orders.

Fields:
- id
- organization_id
- branch_id
- customer_id
- order_number
- order_type
- status
- subtotal
- discount
- delivery_fee
- total
- payment_status
- created_at

order_type:
- ONLINE
- PICKUP

### order_items
Fields:
- id
- order_id
- medicine_id
- quantity
- unit_price
- total

### prescriptions
Fields:
- id
- organization_id
- customer_id
- order_id
- file_path
- status
- reviewed_by
- reviewed_at
- notes

### pos_sales
Offline/store transactions.

Fields:
- id
- organization_id
- branch_id
- customer_id (nullable)
- receipt_number
- subtotal
- discount
- total
- payment_method
- created_by
- created_at

### pos_sale_items
Fields:
- id
- pos_sale_id
- medicine_id
- quantity
- unit_price
- total

### payments
Tracks payment transactions.

### deliveries
Tracks delivery information and status.

### suppliers
Supplier records.

### purchase_orders
Stock purchase documents.

### purchase_items
Items in a purchase.

### notifications
Customer/staff notifications.

### coupons
Discount rules.

### audit_logs
Security and accountability history.

---

## Critical Relationships

```text
Organization
  ├── Branches
  ├── Members
  ├── Customers
  ├── Orders
  ├── POS Sales
  ├── Prescriptions
  └── Inventory

Branch
  ├── Inventory
  ├── POS Sales
  ├── Orders
  └── Staff

Medicine
  ├── Inventory
  ├── Order Items
  └── POS Sale Items
```

## Inventory Integrity

Never update stock only in the frontend.

Stock-changing operations must happen through a secure backend/database transaction that:
1. Checks available quantity.
2. Locks/updates the relevant stock safely.
3. Creates the sale/order movement.
4. Writes a stock movement record.
5. Commits all related changes together.

This prevents negative stock and double-selling during simultaneous online/offline purchases.
