#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Precision Tool Lab — VPS Full Setup Script
# Run this on Hostinger VPS as root
# Ubuntu 24.04 LTS
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

echo "🚀 Starting Precision Tool Lab VPS Setup..."
echo "============================================"

# ── 1. System Update ─────────────────────────────────────────────
echo ""
echo "📦 Step 1: Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ── 2. Install Nginx ─────────────────────────────────────────────
echo ""
echo "🌐 Step 2: Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "✅ Nginx installed: $(nginx -v 2>&1)"

# ── 3. Install PHP 8.2 + Extensions ──────────────────────────────
echo ""
echo "🐘 Step 3: Installing PHP 8.2..."
apt-get install -y php8.2 php8.2-fpm php8.2-mysql php8.2-curl \
  php8.2-json php8.2-mbstring php8.2-xml php8.2-zip php8.2-gd
systemctl enable php8.2-fpm
systemctl start php8.2-fpm
echo "✅ PHP installed: $(php -v | head -1)"

# ── 4. Install MySQL ─────────────────────────────────────────────
echo ""
echo "🗄️ Step 4: Installing MySQL..."
apt-get install -y mysql-server
systemctl enable mysql
systemctl start mysql

# Create database and user
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS precision_tool_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'ptl_user'@'localhost' IDENTIFIED BY 'PtlSecure2024!';
GRANT ALL PRIVILEGES ON precision_tool_lab.* TO 'ptl_user'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "✅ MySQL installed + database created"

# ── 5. Install Node.js 20 ─────────────────────────────────────────
echo ""
echo "🟢 Step 5: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "✅ Node.js installed: $(node -v)"

# ── 6. Create Directory Structure ─────────────────────────────────
echo ""
echo "📁 Step 6: Creating directory structure..."
mkdir -p /var/www/html/tsttools
mkdir -p /var/www/html/tsttools/api
chown -R www-data:www-data /var/www/html/tsttools
chmod -R 755 /var/www/html/tsttools
echo "✅ Directories created"

# ── 7. Configure Nginx ────────────────────────────────────────────
echo ""
echo "⚙️ Step 7: Configuring Nginx..."
cat > /etc/nginx/sites-available/tsttools <<'NGINX'
server {
    listen 80;
    server_name 187.77.144.153 tsttools.com www.tsttools.com;
    root /var/www/html/tsttools;
    index index.html index.php;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # React Router — all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # PHP Backend API
    location /api/ {
        root /var/www/html/tsttools;
        try_files $uri $uri/ /api/index.php?$query_string;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;

            # PHP environment variables for Firebase + DB
            fastcgi_param FIREBASE_PROJECT_ID "precision-tool-lab-ae";
            fastcgi_param DB_HOST "localhost";
            fastcgi_param DB_NAME "precision_tool_lab";
            fastcgi_param DB_USER "ptl_user";
            fastcgi_param DB_PASS "PtlSecure2024!";
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
NGINX

# Enable site
ln -sf /etc/nginx/sites-available/tsttools /etc/nginx/sites-enabled/tsttools
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx
echo "✅ Nginx configured"

# ── 8. Generate SSH Key for GitHub Actions ───────────────────────
echo ""
echo "🔑 Step 8: Generating SSH key for GitHub Actions..."
ssh-keygen -t ed25519 -C "github-actions-deploy" -f /root/.ssh/github_deploy -N ""
cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

echo ""
echo "════════════════════════════════════════════════"
echo "✅ VPS SETUP COMPLETE!"
echo "════════════════════════════════════════════════"
echo ""
echo "📋 Database Credentials:"
echo "   DB Name: precision_tool_lab"
echo "   DB User: ptl_user"
echo "   DB Pass: PtlSecure2024!"
echo ""
echo "🔑 GitHub Actions SSH Private Key (copy this to GitHub Secrets as VPS_SSH_KEY):"
echo "────────────────────────────────────────────────"
cat /root/.ssh/github_deploy
echo "────────────────────────────────────────────────"
echo ""
echo "🌐 GitHub Secrets to set:"
echo "   VPS_HOST: 187.77.144.153"
echo "   VPS_USER: root"
echo "   VPS_PORT: 22"
echo "   VPS_FRONTEND_PATH: /var/www/html/tsttools"
echo "   VPS_BACKEND_PATH:  /var/www/html/tsttools/api"
echo "   VITE_API_BASE_URL: http://187.77.144.153/api"
echo ""
echo "🎉 Next step: Add these secrets to GitHub and push to deploy!"
