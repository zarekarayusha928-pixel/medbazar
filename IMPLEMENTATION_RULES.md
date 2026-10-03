# Med Bazar — Implementation Rules

These rules should be followed by anyone developing the project.

## 1. No Hard-Coded Business Data

Do not hard-code:
- Pharmacy names
- Medicine stock
- Prices
- Orders
- Customers
- Staff

Use database-driven values.

## 2. Multi-Tenant From Day One

Every pharmacy-owned resource must be connected to an organization.

Every branch-owned resource must have a branch.

## 3. One Source of Truth for Stock

Never maintain separate online and offline stock.

Use:

```text
Branch Inventory
       ↑
   +---+---+
   |       |
Online   Offline
Orders    POS
```

## 4. All Stock Changes Need a Movement

Every stock-changing action must create a `stock_movements` record.

This gives traceability.

## 5. Backend Controls Stock

Do not trust the frontend quantity.

The backend/database transaction must verify available stock before completing a sale.

## 6. Use Reusable Components

Create shared components for:
- Buttons
- Inputs
- Tables
- Cards
- Modals
- Status badges
- Toasts
- Empty states
- Loading states

## 7. Keep UI Professional

Avoid:
- Random colors
- Excessive gradients
- Huge rounded cards everywhere
- Unnecessary animations
- Inconsistent spacing
- Different button styles for the same action

## 8. Error Handling

Every important action should have:
- Loading state
- Success feedback
- Error feedback
- Retry option where appropriate

## 9. Auditability

Important pharmacy operations must be traceable.

## 10. Build Mobile Responsiveness

Customer side: mobile-first.

Pharmacy side: desktop-first but tablet-friendly.

## 11. Preserve Data

Prefer status changes/soft deletion for important business records instead of destructive deletion.

## 12. Production Safety

Never place secrets/API keys directly in frontend source code.

Use environment variables and secure server-side configuration.
