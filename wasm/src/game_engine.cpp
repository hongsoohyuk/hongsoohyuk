#include "game_engine.h"

#include <string>
#include <vector>

namespace Pokemon {

GameEngine::GameEngine(int viewportWidth, int viewportHeight)
    : game_(std::make_unique<Game>())
    , renderer_(std::make_unique<Renderer>(viewportWidth, viewportHeight))
    , state_(GameState::EXPLORING)
    , encounterModal_()
    , frameCount_(0) {
}

GameEngine::~GameEngine() = default;

void GameEngine::update(float deltaTime) {
    frameCount_++;

    // Game logic updates here
    // For now, just increment frame counter
}

void GameEngine::render(uint32_t* buffer) {
    // Get map data from game
    const int mapWidth = game_->getMapWidth();
    const int mapHeight = game_->getMapHeight();

    // Create tile array
    std::vector<TileType> tileMap;
    tileMap.reserve(mapWidth * mapHeight);

    for (int y = 0; y < mapHeight; ++y) {
        for (int x = 0; x < mapWidth; ++x) {
            uint8_t tileValue = game_->getTileAt(x, y);
            tileMap.push_back(static_cast<TileType>(tileValue));
        }
    }

    // Render game world
    Position playerPos = {game_->getPlayerX(), game_->getPlayerY()};
    Direction playerDir = static_cast<Direction>(game_->getPlayerDirection());

    renderer_->render(buffer, tileMap.data(), mapWidth, mapHeight,
                     playerPos, playerDir, game_->isPlayerMoving());

    // Render text box if modal is showing (simple visual hint for native builds)
    if (encounterModal_.isVisible()) {
        int textBoxHeight = 48;
        int textBoxY = renderer_->getViewportHeight() - textBoxHeight - 8;
        renderer_->renderTextBox(buffer, encounterModal_.getMessage().c_str(),
                                8, textBoxY,
                                renderer_->getViewportWidth() - 16, textBoxHeight);
    }
}

void GameEngine::handleInput(int keyCode, bool pressed) {
    if (!pressed) return;

    // KeyCode mapping (standard browser keycodes)
    // 37: Left, 38: Up, 39: Right, 40: Down
    // 90: Z (A button), 88: X (B button)

    switch (keyCode) {
        case 37: // Left
        case 65: // A key
            movePlayer(-1, 0);
            break;
        case 38: // Up
        case 87: // W key
            movePlayer(0, -1);
            break;
        case 39: // Right
        case 68: // D key
            movePlayer(1, 0);
            break;
        case 40: // Down
        case 83: // S key
            movePlayer(0, 1);
            break;
        case 90: // Z
        case 13: // Enter
            pressA();
            break;
        case 88: // X
        case 8:  // Backspace
            pressB();
            break;
    }
}

bool GameEngine::movePlayer(int dx, int dy) {
    if (state_ != GameState::EXPLORING) return false;

    bool moved = game_->movePlayer(dx, dy);

    if (moved) {
        // Check for encounter
        auto encounter = game_->checkEncounter();
        if (encounter.encountered) {
            showEncounter(encounter.pokemonId);
        }
    }

    return moved;
}

void GameEngine::pressA() {
    if (encounterModal_.isVisible()) {
        dismissEncounterModal();
    } else if (state_ == GameState::EXPLORING) {
        // Check if player is in grass
        int tileType = game_->getTileAt(game_->getPlayerX(), game_->getPlayerY());
        if (tileType == static_cast<int>(TileType::GRASS)) {
            auto encounter = game_->checkEncounter();
            if (encounter.encountered) {
                showEncounter(encounter.pokemonId);
            } else {
                showMessage("주변에 포켓몬이 보이지 않는다...");
            }
        }
    }
}

void GameEngine::pressB() {
    if (encounterModal_.isVisible()) {
        dismissEncounterModal();
    }
}

void GameEngine::setState(GameState state) {
    state_ = state;
}

void GameEngine::showMessage(const char* message) {
    encounterModal_.showMessage(message ? std::string(message) : std::string());
    setState(GameState::DIALOG);
}

void GameEngine::hideMessage() {
    encounterModal_.hide();
    setState(GameState::EXPLORING);
}

void GameEngine::showEncounter(int pokemonId) {
    encounterModal_.showEncounter(pokemonId);
    setState(GameState::DIALOG);
}

void GameEngine::dismissEncounterModal() {
    hideMessage();
}

void GameEngine::reset() {
    game_->reset();
    setState(GameState::EXPLORING);
    hideMessage();
    frameCount_ = 0;
}

} // namespace Pokemon
