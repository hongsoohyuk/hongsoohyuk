#include "encounter_system.h"
#include <random>

namespace Pokemon {

EncounterSystem::EncounterSystem(float encounterRate, int maxPokemonId)
    : encounterRate_(encounterRate), maxPokemonId_(maxPokemonId) {}

EncounterResult EncounterSystem::rollEncounter(const TownMap& map,
                                               const PlayerCharacter& player,
                                               std::mt19937& rng) const {
    EncounterResult result{false, 0};
    TileType currentTile = map.getTile(player.getPosition().x, player.getPosition().y);
    if (currentTile != TileType::GRASS) {
        return result;
    }

    std::uniform_real_distribution<float> chanceDist(0.0f, 1.0f);
    if (chanceDist(rng) > encounterRate_) {
        return result;
    }

    std::uniform_int_distribution<int> pokemonDist(1, maxPokemonId_);
    result.encountered = true;
    result.pokemonId = pokemonDist(rng);
    return result;
}

} // namespace Pokemon

