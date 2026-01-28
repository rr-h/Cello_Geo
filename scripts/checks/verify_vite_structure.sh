#!/bin/bash
# Checks if index.html is in the correct location for Vite

if [ -f "./index.html" ]; then
    echo "✅ [OK] index.html found in project root."
elif [ -f "./public/index.html" ]; then
    echo "❌ [ACTION REQUIRED] index.html is still in ./public/."
    echo "   Moving it now..."
    mv ./public/index.html ./index.html
    echo "   ...Moved."
else
    echo "⚠️ [WARNING] index.html not found in root or public."
fi

# Check for %PUBLIC_URL% in index.html which breaks Vite
if grep -q "%PUBLIC_URL%" ./index.html; then
    echo "❌ [ACTION REQUIRED] Found '%PUBLIC_URL%' in index.html."
    echo "   Vite requires relative paths (e.g., '/favicon.ico' instead of '%PUBLIC_URL%/favicon.ico')."
    echo "   Please edit index.html and remove all instances of %PUBLIC_URL%."
fi
