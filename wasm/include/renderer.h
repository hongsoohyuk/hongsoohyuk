#ifndef POKEMON_RENDERER_H
#define POKEMON_RENDERER_H

#include "types.h"
#include <cstdint>
#include <vector>

namespace Pokemon {

// Game Boy Color palette colors
namespace GBCColor {
    constexpr uint32_t DARK_GREEN = 0xFF0F380F;
    constexpr uint32_t MID_GREEN = 0xFF306230;
    constexpr uint32_t LIGHT_GREEN = 0xFF8BAC0F;
    constexpr uint32_t LIGHTEST_GREEN = 0xFF9BBC0F;

    constexpr uint32_t GRASS = 0xFF58A850;
    constexpr uint32_t GRASS_DARK = 0xFF387830;
    constexpr uint32_t PATH = 0xFFA89060;
    constexpr uint32_t PATH_DARK = 0xFF786030;
    constexpr uint32_t WATER = 0xFF5090C8;
    constexpr uint32_t WATER_DARK = 0xFF3068A8;
    constexpr uint32_t HOUSE = 0xFFC0A888;
    constexpr uint32_t HOUSE_DARK = 0xFF906848;
    constexpr uint32_t TREE = 0xFF307840;
    constexpr uint32_t TREE_DARK = 0xFF184820;
    constexpr uint32_t FLOWER = 0xFF78C850;
    constexpr uint32_t FLOWER_ACCENT = 0xFFF8A8D8;
    constexpr uint32_t PLAZA = 0xFFD0C8A8;

    constexpr uint32_t PLAYER_RED = 0xFFD63031;
    constexpr uint32_t PLAYER_BLUE = 0xFF0984E3;
    constexpr uint32_t PLAYER_SKIN = 0xFFF5D5A8;
    constexpr uint32_t PLAYER_BLACK = 0xFF1A1A1A;
    constexpr uint32_t PLAYER_WHITE = 0xFFFFFFFF;
    constexpr uint32_t PLAYER_SHOE = 0xFF636E72;

    constexpr uint32_t TEXT_BOX_BG = 0xFFF8F0C0;
    constexpr uint32_t TEXT_BOX_BORDER = 0xFF9F8A4B;
    constexpr uint32_t TEXT_COLOR = 0xFF1F2D17;
}

class Renderer {
private:
    static constexpr int TILE_SIZE = 16;
    static constexpr int PLAYER_SPRITE_SIZE = 16;

    int viewportWidth_;
    int viewportHeight_;
    int tilesX_;
    int tilesY_;

    void drawTile(uint32_t* buffer, int x, int y, TileType tile);
    void drawPlayer(uint32_t* buffer, int x, int y, Direction dir);
    void drawGrassPattern(uint32_t* buffer, int startX, int startY);
    void drawPathPattern(uint32_t* buffer, int startX, int startY);
    void drawWaterPattern(uint32_t* buffer, int startX, int startY);
    void drawHousePattern(uint32_t* buffer, int startX, int startY);
    void drawTreePattern(uint32_t* buffer, int startX, int startY);
    void drawFlowerPattern(uint32_t* buffer, int startX, int startY);
    void drawPlazaPattern(uint32_t* buffer, int startX, int startY);

    void setPixel(uint32_t* buffer, int x, int y, uint32_t color);
    void drawRect(uint32_t* buffer, int x, int y, int w, int h, uint32_t color);
    void drawCircle(uint32_t* buffer, int cx, int cy, int radius, uint32_t color);

public:
    Renderer(int viewportWidth, int viewportHeight);

    // Main render function - returns pointer to pixel buffer
    void render(uint32_t* buffer, const TileType* map, int mapWidth, int mapHeight,
                const Position& playerPos, Direction playerDir, bool isMoving);

    void renderTextBox(uint32_t* buffer, const char* text, int x, int y, int width, int height);

    int getViewportWidth() const { return viewportWidth_; }
    int getViewportHeight() const { return viewportHeight_; }
    int getTilesX() const { return tilesX_; }
    int getTilesY() const { return tilesY_; }
};

} // namespace Pokemon

#endif // POKEMON_RENDERER_H

