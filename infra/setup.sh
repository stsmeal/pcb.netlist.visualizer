#!/usr/bin/env bash
set -euo pipefail

echo "Checking OS..."
OS="$(uname -s)"
ARCH="$(uname -m)"
echo "OS: $OS"
echo "ARCH: $ARCH"

echo "Checking if Make is installed..."
if ! command -v make >/dev/null 2>&1; then
  echo "Installing Make..."
  if [[ "$OS" == "Darwin" ]]; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "Homebrew not found — installing Homebrew first..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    brew install make
  else
    echo "❌ Unsupported OS: $OS"
    exit 1
  fi
else
  echo "✅ Make is already installed."
fi

echo "Updating /etc/hosts file..."
update_hosts() {
  local hosts_file="/etc/hosts"
  local dev_local_entry="127.0.0.1 dev.local"
  local api_dev_local_entry="127.0.0.1 api.dev.local"
  
  # Check if dev.local entry exists
  if ! grep -q "dev.local" "$hosts_file"; then
    echo "Adding dev.local to /etc/hosts..."
    echo "$dev_local_entry" | sudo tee -a "$hosts_file" > /dev/null
    echo "✅ Added dev.local to /etc/hosts"
  else
    echo "✅ dev.local already exists in /etc/hosts"
  fi
  
  # Check if api.dev.local entry exists
  if ! grep -q "api.dev.local" "$hosts_file"; then
    echo "Adding api.dev.local to /etc/hosts..."
    echo "$api_dev_local_entry" | sudo tee -a "$hosts_file" > /dev/null
    echo "✅ Added api.dev.local to /etc/hosts"
  else
    echo "✅ api.dev.local already exists in /etc/hosts"
  fi
}

update_hosts

echo "Running Makefile..."
make

echo "✅ Done!"