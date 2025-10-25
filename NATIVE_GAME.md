# 🎮 Native C++ Pokemon Game

네이티브 C++ 버전으로 게임을 개발하고 플레이하는 방법입니다.

## 🚀 빠른 시작

### 1. SDL2 설치

**macOS:**

```bash
brew install sdl2 cmake
```

**Ubuntu/Debian:**

```bash
sudo apt-get install libsdl2-dev cmake build-essential
```

**Arch Linux:**

```bash
sudo pacman -S sdl2 cmake base-devel
```

**Windows (MSYS2/MinGW):**

```bash
pacman -S mingw-w64-x86_64-SDL2 mingw-w64-x86_64-cmake
```

### 2. 빌드 및 실행

```bash
# 프로젝트 루트에서
npm run game

# 또는 수동으로
cd wasm
./build_native.sh
./build_native/pokemon-game-native
```

## 🎯 왜 네이티브로 개발하나요?

### 웹 vs 네이티브 비교

| 특징               | 웹 (WASM) | 네이티브 (SDL2)   |
| ------------------ | --------- | ----------------- |
| **컴파일 속도**    | ~5초      | ~1초 ⚡           |
| **시작 시간**      | ~100ms    | <1ms              |
| **디버깅**         | 제한적    | GDB/LLDB 💪       |
| **프로파일링**     | 제한적    | Valgrind, perf 💪 |
| **성능**           | ~60%      | 100% 🚀           |
| **핫리로드**       | ❌        | ✅                |
| **브레이크포인트** | 제한적    | 완벽 ✅           |

### 개발 워크플로우

```
편집 → 빌드 (1초) → 테스트 → 반복
```

웹 버전은 완성 후에만 빌드!

## 🎮 게임 조작법

- **이동**: `WASD` 또는 방향키
- **A 버튼**: `Z` 또는 `Enter`
- **B 버튼**: `X` 또는 `Backspace`
- **종료**: `ESC`

## 🛠️ 개발 가이드

### 프로젝트 구조

```
wasm/
├── src/                # 게임 로직 (공유)
│   ├── game.cpp       # ← 여기서 개발!
│   ├── renderer.cpp   # ← 렌더링 수정!
│   └── game_engine.cpp
│
├── src_native/        # 네이티브 전용
│   └── main.cpp      # SDL2 메인 루프
│
└── include/          # 헤더 파일
    ├── game.h
    ├── renderer.h
    └── types.h
```

### 새로운 기능 추가하기

#### 예제: 새로운 타일 타입 추가

**1. 타입 정의** (`include/types.h`):

```cpp
enum class TileType : uint8_t {
    // ... existing
    CAVE = 7,  // 새로운 타입!
};
```

**2. 렌더링 구현** (`src/renderer.cpp`):

```cpp
void Renderer::drawTile(uint32_t* buffer, int x, int y, TileType tile) {
    // ...
    case TileType::CAVE:
        // 동굴 타일 그리기
        drawRect(buffer, startX, startY, 16, 16, 0xFF404040);
        // 패턴 추가...
        break;
}
```

**3. 맵에 추가** (`src/game.cpp`):

```cpp
static const TileType MAP_LAYOUT[10][10] = {
    {TileType::CAVE, TileType::PATH, ...},
    // ...
};
```

**4. 테스트**:

```bash
npm run game
```

완벽하게 동작하면 웹으로 컴파일:

```bash
npm run build:wasm
```

### 빠른 이터레이션

**방법 1: 수동**

```bash
# 수정 후
npm run game
```

**방법 2: Hot Reload (자동)**

```bash
# nodemon 설치 (한 번만)
npm install -g nodemon

# 파일 변경 감지 & 자동 빌드
cd wasm
nodemon --watch src --watch include --ext cpp,h \
  --exec './build_native.sh && ./build_native/pokemon-game-native'
```

파일을 저장하면 자동으로 재빌드 & 실행!

### alias 추가 (선택사항)

`~/.zshrc` 또는 `~/.bashrc`에 추가:

```bash
# Pokemon Game 개발
alias pgame='cd ~/dev/hongsoohyuk && npm run game'
alias pbuild='cd ~/dev/hongsoohyuk/wasm && ./build_native.sh'
alias pwasm='cd ~/dev/hongsoohyuk && npm run build:wasm'
```

이제 어디서든:

```bash
pgame     # 게임 실행
pbuild    # 빌드만
pwasm     # WASM 빌드
```

## 🐛 디버깅

### 기본 디버깅 (로그)

```cpp
#include <iostream>

void Game::movePlayer(int32_t dx, int32_t dy) {
    std::cout << "Move player: " << dx << ", " << dy << std::endl;
    std::cout << "Current pos: " << player_.pos.x << ", " << player_.pos.y << std::endl;
    // ...
}
```

빌드 & 실행:

```bash
npm run game
```

### GDB/LLDB 디버거

**Debug 빌드:**

```bash
cd wasm/build_native
cmake -DCMAKE_BUILD_TYPE=Debug .
make
```

**LLDB 사용 (macOS):**

```bash
lldb ./pokemon-game-native

(lldb) b game.cpp:60        # 브레이크포인트 설정
(lldb) run                   # 실행
(lldb) print player_.pos     # 변수 확인
(lldb) next                  # 다음 줄
(lldb) step                  # 함수 안으로
(lldb) continue              # 계속
```

**GDB 사용 (Linux):**

```bash
gdb ./pokemon-game-native

(gdb) break game.cpp:60
(gdb) run
(gdb) print player_.pos
```

### VSCode 디버거 설정

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Pokemon Game",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/wasm/build_native/pokemon-game-native",
      "args": [],
      "stopAtEntry": false,
      "cwd": "${workspaceFolder}/wasm",
      "environment": [],
      "externalConsole": false,
      "MIMode": "lldb", // macOS: "lldb", Linux: "gdb"
      "preLaunchTask": "build-native"
    }
  ]
}
```

`.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-native",
      "type": "shell",
      "command": "cd wasm && ./build_native.sh",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

이제 VSCode에서 `F5`로 디버깅!

## 📊 성능 프로파일링

### Valgrind (메모리 누수 검사)

```bash
# Linux only
valgrind --leak-check=full ./build_native/pokemon-game-native
```

### Instruments (macOS)

```bash
# Time Profiler
instruments -t "Time Profiler" ./build_native/pokemon-game-native

# Allocations
instruments -t "Allocations" ./build_native/pokemon-game-native
```

### perf (Linux)

```bash
# 프로파일링 데이터 수집
perf record -g ./build_native/pokemon-game-native

# 결과 분석
perf report
```

## 🎨 게임 개발 예제

### 예제 1: 플레이어 속도 변경

`include/game_engine.h`:

```cpp
class GameEngine {
private:
    float playerSpeed_ = 4.0f;  // 타일/초
```

`src/game_engine.cpp`:

```cpp
void GameEngine::update(float deltaTime) {
    // 실제 속도 적용 로직 추가
}
```

### 예제 2: 새로운 입력 추가

`src_native/main.cpp`:

```cpp
case SDLK_SPACE:
    std::cout << "Player jumped!" << std::endl;
    // 점프 로직...
    break;
```

### 예제 3: FPS 제한 제거/변경

`src_native/main.cpp`에서:

```cpp
SDL_Renderer* renderer = SDL_CreateRenderer(
    window,
    -1,
    SDL_RENDERER_ACCELERATED  // PRESENTVSYNC 제거
);
```

또는 프레임 제한 직접 구현:

```cpp
const float TARGET_FPS = 60.0f;
const float FRAME_TIME = 1.0f / TARGET_FPS;

// 게임 루프에서
if (deltaTime < FRAME_TIME) {
    SDL_Delay((FRAME_TIME - deltaTime) * 1000);
}
```

## 🚀 웹으로 배포

게임이 완성되면 웹으로 컴파일:

```bash
# 1. WASM 빌드
npm run build:wasm

# 2. 웹 서버 실행
npm run dev

# 3. 브라우저에서 확인
# http://localhost:3000/pokemon/gold
```

모든 코드가 그대로 동작합니다! (SDL2 → WebAssembly 자동 변환)

## 📚 더 알아보기

- [WASM 통합 가이드](./WASM_INTEGRATION.md)
- [네이티브 개발 상세 가이드](./wasm/NATIVE_DEVELOPMENT.md)
- [C++ 게임 엔진 아키텍처](./docs/CPP_GAME_ENGINE.md)

## 🎯 다음 단계

### 기본 기능

- [ ] 배틀 시스템
- [ ] 인벤토리 & 아이템
- [ ] NPC 대화
- [ ] 저장/로드

### 고급 기능

- [ ] AI (NPC 이동 패턴)
- [ ] 맵 에디터
- [ ] 사운드 (SDL_mixer)
- [ ] 멀티플레이어 (SDL_net)

## ⚡ 성능 팁

1. **Release 빌드 사용**

   ```bash
   cd wasm/build_native
   cmake -DCMAKE_BUILD_TYPE=Release .
   make
   ```

2. **프로파일링으로 병목 찾기**
   - Instruments (macOS)
   - perf (Linux)
   - gprof (크로스 플랫폼)

3. **메모리 할당 최소화**

   ```cpp
   // Bad: 매 프레임 할당
   std::vector<Tile> tiles = getTiles();

   // Good: 한 번만 할당
   std::vector<Tile> tiles_;  // 멤버 변수
   ```

4. **불필요한 렌더링 피하기**
   ```cpp
   if (!needsRedraw) return;
   ```

Happy coding! 게임 개발을 즐기세요! 🎮✨
