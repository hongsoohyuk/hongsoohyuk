#ifndef POKEMON_GAME_ENGINE_H
#define POKEMON_GAME_ENGINE_H

#include "game.h"
#include "modal_state.h"
#include "renderer.h"
#include <cstdint>
#include <memory>
#include <string>

namespace Pokemon {

enum class GameState {
    EXPLORING,
    MENU,
    BATTLE,
    DIALOG
};

class GameEngine {
private:
    std::unique_ptr<Game> game_;
    std::unique_ptr<Renderer> renderer_;
    GameState state_;
    EncounterModal encounterModal_;
    uint32_t frameCount_;

    void showEncounter(int pokemonId);
    void showMessage(const char* message);
    void hideMessage();

public:
    GameEngine(int viewportWidth, int viewportHeight);
    ~GameEngine();

    // Core game loop
    void update(float deltaTime);
    void render(uint32_t* buffer);

    // Input handling
    void handleInput(int keyCode, bool pressed);
    bool movePlayer(int dx, int dy);
    void pressA();
    void pressB();

    // State management
    void setState(GameState state);
    GameState getState() const { return state_; }

    // Getters
    int getPlayerX() const { return game_->getPlayerX(); }
    int getPlayerY() const { return game_->getPlayerY(); }
    uint8_t getPlayerDirection() const { return game_->getPlayerDirection(); }
    int getMapWidth() const { return game_->getMapWidth(); }
    int getMapHeight() const { return game_->getMapHeight(); }
    int getViewportWidth() const { return renderer_->getViewportWidth(); }
    int getViewportHeight() const { return renderer_->getViewportHeight(); }
    uint32_t getFrameCount() const { return frameCount_; }

    bool isEncounterModalVisible() const { return encounterModal_.isVisible(); }
    EncounterResult getModalEncounter() const { return encounterModal_.getEncounter(); }
    const std::string& getModalMessage() const { return encounterModal_.getMessage(); }
    void dismissEncounterModal();

    // Reset
    void reset();
};

} // namespace Pokemon

#endif // POKEMON_GAME_ENGINE_H
