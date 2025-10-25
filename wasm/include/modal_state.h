#ifndef POKEMON_MODAL_STATE_H
#define POKEMON_MODAL_STATE_H

#include "types.h"
#include <string>

namespace Pokemon {

class EncounterModal {
public:
    EncounterModal();

    void showEncounter(int pokemonId);
    void showMessage(const std::string& message);
    void hide();

    bool isVisible() const { return visible_; }
    EncounterResult getEncounter() const { return encounter_; }
    const std::string& getMessage() const { return message_; }

private:
    bool visible_;
    EncounterResult encounter_;
    std::string message_;
};

} // namespace Pokemon

#endif // POKEMON_MODAL_STATE_H

