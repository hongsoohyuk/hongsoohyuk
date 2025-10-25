import {useEffect, useRef, useState} from 'react';
import type {PokemonGame, PokemonGameModule, Direction} from '@/lib/wasm/pokemon-game';

export interface UsePokemonGameResult {
  game: PokemonGame | null;
  isLoading: boolean;
  error: Error | null;
  playerPosition: {x: number; y: number};
  playerDirection: Direction;
  movePlayer: (dx: number, dy: number) => boolean;
  checkEncounter: () => {encountered: boolean; pokemonId: number};
  getTileAt: (x: number, y: number) => number;
}

const directionMap: Direction[] = ['up', 'down', 'left', 'right'];

export function usePokemonGame(): UsePokemonGameResult {
  const [game, setGame] = useState<PokemonGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [playerPosition, setPlayerPosition] = useState({x: 3, y: 2});
  const [playerDirection, setPlayerDirection] = useState<Direction>('down');
  const gameInstanceRef = useRef<PokemonGame | null>(null);

  useEffect(() => {
    let mounted = true;
    let scriptElement: HTMLScriptElement | null = null;

    async function loadWasm() {
      try {
        // Method 1: Script tag (works with EXPORT_ES6=0)
        scriptElement = document.createElement('script');
        scriptElement.src = '/wasm/pokemon-game.js';

        const loadScript = new Promise<void>((resolve, reject) => {
          if (!scriptElement) return reject(new Error('Script element not created'));

          scriptElement.onload = () => {
            // Give it a moment to initialize
            setTimeout(resolve, 50);
          };
          scriptElement.onerror = () => reject(new Error('Failed to load WASM script. Run: npm run build:wasm'));

          document.head.appendChild(scriptElement);
        });

        await loadScript;

        // The WASM module exports createPokemonGame function globally
        const createPokemonGame = (window as any).createPokemonGame as (() => Promise<PokemonGameModule>) | undefined;

        if (!createPokemonGame) {
          throw new Error('WASM module not loaded. Make sure to build: cd wasm && ./build.sh');
        }

        const module = await createPokemonGame();
        const gameInstance = new module.Game();

        if (mounted) {
          gameInstanceRef.current = gameInstance;
          setGame(gameInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load WASM module:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load WASM module'));
          setIsLoading(false);
        }
      }
    }

    loadWasm();

    return () => {
      mounted = false;

      // Cleanup WASM instance
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.delete();
        } catch (err) {
          console.error('Failed to cleanup WASM instance:', err);
        }
      }

      // Remove script tag
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  const movePlayer = (dx: number, dy: number): boolean => {
    if (!game) return false;

    const moved = game.movePlayer(dx, dy);
    if (moved) {
      setPlayerPosition({
        x: game.getPlayerX(),
        y: game.getPlayerY(),
      });
      setPlayerDirection(directionMap[game.getPlayerDirection()]);
    }
    return moved;
  };

  const checkEncounter = () => {
    if (!game) return {encountered: false, pokemonId: 0};
    return game.checkEncounter();
  };

  const getTileAt = (x: number, y: number): number => {
    if (!game) return 2; // Default to PATH
    return game.getTileAt(x, y);
  };

  return {
    game,
    isLoading,
    error,
    playerPosition,
    playerDirection,
    movePlayer,
    checkEncounter,
    getTileAt,
  };
}
