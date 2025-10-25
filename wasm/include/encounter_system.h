#ifndef POKEMON_ENCOUNTER_SYSTEM_H
#define POKEMON_ENCOUNTER_SYSTEM_H

#include "player_character.h"
#include "town_map.h"
#include <random>

namespace Pokemon {

class EncounterSystem {
public:
    EncounterSystem(float encounterRate, int maxPokemonId);

    EncounterResult rollEncounter(const TownMap& map,
                                  const PlayerCharacter& player,
                                  std::mt19937& rng) const;

private:
    float encounterRate_;
    int maxPokemonId_;
};

} // namespace Pokemon

#endif // POKEMON_ENCOUNTER_SYSTEM_H

