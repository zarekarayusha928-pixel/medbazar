# Med Bazar — Environment Configuration

Do not commit real secrets to Git.

Example `.env` structure:

```env
# Application
VITE_APP_NAME=Med Bazar

# Backend
VITE_API_URL=

# Authentication
AUTH_SECRET=

# Database
DATABASE_URL=

# Storage
STORAGE_BUCKET=

# Payments
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=

# Notifications
SMS_API_KEY=
EMAIL_API_KEY=

# Maps, if enabled
MAPS_API_KEY=
```

## Rules

- Commit `.env.example`
- Add `.env` to `.gitignore`
- Never paste production secrets into README files
- Never expose server-only secrets through frontend variables
- Use separate development/staging/production credentials
