# 🎮 Pokemon Game - C++ Game Engine

This directory contains the C++ game engine that can be compiled for both:

1. **Native (SDL2)** - Fast development and debugging
2. **WebAssembly** - Web browser deployment

## 🚀 Quick Start

### Option 1: Native Development (Recommended for game dev)

```bash
# Install SDL2
brew install sdl2  # macOS

# Build and run
cd wasm
./build_native.sh
./build_native/pokemon-game-native
```

**Advantages:**

- ⚡ **Fast compile**: ~1 second
- 🐛 **Full debugging**: GDB/LLDB, breakpoints, watches
- 🎯 **Quick iteration**: No browser refresh needed
- 💪 **Better performance**: Native speed

### Option 2: Web (WASM)

```bash
cd wasm
./build.sh

# Then run Next.js dev server
cd ..
npm run dev
```

Visit: http://localhost:3000/pokemon/gold

## 📁 Project Structure

```
wasm/
├── include/              # C++ headers
│   ├── types.h          # Game types (TileType, Direction, etc)
│   ├── game.h           # Core game logic
│   ├── renderer.h       # Pixel-level rendering
│   └── game_engine.h    # Main game loop & state
│
├── src/                 # Shared C++ source (Native + WASM)
│   ├── game.cpp         # Game logic implementation
│   ├── renderer.cpp     # GBC-style pixel rendering
│   ├── game_engine.cpp  # Game loop & input
│   └── bindings.cpp     # Emscripten JS bindings (WASM only)
│
├── src_native/          # Native-only code
│   └── main.cpp         # SDL2 main loop
│
├── CMakeLists.txt       # Web/WASM build config (Emscripten)
├── CMakeLists_native.txt # Native build config (SDL2)
│
├── build.sh             # Build for WASM
├── build_native.sh      # Build for Native
│
├── build/               # WASM build artifacts (gitignored)
└── build_native/        # Native build artifacts (gitignored)
```

## 🎯 Development Workflow

### Recommended: Native → WASM

```bash
# 1. Develop in C++ with native build
vim wasm/src/game.cpp

# 2. Build and test (instant feedback!)
./build_native.sh && ./build_native/pokemon-game-native

# 3. Once working, compile for web
./build.sh

# 4. Test in browser
npm run dev
```

### Hot Reload (Advanced)

```bash
# Auto-rebuild on file changes
brew install nodemon  # or: npm install -g nodemon

cd wasm
nodemon --watch src --watch include --ext cpp,h \
  --exec './build_native.sh && ./build_native/pokemon-game-native || exit 1'
```

## 🎮 Game Controls

**Native (SDL2):**

- `WASD` or `Arrow Keys` - Move
- `Z` or `Enter` - A button
- `X` or `Backspace` - B button
- `ESC` - Quit

**Web (WASM):**

- Same as native, but `ESC` doesn't quit

## 🛠️ Build Systems

### Native Build (CMake + SDL2)

**Requirements:**

- CMake 3.10+
- SDL2
- C++17 compiler (GCC, Clang, MSVC)

**Output:**

- Executable: `build_native/pokemon-game-native`
- Size: ~500KB
- Performance: Native speed

### WASM Build (CMake + Emscripten)

**Requirements:**

- Emscripten SDK
- CMake 3.10+

**Output:**

- `public/wasm/pokemon-game.js` (~50KB)
- `public/wasm/pokemon-game.wasm` (~100KB)
- Performance: ~50-70% of native

## 🐛 Debugging

### Native (GDB/LLDB)

```bash
# Build with debug symbols
cd wasm/build_native
cmake -DCMAKE_BUILD_TYPE=Debug .
make

# Run with debugger
lldb pokemon-game-native
(lldb) b game.cpp:60     # Set breakpoint
(lldb) run               # Start
(lldb) print playerPos   # Inspect variables
```

### WASM (Browser DevTools)

1. Build with debug info: `./build.sh`
2. Open Chrome DevTools → Sources
3. Find C++ source files in file tree
4. Set breakpoints in C++ code

## 📊 Performance

| Metric       | Native | WASM   |
| ------------ | ------ | ------ |
| Compile time | ~1s    | ~5s    |
| Startup time | <1ms   | ~100ms |
| Frame time   | 0.5ms  | 1.2ms  |
| Memory       | 1MB    | 1.5MB  |

## 🎨 Adding New Features

### Example: Add a new tile type

**1. Define type** (`include/types.h`):

```cpp
enum class TileType : uint8_t {
    // ... existing
    CAVE = 7,
};
```

**2. Implement rendering** (`src/renderer.cpp`):

```cpp
void Renderer::drawTile(uint32_t* buffer, int x, int y, TileType tile) {
    // ...
    case TileType::CAVE:
        drawRect(buffer, startX, startY, 16, 16, 0xFF404040);
        // Add cave pattern...
        break;
}
```

**3. Test natively**:

```bash
./build_native.sh && ./build_native/pokemon-game-native
```

**4. Compile for web**:

```bash
./build.sh
npm run dev
```

## 🔧 Advanced Features

### Memory Profiling

```bash
# Valgrind (Linux)
valgrind --leak-check=full ./build_native/pokemon-game-native

# Instruments (macOS)
instruments -t "Allocations" ./build_native/pokemon-game-native
```

### Performance Profiling

```bash
# Linux
perf record ./build_native/pokemon-game-native
perf report

# macOS
instruments -t "Time Profiler" ./build_native/pokemon-game-native
```

### VSCode Integration

Add to `.vscode/launch.json`:

```json
{
  "name": "Debug Pokemon Game",
  "type": "cppdbg",
  "request": "launch",
  "program": "${workspaceFolder}/wasm/build_native/pokemon-game-native",
  "cwd": "${workspaceFolder}/wasm",
  "MIMode": "lldb"
}
```

## 📚 Documentation

- [Full Native Development Guide](./NATIVE_DEVELOPMENT.md)
- [WASM Integration Guide](../WASM_INTEGRATION.md)
- [Game Engine Architecture](../docs/CPP_GAME_ENGINE.md)

## 🎯 Next Steps

1. **Add battles** - Implement turn-based combat
2. **Inventory system** - Items and Pokéballs
3. **Save/Load** - Persistent game state
4. **Multiplayer** - SDL_net or WebSockets
5. **Level editor** - Design your own maps

Happy coding! 🚀
