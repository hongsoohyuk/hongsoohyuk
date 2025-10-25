#ifndef POKEMON_GAME_H
#define POKEMON_GAME_H

#include "encounter_system.h"
#include "player_character.h"
#include "town_map.h"
#include "types.h"
#include <random>

namespace Pokemon {

class Game {
private:
    static constexpr float ENCOUNTER_RATE = 0.30f;
    static constexpr int MAX_POKEMON_ID = 151;

    TownMap map_;
    PlayerCharacter player_;
    EncounterSystem encounterSystem_;
    std::mt19937 rng_;

public:
    Game();

    // Game state access
    int32_t getPlayerX() const { return player_.getPosition().x; }
    int32_t getPlayerY() const { return player_.getPosition().y; }
    uint8_t getPlayerDirection() const { return static_cast<uint8_t>(player_.getDirection()); }
    bool isPlayerMoving() const { return player_.isMoving(); }

    // Game actions
    bool movePlayer(int32_t dx, int32_t dy);
    EncounterResult checkEncounter();
    uint8_t getTileAt(int32_t x, int32_t y) const;

    // Map dimensions
    int32_t getMapWidth() const { return map_.getWidth(); }
    int32_t getMapHeight() const { return map_.getHeight(); }

    void reset();
};

} // namespace Pokemon

#endif // POKEMON_GAME_H
