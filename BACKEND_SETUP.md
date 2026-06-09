# 🚀 Backend Deployment Guide — Firebase Auth + PHP/MySQL

## Architecture Overview

```
Browser (React App)
    │
    ├── Firebase Auth SDK  ←── Handles login/register/Google OAuth/password reset
    │       │
    │       └── Issues Firebase ID Token (JWT, auto-refreshed)
    │
    └── PHP REST API  ←── All data: products, orders, cart, reviews, settings...
            │
            ├── Verifies Firebase ID Token on every request (no extra SDK needed)
            └── Reads/writes MySQL database
```

---

## Step 1 — Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it (e.g. `precision-tool-lab`)
3. In **Authentication** → **Sign-in method**, enable:
   - ✅ **Email/Password**
   - ✅ **Google**
4. Go to **Project Settings** → **General** → scroll to **"Your apps"**
5. Click **"Web"** icon (`</>`) and register your app
6. Copy the `firebaseConfig` values

---

## Step 2 — Frontend Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123

# Your PHP backend URL (without trailing slash)
VITE_API_BASE_URL=https://yourdomain.com/api

# Comment out or remove for LIVE mode:
# VITE_API_MODE=mock
```

> **Development mode**: Leave `VITE_API_MODE=mock` (or no `VITE_API_BASE_URL`) to use localStorage — no backend needed.

---

## Step 3 — PHP Backend Deployment

### Upload Files

Upload the entire `backend/` folder to your hosting. Recommended paths:

| Hosting Type | Suggested Path |
|---|---|
| cPanel Shared | `public_html/api/` |
| Subdomain | `api.yourdomain.com/` (document root) |
| VPS/Nginx | `/var/www/api/` (with proxy config) |

### Set Environment Variables

In your PHP hosting control panel or `.htaccess`, set:

```apache
SetEnv FIREBASE_PROJECT_ID  your-project-id
SetEnv DB_HOST               localhost
SetEnv DB_NAME               precision_tool_lab
SetEnv DB_USER               your_db_user
SetEnv DB_PASS               your_db_password
```

Or use a `backend/config/env.php` file (not web-accessible):
```php
putenv('FIREBASE_PROJECT_ID=your-project-id');
putenv('DB_HOST=localhost');
// etc.
```

---

## Step 4 — MySQL Database Setup

1. In your hosting control panel (cPanel/phpMyAdmin), create a new database: `precision_tool_lab`
2. Create a database user and grant all privileges to this database
3. Import the schema:

```bash
mysql -u your_user -p precision_tool_lab < backend/database/schema.sql
```

Or use phpMyAdmin → Import → select `schema.sql`

---

## Step 5 — Make First User Admin

After registering your admin account through the website:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

---

## Step 6 — Test the Integration

1. Visit your site and register/log in
2. Check browser DevTools → Network tab
3. API requests should show `Authorization: Bearer eyJ...` header
4. PHP backend should return real MySQL data

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `401 Unauthorized` from API | Firebase project ID mismatch — check `FIREBASE_PROJECT_ID` env var |
| `CORS error` | Add your frontend domain to `Access-Control-Allow-Origin` in `backend/index.php` |
| `Database connection failed` | Check DB credentials and that MySQL user has privileges |
| `Failed to fetch Firebase certs` | PHP server needs outbound HTTPS access (`allow_url_fopen = On`) |
| Login works but data is mock | `VITE_API_MODE=mock` is still set — remove it from `.env` |

---

## File Structure

```
precision-tool-lab/
├── src/
│   ├── lib/
│   │   ├── firebase.js          ← Firebase app init
│   │   ├── firebaseAuth.js      ← All auth operations
│   │   └── AuthContext.jsx      ← React auth state (Firebase listener)
│   └── api/
│       └── apiClient.js         ← PHP API client (with Firebase token)
├── backend/
│   ├── index.php                ← API router
│   ├── .htaccess                ← Apache rewrite rules
│   ├── config/
│   │   ├── database.php         ← MySQL PDO connection
│   │   └── firebase.php         ← Firebase token verifier (no SDK needed)
│   ├── middleware/
│   │   └── auth.php             ← requireAuth() / requireAdmin()
│   ├── api/
│   │   ├── auth.php             ← /auth/me, /auth/sync
│   │   ├── entities.php         ← Generic CRUD for all entities
│   │   ├── settings.php         ← /settings GET/PUT
│   │   └── contact.php          ← /contact GET/POST
│   └── database/
│       └── schema.sql           ← Full MySQL schema + default data
├── .env.example                 ← Copy to .env and fill in values
└── BACKEND_SETUP.md             ← This file
```
