#!/bin/bash

# setup_https.sh
# Automates Nginx and Certbot setup for calldoc.co.kr

set -e

DOMAIN="calldoc.co.kr"
EMAIL="tester@calldoc.co.kr" # Change this if needed, or Certbot will ask interactively if omitted (but we use flags here)

echo "Starting HTTPS setup for $DOMAIN..."

# 1. Update and Install Dependencies
echo "Installing Nginx and Certbot..."
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# 2. Configure Firewall (UFW)
if ufw status | grep -q "Status: active"; then
    echo "Configuring UFW..."
    ufw allow 'Nginx Full'
fi

# 3. Create Nginx Configuration
echo "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 4. Enable Configuration
echo "Enabling site..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 5. Test and Reload Nginx
echo "Testing Nginx configuration..."
nginx -t
systemctl reload nginx

# 6. Obtain SSL Certificate
echo "Obtaining SSL certificate with Certbot..."
# We use --register-unsafely-without-email to avoid prompts in automatic scripts if email isn't critical,
# OR we can ask user efficiently. For a script intended for manual run, we can let it be interactive or use flags.
# Using --nginx plugin automatically edits the config to add ssl directives.
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo "----------------------------------------------------------------"
echo "HTTPS Setup Complete for https://$DOMAIN"
echo "Nginx is now proxying requests to http://localhost:3000"
echo "----------------------------------------------------------------"
