#!/bin/bash

# Pokemon Game - Native Build Script
# Builds the C++ game as a native executable using SDL2

set -e

echo "🎮 Building Pokemon Game (Native C++ with SDL2)..."

# Check if SDL2 is installed
if ! command -v sdl2-config &> /dev/null; then
    echo "❌ Error: SDL2 not found!"
    echo "Please install SDL2:"
    echo ""
    echo "macOS:"
    echo "  brew install sdl2"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install libsdl2-dev"
    echo ""
    echo "Arch Linux:"
    echo "  sudo pacman -S sdl2"
    exit 1
fi

echo "✅ SDL2 found: $(sdl2-config --version)"

# Create build directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$SCRIPT_DIR/build_native"
cd "$SCRIPT_DIR/build_native"

# Create symlink to native CMake file if it doesn't exist
if [ ! -f "CMakeLists.txt" ]; then
    ln -s ../CMakeLists_native.txt CMakeLists.txt
fi

# Run CMake (use current directory with symlinked CMakeLists.txt)
echo "📦 Configuring with CMake..."
cmake -DCMAKE_BUILD_TYPE=Release .

# Build
echo "🔨 Compiling C++ code..."
make

echo ""
echo "✅ Build complete!"
echo ""
echo "🚀 Run the game:"
echo "   cd wasm && ./build_native/pokemon-game-native"
echo ""

