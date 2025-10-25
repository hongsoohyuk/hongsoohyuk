# 🎮 Compiled WASM Files

이 폴더에는 C++로 작성된 포켓몬 게임 엔진이 WebAssembly로 컴파일된 파일들이 있습니다.

## 📦 파일 목록

- **pokemon-game.js** (45KB) - JavaScript 글루 코드
- **pokemon-game.wasm** (67KB) - 컴파일된 WebAssembly 바이너리

## 🔧 빌드가 필요한 경우

이 파일들은 **이미 빌드되어 있습니다**. 다음의 경우에만 다시 빌드하면 됩니다:

### C++ 코드를 수정했을 때

```bash
# 1. Emscripten 환경 로드
source ~/emsdk/emsdk_env.sh

# 2. WASM 빌드
npm run build:wasm

# 3. Git 커밋
git add public/wasm/
git commit -m "Update WASM build"
```

## ⚙️ 처음 개발 환경 설정

**팀원이 처음 프로젝트를 클론했을 때:**

```bash
# WASM 파일이 이미 커밋되어 있으므로
# 빌드 없이 바로 실행 가능!
npm install
npm run dev
```

**C++ 개발을 하고 싶다면:**

```bash
# Emscripten 설치 (한 번만)
git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
cd ~/emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## 📝 빌드 프로세스

```
C++ Source Code (wasm/src/*.cpp)
    ↓
Emscripten Compiler (emcc)
    ↓
WebAssembly Binary (pokemon-game.wasm)
    +
JavaScript Glue Code (pokemon-game.js)
    ↓
Browser Runtime
```

## 🚫 .gitignore 설정

```gitignore
# 중간 빌드 파일은 무시
/wasm/build/

# 최종 WASM 파일은 커밋
# /public/wasm/*.js   ← 주석 처리됨
# /public/wasm/*.wasm ← 주석 처리됨
```

## 📊 파일 크기 최적화

현재 설정:

- **최적화 레벨**: `-O3` (최대 최적화)
- **압축**: gzip으로 ~20KB까지 압축 가능
- **메모리**: 16MB 할당

더 최적화하려면:

```cmake
# wasm/CMakeLists.txt
-s TOTAL_MEMORY=16MB     # 메모리 줄이기
-Os                      # 크기 최적화
--closure 1              # Google Closure Compiler 사용
```

## 🔍 디버깅

WASM 파일이 로드되지 않으면:

```bash
# 파일 확인
ls -lh public/wasm/

# 파일이 없으면 빌드
npm run build:wasm

# 브라우저 콘솔 확인
# F12 → Console → 에러 메시지 확인
```

## 📚 더 알아보기

- [WASM_INTEGRATION.md](../../WASM_INTEGRATION.md) - WASM 통합 가이드
- [CPP_GAME_ENGINE.md](../../docs/CPP_GAME_ENGINE.md) - C++ 엔진 문서
- [wasm/README.md](../../wasm/README.md) - C++ 개발 가이드
