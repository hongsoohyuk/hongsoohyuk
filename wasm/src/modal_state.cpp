#include "modal_state.h"
#include <cstdio>

namespace Pokemon {

EncounterModal::EncounterModal()
    : visible_(false), encounter_{false, 0}, message_() {}

void EncounterModal::showEncounter(int pokemonId) {
    encounter_.encountered = true;
    encounter_.pokemonId = pokemonId;
    char buffer[128];
    std::snprintf(buffer, sizeof(buffer), "야생의 포켓몬 #%d 이(가) 나타났다!", pokemonId);
    message_ = buffer;
    visible_ = true;
}

void EncounterModal::showMessage(const std::string& message) {
    encounter_.encountered = false;
    encounter_.pokemonId = 0;
    message_ = message;
    visible_ = true;
}

void EncounterModal::hide() {
    visible_ = false;
    encounter_ = {false, 0};
    message_.clear();
}

} // namespace Pokemon

