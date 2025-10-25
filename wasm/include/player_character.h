#ifndef POKEMON_PLAYER_CHARACTER_H
#define POKEMON_PLAYER_CHARACTER_H

#include "town_map.h"

namespace Pokemon {

class PlayerCharacter {
public:
    PlayerCharacter();

    bool tryMove(int dx, int dy, const TownMap& map);
    void reset(const Position& spawnPoint);

    const Position& getPosition() const { return position_; }
    Direction getDirection() const { return direction_; }
    bool isMoving() const { return isMoving_; }

private:
    Position position_;
    Direction direction_;
    bool isMoving_;

    void updateDirection(int dx, int dy);
};

} // namespace Pokemon

#endif // POKEMON_PLAYER_CHARACTER_H

