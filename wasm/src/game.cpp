#include "game.h"

#include <chrono>

namespace Pokemon {

Game::Game()
    : encounterSystem_(ENCOUNTER_RATE, MAX_POKEMON_ID) {
    auto seed = std::chrono::high_resolution_clock::now().time_since_epoch().count();
    rng_.seed(static_cast<unsigned int>(seed));
    player_.reset({3, 2});
}

bool Game::movePlayer(int32_t dx, int32_t dy) {
    return player_.tryMove(dx, dy, map_);
}

EncounterResult Game::checkEncounter() {
    return encounterSystem_.rollEncounter(map_, player_, rng_);
}

uint8_t Game::getTileAt(int32_t x, int32_t y) const {
    if (x < 0 || x >= map_.getWidth() || y < 0 || y >= map_.getHeight()) {
        return static_cast<uint8_t>(TileType::PATH);
    }
    return static_cast<uint8_t>(map_.getTile(x, y));
}

void Game::reset() {
    player_.reset({3, 2});
}

} // namespace Pokemon
