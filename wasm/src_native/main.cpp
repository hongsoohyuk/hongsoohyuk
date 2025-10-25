#include <SDL2/SDL.h>
#include <iostream>
#include <chrono>
#include <cstring>
#include "../include/game_engine.h"

using namespace Pokemon;

const int GAME_WIDTH = 160;
const int GAME_HEIGHT = 144;
const int SCALE = 4; // 4배 크기로 표시
const int WINDOW_WIDTH = GAME_WIDTH * SCALE;
const int WINDOW_HEIGHT = GAME_HEIGHT * SCALE;

int main(int argc, char* argv[]) {
    // SDL 초기화
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        std::cerr << "SDL 초기화 실패: " << SDL_GetError() << std::endl;
        return 1;
    }

    // 윈도우 생성
    SDL_Window* window = SDL_CreateWindow(
        "Pokemon Gold - C++ Native",
        SDL_WINDOWPOS_CENTERED,
        SDL_WINDOWPOS_CENTERED,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        SDL_WINDOW_SHOWN
    );

    if (!window) {
        std::cerr << "윈도우 생성 실패: " << SDL_GetError() << std::endl;
        SDL_Quit();
        return 1;
    }

    // 렌더러 생성
    SDL_Renderer* renderer = SDL_CreateRenderer(
        window,
        -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC
    );

    if (!renderer) {
        std::cerr << "렌더러 생성 실패: " << SDL_GetError() << std::endl;
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    // 텍스처 생성 (픽셀 버퍼용)
    SDL_Texture* texture = SDL_CreateTexture(
        renderer,
        SDL_PIXELFORMAT_RGBA8888,
        SDL_TEXTUREACCESS_STREAMING,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    if (!texture) {
        std::cerr << "텍스처 생성 실패: " << SDL_GetError() << std::endl;
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    std::cout << "✅ SDL 초기화 완료!" << std::endl;
    std::cout << "🎮 Pokemon Gold 게임 시작!" << std::endl;
    std::cout << "\n조작법:" << std::endl;
    std::cout << "  WASD 또는 방향키 - 이동" << std::endl;
    std::cout << "  Z - A 버튼" << std::endl;
    std::cout << "  X - B 버튼" << std::endl;
    std::cout << "  ESC - 종료\n" << std::endl;

    // 게임 엔진 생성
    GameEngine engine(GAME_WIDTH, GAME_HEIGHT);

    // 게임 루프
    bool running = true;
    SDL_Event event;

    auto lastTime = std::chrono::high_resolution_clock::now();
    int frameCount = 0;
    auto lastFpsTime = lastTime;

    while (running) {
        // 이벤트 처리
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                running = false;
            } else if (event.type == SDL_KEYDOWN) {
                switch (event.key.keysym.sym) {
                    case SDLK_ESCAPE:
                        running = false;
                        break;
                    case SDLK_UP:
                    case SDLK_w:
                        engine.movePlayer(0, -1);
                        break;
                    case SDLK_DOWN:
                    case SDLK_s:
                        engine.movePlayer(0, 1);
                        break;
                    case SDLK_LEFT:
                    case SDLK_a:
                        engine.movePlayer(-1, 0);
                        break;
                    case SDLK_RIGHT:
                    case SDLK_d:
                        engine.movePlayer(1, 0);
                        break;
                    case SDLK_z:
                    case SDLK_RETURN:
                        engine.pressA();
                        break;
                    case SDLK_x:
                    case SDLK_BACKSPACE:
                        engine.pressB();
                        break;
                }
            }
        }

        // 시간 계산
        auto currentTime = std::chrono::high_resolution_clock::now();
        float deltaTime = std::chrono::duration<float>(currentTime - lastTime).count();
        lastTime = currentTime;

        // 게임 업데이트
        engine.update(deltaTime);

        // 픽셀 버퍼를 텍스처로 복사
        uint32_t* pixels;
        int pitch;
        SDL_LockTexture(texture, nullptr, (void**)&pixels, &pitch);

        // C++ 엔진에서 렌더링된 픽셀 버퍼 가져오기
        std::vector<uint32_t> pixelBuffer(GAME_WIDTH * GAME_HEIGHT);
        engine.render(pixelBuffer.data());

        // 픽셀 복사 (RGBA 형식)
        // C++ engine uses RGBA8888 format: 0xRRGGBBAA
        // SDL expects RGBA8888 as well in this pixel format
        std::memcpy(pixels, pixelBuffer.data(), pixelBuffer.size() * sizeof(uint32_t));

        SDL_UnlockTexture(texture);

        // 화면에 렌더링
        SDL_RenderClear(renderer);
        SDL_RenderCopy(renderer, texture, nullptr, nullptr);
        SDL_RenderPresent(renderer);

        // FPS 계산
        frameCount++;
        auto fpsDuration = std::chrono::duration<float>(currentTime - lastFpsTime).count();
        if (fpsDuration >= 1.0f) {
            std::cout << "FPS: " << frameCount << " | Frame: " << engine.getFrameCount()
                     << " | Player: (" << engine.getPlayerX() << ", " << engine.getPlayerY() << ")"
                     << std::endl;
            frameCount = 0;
            lastFpsTime = currentTime;
        }
    }

    // 정리
    SDL_DestroyTexture(texture);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    std::cout << "\n게임 종료!" << std::endl;
    return 0;
}

