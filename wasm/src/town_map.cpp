#include "town_map.h"

namespace Pokemon {

namespace {
using LayoutRow = std::array<TileType, TownMap::WIDTH>;

constexpr LayoutRow row0 = {TileType::TREE, TileType::TREE, TileType::HOUSE, TileType::HOUSE,
                            TileType::TREE, TileType::PATH, TileType::GRASS, TileType::GRASS,
                            TileType::GRASS, TileType::GRASS};
constexpr LayoutRow row1 = {TileType::TREE, TileType::FLOWER, TileType::HOUSE, TileType::PLAZA,
                            TileType::PATH, TileType::PATH, TileType::GRASS, TileType::GRASS,
                            TileType::POND, TileType::POND};
constexpr LayoutRow row2 = {TileType::PATH, TileType::PATH, TileType::PATH, TileType::PATH,
                            TileType::PATH, TileType::FLOWER, TileType::GRASS, TileType::GRASS,
                            TileType::POND, TileType::POND};
constexpr LayoutRow row3 = {TileType::PATH, TileType::PLAZA, TileType::FLOWER, TileType::PLAZA,
                            TileType::PATH, TileType::PATH, TileType::PATH, TileType::GRASS,
                            TileType::GRASS, TileType::GRASS};
constexpr LayoutRow row4 = {TileType::PATH, TileType::PATH, TileType::PATH, TileType::PLAZA,
                            TileType::PLAZA, TileType::TREE, TileType::PATH, TileType::GRASS,
                            TileType::GRASS, TileType::GRASS};
constexpr LayoutRow row5 = {TileType::GRASS, TileType::GRASS, TileType::PATH, TileType::PATH,
                            TileType::PATH, TileType::PATH, TileType::PATH, TileType::GRASS,
                            TileType::TREE, TileType::TREE};
constexpr LayoutRow row6 = {TileType::GRASS, TileType::GRASS, TileType::GRASS, TileType::PATH,
                            TileType::FLOWER, TileType::GRASS, TileType::GRASS, TileType::GRASS,
                            TileType::TREE, TileType::TREE};
constexpr LayoutRow row7 = {TileType::GRASS, TileType::GRASS, TileType::GRASS, TileType::PATH,
                            TileType::PATH, TileType::GRASS, TileType::GRASS, TileType::GRASS,
                            TileType::GRASS, TileType::GRASS};
constexpr LayoutRow row8 = {TileType::POND, TileType::POND, TileType::GRASS, TileType::GRASS,
                            TileType::PATH, TileType::PATH, TileType::GRASS, TileType::GRASS,
                            TileType::GRASS, TileType::GRASS};
constexpr LayoutRow row9 = {TileType::POND, TileType::POND, TileType::GRASS, TileType::GRASS,
                            TileType::GRASS, TileType::PATH, TileType::PATH, TileType::PATH,
                            TileType::FLOWER, TileType::GRASS};

constexpr std::array<LayoutRow, TownMap::HEIGHT> MAP_LAYOUT = {
    row0, row1, row2, row3, row4, row5, row6, row7, row8, row9};
} // namespace

TownMap::TownMap() : tiles_(MAP_LAYOUT) {}

TileType TownMap::getTile(int x, int y) const {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
        return TileType::PATH;
    }
    return tiles_[static_cast<size_t>(y)][static_cast<size_t>(x)];
}

bool TownMap::isWalkable(int x, int y) const {
    return isWalkable(getTile(x, y));
}

bool TownMap::isWalkable(TileType tile) const {
    switch (tile) {
        case TileType::PATH:
        case TileType::PLAZA:
        case TileType::GRASS:
        case TileType::FLOWER:
            return true;
        case TileType::HOUSE:
        case TileType::POND:
        case TileType::TREE:
        default:
            return false;
    }
}

} // namespace Pokemon

