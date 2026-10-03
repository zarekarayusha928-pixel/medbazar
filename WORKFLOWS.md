# Med Bazar — Business Workflows

## 1. Online Order

```text
Customer
  ↓
Search medicine
  ↓
Select pharmacy/branch
  ↓
Add to cart
  ↓
System validates availability
  ↓
Prescription required?
  ├── No → Continue
  └── Yes → Upload prescription
  ↓
Address
  ↓
Payment
  ↓
Order created
  ↓
Pharmacy notification
  ↓
Pharmacist reviews prescription if required
  ↓
Confirm / request information / reject
  ↓
Prepare
  ↓
Pack
  ↓
Delivery or pickup
  ↓
Complete
```

## 2. Offline POS Sale

```text
Customer enters store
  ↓
Cashier opens POS
  ↓
Search/scan medicine
  ↓
Add quantity
  ↓
System checks stock
  ↓
Payment
  ↓
Complete sale
  ↓
Inventory transaction
  ↓
Stock movement = OFFLINE_SALE
  ↓
Receipt
```

## 3. Online + Offline Stock

```text
Branch stock = 100

Online order = 5
        ↓
Stock = 95

Offline sale = 3
        ↓
Stock = 92
```

Both transactions are stored separately for reporting, but both affect the same branch inventory.

## 4. Multi-Branch Transfer

```text
Pune Branch
Stock = 100
     ↓
Transfer 20
     ↓
Pune = 80

Wagholi Branch
Stock = 30
     ↓
Receive 20
     ↓
Wagholi = 50
```

Both transfer-out and transfer-in must be recorded.

## 5. Low Stock

```text
Current stock <= reorder level
          ↓
Create low-stock alert
          ↓
Show on dashboard
          ↓
Optional purchase order
```

## 6. Expiry

```text
Batch expiry approaching
          ↓
Create expiry alert
          ↓
Show affected batch
          ↓
Authorized staff action
```

## 7. Customer Order Status

Recommended status flow:

```text
PENDING
  ↓
PRESCRIPTION_REVIEW (if applicable)
  ↓
CONFIRMED
  ↓
PREPARING
  ↓
READY
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

Alternative terminal states:

```text
CANCELLED
REJECTED
FAILED
```

## 8. Prescription Status

```text
UPLOADED
   ↓
PENDING_REVIEW
   ├── APPROVED
   ├── REJECTED
   └── NEEDS_INFORMATION
```

Do not automatically treat a prescription upload as approval.

## 9. POS Payment

Support configurable payment methods such as:
- Cash
- UPI
- Card
- Other configured methods

Payment status must be recorded separately from order status.

## 10. Reorder

Customer opens a previous eligible order.

```text
Previous order
   ↓
Check current availability
   ↓
Add available items to cart
   ↓
Require prescription again when applicable
   ↓
Checkout
```
