cmake_minimum_required(VERSION 3.10)
project(PokemonGame)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/town_map.cpp
    src/player_character.cpp
    src/encounter_system.cpp
    src/modal_state.cpp
    src/game.cpp
    src/renderer.cpp
    src/game_engine.cpp
    src/bindings.cpp
)

# Emscripten output
add_executable(pokemon-game ${SOURCES})

# Emscripten flags for optimization and bindings
set_target_properties(pokemon-game PROPERTIES
    LINK_FLAGS "\
        -lembind \
        -s WASM=1 \
        -s MODULARIZE=1 \
        -s EXPORT_ES6=0 \
        -s EXPORT_NAME='createPokemonGame' \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s TOTAL_MEMORY=16MB \
        -s ENVIRONMENT='web' \
        -O3 \
        --bind"
)

# Output directory
set_target_properties(pokemon-game PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../public/wasm"
)
