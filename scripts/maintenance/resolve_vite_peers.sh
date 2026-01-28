#!/bin/bash
# -----------------------------------------------------------------------------
# PEER DEPENDENCY RESOLUTION
# Context: Upgrades Core TS/Node types to satisfy Vite 7.x requirements
# -----------------------------------------------------------------------------

echo ">> Forcing upgrade of core compiler dependencies..."

# We explicitly request 'latest' to override package.json pinning
pnpm add -D \
  typescript@latest \
  @types/node@latest \
  @types/react@latest \
  @types/react-dom@latest

echo ">> verifying version alignment..."
pnpm list typescript @types/node

# Run Syncpack to ensure package.json is formatted and organized (since you installed it)
echo ">> normalizing package.json via syncpack..."
pnpm syncpack format
