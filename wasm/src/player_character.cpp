#include "player_character.h"
#include <algorithm>

namespace Pokemon {

PlayerCharacter::PlayerCharacter()
    : position_{3, 2}, direction_(Direction::DOWN), isMoving_(false) {}

bool PlayerCharacter::tryMove(int dx, int dy, const TownMap& map) {
    updateDirection(dx, dy);

    if (dx == 0 && dy == 0) {
        isMoving_ = false;
        return false;
    }

    int newX = std::clamp(position_.x + dx, 0, map.getWidth() - 1);
    int newY = std::clamp(position_.y + dy, 0, map.getHeight() - 1);

    if (newX == position_.x && newY == position_.y) {
        isMoving_ = false;
        return false;
    }

    if (!map.isWalkable(newX, newY)) {
        isMoving_ = false;
        return false;
    }

    position_.x = newX;
    position_.y = newY;
    isMoving_ = true;
    return true;
}

void PlayerCharacter::reset(const Position& spawnPoint) {
    position_ = spawnPoint;
    direction_ = Direction::DOWN;
    isMoving_ = false;
}

void PlayerCharacter::updateDirection(int dx, int dy) {
    if (dx > 0) {
        direction_ = Direction::RIGHT;
    } else if (dx < 0) {
        direction_ = Direction::LEFT;
    } else if (dy > 0) {
        direction_ = Direction::DOWN;
    } else if (dy < 0) {
        direction_ = Direction::UP;
    }
}

} // namespace Pokemon

