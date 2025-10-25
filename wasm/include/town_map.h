#ifndef POKEMON_TOWN_MAP_H
#define POKEMON_TOWN_MAP_H

#include "types.h"
#include <array>

namespace Pokemon {

class TownMap {
public:
    static constexpr int WIDTH = 10;
    static constexpr int HEIGHT = 10;

    TownMap();

    TileType getTile(int x, int y) const;
    bool isWalkable(int x, int y) const;
    bool isWalkable(TileType tile) const;

    int getWidth() const { return WIDTH; }
    int getHeight() const { return HEIGHT; }

private:
    std::array<std::array<TileType, WIDTH>, HEIGHT> tiles_;
};

} // namespace Pokemon

#endif // POKEMON_TOWN_MAP_H

