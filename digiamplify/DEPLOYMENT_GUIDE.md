# DigiAmplify Live Production Deployment Guide

This document provides exact, battle-tested, step-by-step instructions to deploy DigiAmplify to the live production domain **`digiamplify.com`** (and `www.digiamplify.com`) on your Ubuntu VPS.

---

## 📋 Infrastructure & Port Overview

| Service | Test Domain (`test.digiamplify.com`) | Production Domain (`digiamplify.com`) |
| :--- | :--- | :--- |
| **Directory** | `/var/www/digiamplify` | `/var/www/digiamplify-prod` |
| **Backend Port** | `5015` | `5016` |
| **Frontend Port** | `3015` | `3016` |
| **MySQL Database** | `digiamplify_db` | `digiamplify_prod_db` |
| **MySQL User** | `digiamplify_user` | `digiamplify_prod_user` |
| **PM2 Process Names** | `digiamplify-backend`, `digiamplify-frontend` | `digiamplify-prod-backend`, `digiamplify-prod-frontend` |

---

## 🚀 Pre-Deployment Prerequisites

Before running deployment commands on the server:

1. **DNS Setup**:
   * Add **A Record**: `@` $\rightarrow$ `72.62.135.129`
   * Add **A Record**: `www` $\rightarrow$ `72.62.135.129`
   * Wait 2–5 minutes for DNS propagation.

2. **Git Repository**:
   * Ensure all latest changes are committed and pushed to `origin/main` on GitHub.

---

## 🛠️ Step-by-Step Production Deployment

### Step 1: Clone Repository on Server

```bash
cd /var/www
git clone https://github.com/hamza566-cyber/digiamplify.git digiamplify-prod
```

---

### Step 2: Set Up Dedicated MySQL Database & User

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS digiamplify_prod_db;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'digiamplify_prod_user'@'localhost' IDENTIFIED BY 'C0ll@ersw00d'; GRANT ALL PRIVILEGES ON digiamplify_prod_db.* TO 'digiamplify_prod_user'@'localhost'; FLUSH PRIVILEGES;"
```

---

### Step 3: Create Backend Environment Configuration

```bash
cat << 'EOF' > /var/www/digiamplify-prod/digiamplify/backend/.env
PORT=5016
DATABASE_URL="mysql://digiamplify_prod_user:C0ll%40ersw00d@localhost:3306/digiamplify_prod_db"
JWT_SECRET="prod-jwt-secret-key-digiamplify-2026-secure"
ADMIN_EMAIL="admin@digiamplify.com"
ADMIN_PASSWORD="admin123"
EOF
```

---

### Step 4: Install Dependencies & Sync Database Schema

```bash
cd /var/www/digiamplify-prod/digiamplify
npm install
cd backend
npx prisma db push
```

---

### Step 5: Initialize Production Clean Admin User

```bash
cd /var/www/digiamplify-prod/digiamplify/backend
cat << 'EOF' > create_admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@digiamplify.com';
  const pass = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(pass, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'Admin',
      },
    });
    console.log('✅ Production Admin created:', email);
  } else {
    console.log('ℹ️ Admin user already exists:', email);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
EOF

node create_admin.js
rm create_admin.js
```

---

### Step 6: Build Production Applications

```bash
cd /var/www/digiamplify-prod/digiamplify
npm run build
```

---

### Step 7: Configure & Start PM2 Ecosystem

```bash
cat << 'EOF' > /var/www/digiamplify-prod/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'digiamplify-prod-backend',
      cwd: '/var/www/digiamplify-prod/digiamplify/backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5016
      }
    },
    {
      name: 'digiamplify-prod-frontend',
      cwd: '/var/www/digiamplify-prod/digiamplify/frontend',
      script: '../../node_modules/next/dist/bin/next',
      args: 'start -p 3016',
      env: {
        NODE_ENV: 'production',
        PORT: 3016
      }
    }
  ]
};
EOF

pm2 start /var/www/digiamplify-prod/ecosystem.config.js
pm2 save
```

---

### Step 8: Configure Nginx Reverse Proxy & Enable SSL

```bash
cat << 'EOF' > /etc/nginx/sites-available/digiamplify.com
server {
    server_name digiamplify.com www.digiamplify.com;

    location /api {
        proxy_pass http://127.0.0.1:5016;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3016;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/digiamplify.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Issue SSL Certificate:
```bash
certbot --nginx -d digiamplify.com -d www.digiamplify.com
```

---

## 🔄 Future Production Updates Routine

Whenever you push updates to GitHub in the future:

```bash
cd /var/www/digiamplify-prod
git pull
cd digiamplify
npm run build
pm2 restart /var/www/digiamplify-prod/ecosystem.config.js
```

---

## ✅ Verification Checklist

* [ ] `pm2 list` shows `digiamplify-prod-backend` and `digiamplify-prod-frontend` ONLINE.
* [ ] `curl -i http://127.0.0.1:5016/health` returns `200 OK`.
* [ ] Visit `https://digiamplify.com/login` and log in with `admin@digiamplify.com` / `admin123`.
