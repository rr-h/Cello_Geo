#!/bin/bash
# -----------------------------------------------------------------------------
# ARCHITECTURAL MIGRATION: CRA (Webpack) -> VITE (ESBuild/Rollup)
# Context: Replaces build system and test runner (Jest -> Vitest)
# -----------------------------------------------------------------------------

# 1. Purge Legacy Toolchain
echo ">> Dismantling Webpack/CRA scaffolding..."
pnpm remove react-scripts

# 2. Inject Vite Ecosystem
# - vite: Core bundler
# - @vitejs/plugin-react: Official React HMR plugin
# - vite-tsconfig-paths: Resolves TS aliases (if any)
# - vitest: Native test runner (Jest replacement)
# - jsdom: Browser environment simulation for tests
# - @testing-library/*: Testing utilities (ensuring compatibility)
echo ">> Injecting Vite and Vitest dependencies..."
pnpm add -D \
  vite \
  @vitejs/plugin-react \
  vite-tsconfig-paths \
  vitest \
  jsdom \
  @testing-library/jest-dom \
  @testing-library/react \
  @types/node

# 3. Filesystem Restructuring
# Vite serves index.html from root, not /public.
if [ -f "public/index.html" ]; then
    echo ">> Relocating entry point (index.html)..."
    mv public/index.html ./index.html
else
    echo "!! public/index.html not found. Check if already moved."
fi

# 4. Script Redefinition
# Modifying package.json scripts to invoke Vite binary.
echo ">> Rewiring npm scripts..."
npm pkg set scripts.start="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.serve="vite preview"
npm pkg set scripts.test="vitest"

echo ">> Migration dependency phase complete."
