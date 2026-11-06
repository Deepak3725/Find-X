#!/bin/sh
# Copies only the public website files into dist/ for Netlify or Cloudflare Pages.
# Documentation, editor settings and Git files are never published.
set -e
rm -rf dist
mkdir dist
cp -R index.html 404.html _headers css js assets .well-known dist/
find dist -name 'desktop.ini' -delete
find dist -name '.DS_Store' -delete
find dist -name 'Thumbs.db' -delete
echo "Build complete: dist/ is ready to publish."
