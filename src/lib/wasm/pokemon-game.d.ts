// TypeScript definitions for Pokemon Game WASM module

export interface PokemonGameModule {
  Game: new () => PokemonGame;
  GameEngine: new (width: number, height: number) => GameEngine;
}

export interface PokemonGame {
  // Player state
  getPlayerX(): number;
  getPlayerY(): number;
  getPlayerDirection(): number; // 0=UP, 1=DOWN, 2=LEFT, 3=RIGHT
  isPlayerMoving(): boolean;

  // Game actions
  movePlayer(dx: number, dy: number): boolean;
  checkEncounter(): EncounterResult;
  getTileAt(x: number, y: number): number;

  // Map info
  getMapWidth(): number;
  getMapHeight(): number;

  // Utility
  reset(): void;
  delete(): void; // Emscripten cleanup
}

export interface GameEngine {
  // Rendering
  getPixelBuffer(): Uint32Array;

  // Game loop
  update(deltaTime: number): void;
  handleInput(keyCode: number, pressed: boolean): void;

  // Actions
  movePlayer(dx: number, dy: number): boolean;
  pressA(): void;
  pressB(): void;

  // State
  getPlayerX(): number;
  getPlayerY(): number;
  getPlayerDirection(): number;
  getMapWidth(): number;
  getMapHeight(): number;
  getViewportWidth(): number;
  getViewportHeight(): number;
  getFrameCount(): number;

  // Encounter modal
  isEncounterModalVisible(): boolean;
  getModalEncounter(): EncounterResult;
  getModalMessage(): string;
  dismissEncounterModal(): void;

  // Utility
  reset(): void;
  delete(): void;
}

export interface EncounterResult {
  encountered: boolean;
  pokemonId: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DirectionEnum = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
} as const;

export const TileTypeEnum = {
  HOUSE: 0,
  PLAZA: 1,
  PATH: 2,
  GRASS: 3,
  POND: 4,
  TREE: 5,
  FLOWER: 6,
} as const;

export type TileType = keyof typeof TileTypeEnum;

declare function createPokemonGame(): Promise<PokemonGameModule>;

export default createPokemonGame;
