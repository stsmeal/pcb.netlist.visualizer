#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
DOMAIN=dev.local
CERT_FILE=local-cert.crt
KEY_FILE=local-cert.key
CONFIG_FILE=local-cert.cnf

echo "🔐 Generating local cert for *.$DOMAIN and $DOMAIN..."

# === Write OpenSSL config ===
cat <<EOF > $CONFIG_FILE
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = US
ST = Local
L = Local
O = Local
CN = *.$DOMAIN

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.$DOMAIN
DNS.2 = $DOMAIN
EOF

echo "✅ OpenSSL config written to $CONFIG_FILE"

# === Generate cert and key ===
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $KEY_FILE -out $CERT_FILE \
  -config $CONFIG_FILE
