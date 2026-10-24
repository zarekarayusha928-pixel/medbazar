# Med Bazar — Production Deployment, Operations & Security Guide

This document outlines the deployment architecture, configuration standards, operational runbooks, and security guidelines for **Med Bazar Multi-Tenant Healthcare & Pharmacy Platform**.

---

## 1. System Architecture & Prerequisites

### Infrastructure Requirements
- **Node.js**: `v20.x` or `v22.x` LTS
- **Database**: PostgreSQL `15` or `16` with SSL enabled
- **Web Server / Reverse Proxy**: NGINX with TLS 1.3 or Cloudflare Edge
- **Storage**: Private Local SSD directory (chmod 700) or AWS S3 Private Bucket with strict IAM
- **Process Manager**: PM2 or Docker / Kubernetes Container runtime

---

## 2. PostgreSQL Setup & Database Migration

### 2.1 Database Provisioning
Connect to PostgreSQL as `postgres` superuser and initialize the database and dedicated user:

```sql
-- Create production user
CREATE USER medbazar_admin WITH PASSWORD 'SECURE_GENERATED_PASSWORD_HERE';

-- Create production database
CREATE DATABASE medbazar_prod OWNER medbazar_admin;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE medbazar_prod TO medbazar_admin;
ALTER DATABASE medbazar_prod SET timezone TO 'Asia/Kolkata';
```

### 2.2 Prisma Schema Validation & Migration
Before deployment, validate schema syntax and run production migrations:

```bash
# Validate Prisma schema
npm run prisma:validate

# Format Prisma schema
npm run prisma:format

# Apply pending migrations to production database
npx prisma migrate deploy

# Seed baseline reference data (global medicine catalog, categories, system roles)
npm run db:seed
```

---

## 3. Database Backup & Disaster Recovery Runbook

### 3.1 Automated Nightly Backup (`pg_dump`)
Run a cron job executing compressed custom-format dumps:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/medbazar"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/medbazar_backup_$TIMESTAMP.dump"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U medbazar_admin -d medbazar_prod -F c -b -v -f "$FILENAME"

# Retain backups for 30 days
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -exec rm {} \;
```

### 3.2 Database Restoration (`pg_restore`)
To restore an existing database or migrate to a new instance:

```bash
# Drop connections and recreate database
dropdb -h localhost -U postgres medbazar_prod
createdb -h localhost -U postgres -O medbazar_admin medbazar_prod

# Restore from dump file
pg_restore -h localhost -U medbazar_admin -d medbazar_prod -v "/var/backups/medbazar/medbazar_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 4. Frontend & Backend Deployment

### 4.1 Production Build Pipeline

```bash
# 1. Install production dependencies
npm ci

# 2. Compile Backend TypeScript into JavaScript
npm run server:build

# 3. Compile Frontend Vite Production Bundle
npm run build
```

The compiled frontend assets will be placed in `dist/`.  
The backend build artifacts will be placed in `backend/dist/`.

### 4.2 Backend Process Management (PM2)
Start the Express API server with PM2 cluster mode:

```bash
pm2 start backend/dist/server.js --name "medbazar-api" -i max --env production
pm2 save
pm2 startup
```

### 4.3 NGINX Reverse Proxy & Frontend Static Hosting
Sample NGINX configuration (`/etc/nginx/sites-available/medbazar.conf`):

```nginx
server {
    listen 80;
    server_name app.medbazar.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.medbazar.in;

    ssl_certificate /etc/letsencrypt/live/app.medbazar.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.medbazar.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend Single Page App
    root /var/www/medbazar/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

---

## 5. Security & Sensitive Asset Controls

### 5.1 Secret Management
1. Never commit `.env` or production credentials to git repositories (`.gitignore` enforces `.env*` exclusion).
2. Store production secrets in AWS Secrets Manager, HashiCorp Vault, or environment injection within CI/CD runners (e.g. GitHub Actions Encrypted Secrets).
3. Rotate `JWT_SECRET` and database credentials periodically without downtime using rolling cluster restarts.

### 5.2 Private Prescription Document Security
1. **Never upload health records to public directories**: All prescriptions are strictly written to private locations (e.g. `./storage/secure_prescriptions/`).
2. **Access Control**: Prescriptions can only be streamed via `GET /api/v1/prescriptions/:id/file`. Every request validates customer identity or assigned pharmacy organization access. Foreign tenants and untrusted users receive `403 Forbidden`.
3. **No Contents in Logs**: Server logs intentionally omit raw file contents and patient personal health data.

### 5.3 Payment Gateways & Webhooks
1. **Zero Raw Card Storage**: CVV, PINs, and full primary account numbers are never parsed or stored on Med Bazar servers.
2. **Truthful Provider Reporting**: In environments where payment gateways are not configured, `/api/v1/payments/config` truthfully returns `status: PENDING` and does not claim payments were charged.
3. **Webhook Idempotency**: All provider webhooks (`POST /api/v1/payments/webhook/:gateway`) authenticate signatures and enforce deduplication via `processedWebhookEventIds` to prevent duplicate ledger credits.

---

## 6. Logging, Monitoring & Auditability

1. **Structured Request Logging**: Morgan combined with custom Winston/Console loggers emits JSON logs with request timestamps, method, status code, latency, and sanitized query params.
2. **Error Boundary & Audit Ledger**: High-impact administrative actions, inventory movements (`StockMovement`), and POS adjustments write immutable entries to `audit_logs` in PostgreSQL.
3. **Monitoring Health Check**: Continuous uptime ping endpoint available at:
   - `GET /api/v1/health` (checks process uptime and PostgreSQL ping response time).
