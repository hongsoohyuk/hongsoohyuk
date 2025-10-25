#!/bin/bash

# Pokemon Game - WASM Build Script
# Requires Emscripten SDK (emsdk) to be installed and activated

set -e

echo "🎮 Building Pokemon Game Engine (C++ → WASM)..."

# Check if emscripten is available
if ! command -v emcc &> /dev/null; then
    if [[ "${CI:-}" == "true" || -n "${VERCEL:-}" ]]; then
        echo "⚠️  Emscripten (emcc) not found in CI environment – skipping WASM rebuild."
        echo "    Using precompiled artifacts committed under public/wasm/."
        exit 0
    fi

    echo "❌ Error: Emscripten (emcc) not found!"
    echo "Please install Emscripten SDK from: https://emscripten.org/docs/getting_started/downloads.html"
    echo ""
    echo "Quick install:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# Create build directory
cd "$(dirname "$0")"
mkdir -p build
cd build

# Run CMake with Emscripten toolchain
echo "📦 Configuring with CMake..."
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release

# Build
echo "🔨 Compiling C++ to WebAssembly..."
emmake make

# Files are already output to the correct location via CMakeLists.txt
echo "✅ Build complete! WASM files are in public/wasm/"
ls -lh ../../public/wasm/pokemon-game.*
