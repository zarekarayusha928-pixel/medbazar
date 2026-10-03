# Contributing to Med Bazar

## Before Starting

Read:
1. README.md
2. PROJECT_DETAILS.md
3. ARCHITECTURE.md
4. DATABASE.md
5. IMPLEMENTATION_RULES.md

## Branch Naming

Examples:

```text
feature/customer-cart
feature/pharmacy-pos
feature/inventory
fix/order-stock-update
```

## Commit Style

Use clear messages:

```text
feat: add pharmacy POS
feat: add prescription upload
fix: prevent negative inventory
fix: validate order stock
refactor: improve order service
docs: update database blueprint
```

## Pull Request Checklist

- [ ] Feature works
- [ ] Responsive UI
- [ ] No hard-coded business data
- [ ] Authorization checked
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Database changes documented
- [ ] Tests added where appropriate
- [ ] No secrets committed

## Code Quality

Prefer:
- Small reusable functions
- Typed data models
- Clear names
- Consistent formatting
- Server-side validation
- Reusable UI components
