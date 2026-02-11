#!/bin/bash
set -e

NAME=$1
BRANCH=${2:-feat/$NAME}
BASE_DIR=$(cd "$(dirname "$0")/.." && pwd)
PARENT_DIR=$(dirname "$BASE_DIR")
WORKTREE_DIR="$PARENT_DIR/hongsoohyuk-$NAME"

if [ -z "$NAME" ]; then
  echo "Usage: pnpm worktree:create <name> [branch]"
  echo "Example: pnpm worktree:create test"
  exit 1
fi

echo "Creating worktree at $WORKTREE_DIR..."
git worktree add "$WORKTREE_DIR" -b "$BRANCH"

echo "Creating .env.local symlink..."
ln -s "$BASE_DIR/.env.local" "$WORKTREE_DIR/.env.local"

echo "Installing dependencies..."
cd "$WORKTREE_DIR" && pnpm install

echo ""
echo "Worktree created successfully!"
echo "  Path: $WORKTREE_DIR"
echo "  Branch: $BRANCH"
echo ""
echo "To start: cd $WORKTREE_DIR && pnpm dev"
