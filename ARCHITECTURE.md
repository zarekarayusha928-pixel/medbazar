# Med Bazar — System Architecture

## High-Level Architecture

```text
                         MED BAZAR PLATFORM
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
     CUSTOMER APPLICATION                 PHARMACY APPLICATION
             |                                     |
             +------------------+------------------+
                                |
                                v
                         APPLICATION API
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
 Authentication            Business Logic          Notifications
        |                       |                       |
        +-----------------------+-----------------------+
                                |
                                v
                          PostgreSQL DB
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
       Pharmacy Data       Inventory Data       Order Data
                                |
                                v
                         Private File Storage
                         (prescriptions/docs)
```

## Multi-Tenancy

Every pharmacy-owned record must be connected to an `organization_id`.

Branch-specific records must additionally use `branch_id`.

Conceptually:

```text
organization_id
      |
      +-- branches
      |      |
      |      +-- inventory
      |      +-- POS sales
      |      +-- branch staff
      |      +-- local orders
      |
      +-- customers
      +-- prescriptions
      +-- orders
      +-- suppliers
```

## Critical Rule

A pharmacy must never be able to read or modify another pharmacy's private business data.

This should be enforced at the backend/database authorization layer, not only by hiding UI elements.

## Inventory Rule

Inventory belongs to a branch.

```text
Medicine
   +
Branch
   +
Batch
   =
Inventory Record
```

Online and offline transactions both modify the relevant branch inventory through controlled backend transactions.

## Global Catalogue vs Pharmacy Inventory

### Global medicine catalogue
Defines what the medicine/product is.

### Pharmacy inventory
Defines:
- branch
- stock
- batch
- expiry
- price
- availability
- reorder level

This separation is required for multi-pharmacy scaling.

## Scalability Principle

Avoid assumptions such as:
- one pharmacy
- one branch
- one warehouse
- one cashier
- one customer per order

The data model should support one-to-many relationships from the beginning.
