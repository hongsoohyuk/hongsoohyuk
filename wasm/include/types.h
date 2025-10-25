#ifndef POKEMON_TYPES_H
#define POKEMON_TYPES_H

#include <cstdint>

namespace Pokemon {

enum class TileType : uint8_t {
    HOUSE = 0,
    PLAZA = 1,
    PATH = 2,
    GRASS = 3,
    POND = 4,
    TREE = 5,
    FLOWER = 6
};

enum class Direction : uint8_t {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
};

struct Position {
    int32_t x;
    int32_t y;
};

struct Player {
    Position pos;
    Direction dir;
    bool isMoving;
};

struct EncounterResult {
    bool encountered;
    int32_t pokemonId;
};

} // namespace Pokemon

#endif // POKEMON_TYPES_H

