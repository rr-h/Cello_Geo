#!/bin/bash
# -----------------------------------------------------------------------------
# NETWORK STABILISATION AND DEPENDENCY REFRESH PROTOCOL
# Target System: Arch Linux
# Context: Fixes ECONNRESET/SOCKET_TIMEOUT on registry.npmjs.org
# -----------------------------------------------------------------------------

# 1. Configuration Hardening
# Increase fetch retries and timeouts to mitigate transient network partitions.
# The default timeout is often too aggressive for unstable uplinks.
echo ">> Reconfiguring pnpm network parameters..."
pnpm config set fetch-retries 5
pnpm config set fetch-retry-mintimeout 20000
pnpm config set fetch-retry-maxtimeout 120000

# 2. Registry Mirror (Optional but recommended if default registry persists in failure)
# If the primary registry node is rejecting the handshake, switch to a mirror.
# Uncomment the line below if errors persist.
# pnpm config set registry https://registry.npmmirror.com

# 3. Cache Purge
# Corruption in the metadata cache can cause pnpm to falsely report "up to date".
echo ">> Purging metadata cache..."
pnpm store prune

# 4. Dependency Re-evaluation
# Remove lockfile and modules to force a fresh resolution graph.
# This ensures that 'Already up to date' is a factual statement, not a cache fallback.
echo ">> Resetting dependency graph..."
rm -rf node_modules pnpm-lock.yaml

# 5. Execution
# Attempt installation with elevated verbosity to trap network layer failures.
echo ">> Initiating fresh installation..."
pnpm install --reporter=append-only

# 6. Auditing
# Check for outdated packages explicitly now that connectivity is assumed stable.
echo ">> Auditing outdated packages..."
pnpm outdated
