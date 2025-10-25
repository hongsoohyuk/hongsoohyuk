#include "game.h"
#include "game_engine.h"

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>

using namespace emscripten;
using namespace Pokemon;

// Wrapper for EncounterResult to expose to JavaScript
struct EncounterResultJS {
    bool encountered;
    int pokemonId;

    // Default constructor (required by value_object)
    EncounterResultJS() : encountered(false), pokemonId(0) {}

    // Constructor from C++ EncounterResult
    EncounterResultJS(const EncounterResult& result)
        : encountered(result.encountered), pokemonId(result.pokemonId) {}
};

// Wrapper for GameEngine to handle pixel buffer
class GameEngineWrapper {
private:
    GameEngine engine_;
    std::vector<uint32_t> pixelBuffer_;

public:
    GameEngineWrapper(int width, int height)
        : engine_(width, height) {
        pixelBuffer_.resize(width * height);
    }

    // Get pixel buffer as typed array view
    val getPixelBuffer() {
        engine_.render(pixelBuffer_.data());
        return val(typed_memory_view(pixelBuffer_.size(), pixelBuffer_.data()));
    }

    void update(float deltaTime) { engine_.update(deltaTime); }
    void handleInput(int keyCode, bool pressed) { engine_.handleInput(keyCode, pressed); }
    bool movePlayer(int dx, int dy) { return engine_.movePlayer(dx, dy); }
    void pressA() { engine_.pressA(); }
    void pressB() { engine_.pressB(); }

    int getPlayerX() const { return engine_.getPlayerX(); }
    int getPlayerY() const { return engine_.getPlayerY(); }
    uint8_t getPlayerDirection() const { return engine_.getPlayerDirection(); }
    int getMapWidth() const { return engine_.getMapWidth(); }
    int getMapHeight() const { return engine_.getMapHeight(); }
    int getViewportWidth() const { return engine_.getViewportWidth(); }
    int getViewportHeight() const { return engine_.getViewportHeight(); }
    uint32_t getFrameCount() const { return engine_.getFrameCount(); }

    bool isEncounterModalVisible() const { return engine_.isEncounterModalVisible(); }
    EncounterResultJS getModalEncounter() const { return EncounterResultJS(engine_.getModalEncounter()); }
    std::string getModalMessage() const { return engine_.getModalMessage(); }
    void dismissEncounterModal() { engine_.dismissEncounterModal(); }

    void reset() { engine_.reset(); }
};

EMSCRIPTEN_BINDINGS(pokemon_game) {
    // Original Game class (for backward compatibility)
    class_<Game>("Game")
        .constructor<>()
        .function("getPlayerX", &Game::getPlayerX)
        .function("getPlayerY", &Game::getPlayerY)
        .function("getPlayerDirection", &Game::getPlayerDirection)
        .function("isPlayerMoving", &Game::isPlayerMoving)
        .function("movePlayer", &Game::movePlayer)
        .function("getTileAt", &Game::getTileAt)
        .function("getMapWidth", &Game::getMapWidth)
        .function("getMapHeight", &Game::getMapHeight)
        .function("reset", &Game::reset)
        .function("checkEncounter", optional_override([](Game& game) {
            auto result = game.checkEncounter();
            return EncounterResultJS(result);
        }));

    // New GameEngine with rendering
    class_<GameEngineWrapper>("GameEngine")
        .constructor<int, int>()
        .function("getPixelBuffer", &GameEngineWrapper::getPixelBuffer)
        .function("update", &GameEngineWrapper::update)
        .function("handleInput", &GameEngineWrapper::handleInput)
        .function("movePlayer", &GameEngineWrapper::movePlayer)
        .function("pressA", &GameEngineWrapper::pressA)
        .function("pressB", &GameEngineWrapper::pressB)
        .function("getPlayerX", &GameEngineWrapper::getPlayerX)
        .function("getPlayerY", &GameEngineWrapper::getPlayerY)
        .function("getPlayerDirection", &GameEngineWrapper::getPlayerDirection)
        .function("getMapWidth", &GameEngineWrapper::getMapWidth)
        .function("getMapHeight", &GameEngineWrapper::getMapHeight)
        .function("getViewportWidth", &GameEngineWrapper::getViewportWidth)
        .function("getViewportHeight", &GameEngineWrapper::getViewportHeight)
        .function("getFrameCount", &GameEngineWrapper::getFrameCount)
        .function("isEncounterModalVisible", &GameEngineWrapper::isEncounterModalVisible)
        .function("getModalEncounter", &GameEngineWrapper::getModalEncounter)
        .function("getModalMessage", &GameEngineWrapper::getModalMessage)
        .function("dismissEncounterModal", &GameEngineWrapper::dismissEncounterModal)
        .function("reset", &GameEngineWrapper::reset);

    value_object<EncounterResultJS>("EncounterResult")
        .field("encountered", &EncounterResultJS::encountered)
        .field("pokemonId", &EncounterResultJS::pokemonId);
}
