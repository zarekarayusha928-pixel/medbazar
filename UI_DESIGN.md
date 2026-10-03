# Med Bazar — UI/UX Design System

## Design Goal

The interface should feel like a professional healthcare product, not a generic e-commerce template.

Keywords:

**Clean · Trustworthy · Modern · Calm · Efficient · Professional**

## Layout

### Customer

```text
Header
 ├── Logo
 ├── Search
 ├── Location
 ├── Orders
 ├── Cart
 └── Profile

Main content

Footer
```

### Pharmacy Dashboard

```text
Sidebar
 ├── Dashboard
 ├── Orders
 ├── POS
 ├── Prescriptions
 ├── Inventory
 ├── Purchases
 ├── Customers
 ├── Deliveries
 ├── Reports
 ├── Staff
 └── Settings

Top bar
 ├── Pharmacy/Branch selector
 ├── Notifications
 └── User menu

Main content
```

## Visual Rules

### Colors
Use a restrained healthcare palette:
- Primary: professional green/teal family
- Background: white/off-white
- Text: dark neutral
- Success: green
- Warning: amber
- Error: red
- Info: blue

Do not use many competing accent colors.

### Typography
Use a modern readable sans-serif font.

Recommended hierarchy:
- H1: page title
- H2: section title
- H3: card title
- Body: regular
- Caption: muted

### Cards
Use cards for:
- KPI summaries
- Medicine products
- Order summaries
- Alerts
- Reports

Avoid putting every tiny element into a separate card.

### Tables
Use tables for:
- Orders
- Inventory
- Customers
- Staff
- Purchases
- Reports

Include:
- Search
- Filters
- Sort
- Pagination
- Clear status badges

### Status Badges

Examples:

`Pending`
`Confirmed`
`Preparing`
`Ready`
`Out for Delivery`
`Delivered`
`Cancelled`

Keep status labels consistent throughout the application.

## Responsive Design

The customer application must be mobile-first.

The pharmacy dashboard should work well on:
- Desktop
- Laptop
- Tablet

POS should be optimized for fast keyboard/mouse/touch operation.

## UX Rules

- Keep important actions visible.
- Use clear confirmation dialogs for destructive actions.
- Never silently delete important records.
- Show loading states.
- Show empty states.
- Show useful error messages.
- Validate forms before submission.
- Keep navigation consistent.
- Do not overload dashboards with unnecessary charts.

## Accessibility

- Good color contrast
- Keyboard navigation
- Visible focus states
- Form labels
- Accessible buttons
- Meaningful error messages
- Do not rely only on color to communicate status
