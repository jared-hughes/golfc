#!/bin/bash
set -euo pipefail

if (($# != 1)); then
    echo "Expected one arg, e.g. ./scripts.release.sh 0.12.3"
    exit 1
fi

version="$1"

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
  echo "Version must look like '0.13.4' but got '$version'"
  exit 1
fi

echo "Releasing version '$version'"

echo "Updating package version"
npm --no-git-tag-version version "$version"

git add -A
git commit -m "Prepare v$version"

echo "Building for Chrome"
rm -rf dist
npm run build

echo "Next steps:"
echo "1. \`npm publish\`"
echo "2. \`git push\`"
echo "3. Make a GitHub release"
