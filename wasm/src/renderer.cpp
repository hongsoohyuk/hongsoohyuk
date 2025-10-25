#include "renderer.h"
#include <algorithm>
#include <cstring>

namespace Pokemon {

Renderer::Renderer(int viewportWidth, int viewportHeight)
    : viewportWidth_(viewportWidth)
    , viewportHeight_(viewportHeight)
    , tilesX_(viewportWidth / TILE_SIZE)
    , tilesY_(viewportHeight / TILE_SIZE) {
}

void Renderer::setPixel(uint32_t* buffer, int x, int y, uint32_t color) {
    if (x >= 0 && x < viewportWidth_ && y >= 0 && y < viewportHeight_) {
        buffer[y * viewportWidth_ + x] = color;
    }
}

void Renderer::drawRect(uint32_t* buffer, int x, int y, int w, int h, uint32_t color) {
    for (int dy = 0; dy < h; ++dy) {
        for (int dx = 0; dx < w; ++dx) {
            setPixel(buffer, x + dx, y + dy, color);
        }
    }
}

void Renderer::drawCircle(uint32_t* buffer, int cx, int cy, int radius, uint32_t color) {
    for (int y = -radius; y <= radius; ++y) {
        for (int x = -radius; x <= radius; ++x) {
            if (x * x + y * y <= radius * radius) {
                setPixel(buffer, cx + x, cy + y, color);
            }
        }
    }
}

void Renderer::drawGrassPattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::GRASS);

    // Grass blades
    for (int i = 0; i < TILE_SIZE; i += 4) {
        drawRect(buffer, startX + i, startY + 10, 2, 4, GBCColor::GRASS_DARK);
        drawRect(buffer, startX + i + 2, startY + 6, 2, 4, GBCColor::GRASS_DARK);
    }
}

void Renderer::drawPathPattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::PATH);

    // Cobblestones
    drawRect(buffer, startX + 2, startY + 2, 5, 5, GBCColor::PATH_DARK);
    drawRect(buffer, startX + 9, startY + 2, 4, 4, GBCColor::PATH_DARK);
    drawRect(buffer, startX + 2, startY + 9, 4, 4, GBCColor::PATH_DARK);
    drawRect(buffer, startX + 8, startY + 8, 6, 6, GBCColor::PATH_DARK);
}

void Renderer::drawWaterPattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::WATER);

    // Water ripples
    drawCircle(buffer, startX + 5, startY + 5, 2, GBCColor::WATER_DARK);
    drawCircle(buffer, startX + 11, startY + 10, 2, GBCColor::WATER_DARK);
}

void Renderer::drawHousePattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::HOUSE);

    // House texture
    for (int y = 0; y < TILE_SIZE; y += 4) {
        for (int x = 0; x < TILE_SIZE; x += 4) {
            if ((x + y) % 8 == 0) {
                drawRect(buffer, startX + x, startY + y, 2, 2, GBCColor::HOUSE_DARK);
            }
        }
    }
}

void Renderer::drawTreePattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::TREE);

    // Tree foliage circles
    drawCircle(buffer, startX + 4, startY + 4, 3, GBCColor::TREE_DARK);
    drawCircle(buffer, startX + 12, startY + 4, 3, GBCColor::TREE_DARK);
    drawCircle(buffer, startX + 4, startY + 12, 3, GBCColor::TREE_DARK);
    drawCircle(buffer, startX + 12, startY + 12, 3, GBCColor::TREE_DARK);
}

void Renderer::drawFlowerPattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::FLOWER);

    // Flowers
    drawCircle(buffer, startX + 3, startY + 3, 2, GBCColor::FLOWER_ACCENT);
    drawCircle(buffer, startX + 3, startY + 3, 1, 0xFFF0D048);
    drawCircle(buffer, startX + 12, startY + 6, 2, GBCColor::FLOWER_ACCENT);
    drawCircle(buffer, startX + 12, startY + 6, 1, 0xFFF0D048);
    drawCircle(buffer, startX + 7, startY + 11, 2, GBCColor::FLOWER_ACCENT);
    drawCircle(buffer, startX + 7, startY + 11, 1, 0xFFF0D048);
}

void Renderer::drawPlazaPattern(uint32_t* buffer, int startX, int startY) {
    drawRect(buffer, startX, startY, TILE_SIZE, TILE_SIZE, GBCColor::PLAZA);

    // Plaza design
    drawRect(buffer, startX + 4, startY + 4, 8, 8, 0xFFB8B090);
    drawCircle(buffer, startX + 8, startY + 8, 2, 0xFFC0B898);
}

void Renderer::drawTile(uint32_t* buffer, int x, int y, TileType tile) {
    int startX = x * TILE_SIZE;
    int startY = y * TILE_SIZE;

    switch (tile) {
        case TileType::GRASS:
            drawGrassPattern(buffer, startX, startY);
            break;
        case TileType::PATH:
            drawPathPattern(buffer, startX, startY);
            break;
        case TileType::POND:
            drawWaterPattern(buffer, startX, startY);
            break;
        case TileType::HOUSE:
            drawHousePattern(buffer, startX, startY);
            break;
        case TileType::TREE:
            drawTreePattern(buffer, startX, startY);
            break;
        case TileType::FLOWER:
            drawFlowerPattern(buffer, startX, startY);
            break;
        case TileType::PLAZA:
            drawPlazaPattern(buffer, startX, startY);
            break;
    }
}

void Renderer::drawPlayer(uint32_t* buffer, int tileX, int tileY, Direction dir) {
    int centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
    int centerY = tileY * TILE_SIZE + TILE_SIZE / 2;
    int startX = centerX - PLAYER_SPRITE_SIZE / 2;
    int startY = centerY - PLAYER_SPRITE_SIZE / 2;

    // Simple player sprite (Pokémon Gold protagonist style)

    // Head
    drawRect(buffer, startX + 4, startY + 2, 8, 6, GBCColor::PLAYER_SKIN);

    // Hat
    drawRect(buffer, startX + 3, startY + 1, 10, 3, GBCColor::PLAYER_RED);
    drawRect(buffer, startX + 5, startY, 4, 1, GBCColor::PLAYER_WHITE);

    // Eyes (direction dependent)
    if (dir == Direction::DOWN) {
        setPixel(buffer, startX + 5, startY + 4, GBCColor::PLAYER_BLACK);
        setPixel(buffer, startX + 10, startY + 4, GBCColor::PLAYER_BLACK);
    } else if (dir == Direction::UP) {
        // Back of head
        drawRect(buffer, startX + 4, startY + 2, 8, 6, GBCColor::PLAYER_BLACK);
    } else if (dir == Direction::LEFT) {
        setPixel(buffer, startX + 5, startY + 4, GBCColor::PLAYER_BLACK);
    } else if (dir == Direction::RIGHT) {
        setPixel(buffer, startX + 10, startY + 4, GBCColor::PLAYER_BLACK);
    }

    // Body
    drawRect(buffer, startX + 4, startY + 8, 8, 4, GBCColor::PLAYER_BLUE);

    // Arms
    drawRect(buffer, startX + 2, startY + 8, 2, 4, GBCColor::PLAYER_SKIN);
    drawRect(buffer, startX + 12, startY + 8, 2, 4, GBCColor::PLAYER_SKIN);

    // Legs
    drawRect(buffer, startX + 4, startY + 12, 3, 3, GBCColor::PLAYER_BLACK);
    drawRect(buffer, startX + 9, startY + 12, 3, 3, GBCColor::PLAYER_BLACK);

    // Shoes
    drawRect(buffer, startX + 3, startY + 14, 4, 1, GBCColor::PLAYER_SHOE);
    drawRect(buffer, startX + 9, startY + 14, 4, 1, GBCColor::PLAYER_SHOE);
}

void Renderer::render(uint32_t* buffer, const TileType* map, int mapWidth, int mapHeight,
                      const Position& playerPos, Direction playerDir, bool isMoving) {
    // Calculate camera position (center on player)
    int cameraX = playerPos.x - tilesX_ / 2;
    int cameraY = playerPos.y - tilesY_ / 2;

    // Clamp camera to map bounds
    cameraX = std::max(0, std::min(cameraX, mapWidth - tilesX_));
    cameraY = std::max(0, std::min(cameraY, mapHeight - tilesY_));

    // Render tiles
    for (int y = 0; y < tilesY_; ++y) {
        for (int x = 0; x < tilesX_; ++x) {
            int mapX = cameraX + x;
            int mapY = cameraY + y;

            if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
                TileType tile = map[mapY * mapWidth + mapX];
                drawTile(buffer, x, y, tile);
            }
        }
    }

    // Render player (in viewport coordinates)
    int playerViewX = playerPos.x - cameraX;
    int playerViewY = playerPos.y - cameraY;

    if (playerViewX >= 0 && playerViewX < tilesX_ && playerViewY >= 0 && playerViewY < tilesY_) {
        drawPlayer(buffer, playerViewX, playerViewY, playerDir);
    }
}

void Renderer::renderTextBox(uint32_t* buffer, const char* text, int x, int y, int width, int height) {
    // Background
    drawRect(buffer, x, y, width, height, GBCColor::TEXT_BOX_BG);

    // Border
    // Top
    drawRect(buffer, x, y, width, 2, GBCColor::TEXT_BOX_BORDER);
    // Bottom
    drawRect(buffer, x, y + height - 2, width, 2, GBCColor::TEXT_BOX_BORDER);
    // Left
    drawRect(buffer, x, y, 2, height, GBCColor::TEXT_BOX_BORDER);
    // Right
    drawRect(buffer, x + width - 2, y, 2, height, GBCColor::TEXT_BOX_BORDER);
}

} // namespace Pokemon

