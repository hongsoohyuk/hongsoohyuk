'use client';

import {useCallback, useEffect, useRef, useState} from 'react';

interface EncounterResult {
  encountered: boolean;
  pokemonId: number;
}

interface GameEngine {
  getPixelBuffer(): Uint32Array;
  update(deltaTime: number): void;
  handleInput(keyCode: number, pressed: boolean): void;
  movePlayer(dx: number, dy: number): boolean;
  pressA(): void;
  pressB(): void;
  getViewportWidth(): number;
  getViewportHeight(): number;
  getFrameCount(): number;
  reset(): void;
  isEncounterModalVisible(): boolean;
  getModalEncounter(): EncounterResult;
  getModalMessage(): string;
  dismissEncounterModal(): void;
  delete(): void;
}

interface PokemonGameModule {
  GameEngine: new (width: number, height: number) => GameEngine;
}

interface EncounterModalState {
  visible: boolean;
  pokemonId: number | null;
  message: string;
}

const GAME_WIDTH = 160; // 10 tiles × 16 pixels
const GAME_HEIGHT = 144; // 9 tiles × 16 pixels
const SCALE = 3; // 3x scale for modern displays

export default function PokemonGoldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [modalState, setModalState] = useState<EncounterModalState>({
    visible: false,
    pokemonId: null,
    message: '',
  });

  const syncModalState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!engine.isEncounterModalVisible()) {
      setModalState((prev) => (prev.visible ? {visible: false, pokemonId: null, message: ''} : prev));
      return;
    }

    const encounter = engine.getModalEncounter();
    const message = engine.getModalMessage();
    const pokemonId = encounter.encountered ? encounter.pokemonId : null;

    setModalState((prev) => {
      if (prev.visible && prev.pokemonId === pokemonId && prev.message === message) {
        return prev;
      }

      return {
        visible: true,
        pokemonId,
        message,
      };
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    let scriptElement: HTMLScriptElement | null = null;

    async function init() {
      try {
        console.log('🎮 [1/5] Initializing WASM game engine...');
        console.log('Mounted:', mounted);

        // Load WASM module from public directory
        scriptElement = document.createElement('script');
        scriptElement.src = '/wasm/pokemon-game.js';

        console.log('🎮 [2/5] Loading WASM script...');

        const loadScript = new Promise<void>((resolve, reject) => {
          if (!scriptElement) return reject(new Error('Script element not created'));

          scriptElement.onload = () => {
            console.log('🎮 [3/5] Script loaded, waiting for initialization...');
            // Give it a moment to initialize
            setTimeout(resolve, 100);
          };
          scriptElement.onerror = (e) => {
            console.error('❌ Script load error:', e);
            reject(new Error('Failed to load WASM script from /wasm/pokemon-game.js'));
          };

          document.head.appendChild(scriptElement);
        });

        await loadScript;

        console.log('🎮 [4/5] Getting createPokemonGame function...');
        console.log('window.createPokemonGame:', typeof (window as any).createPokemonGame);

        // Get the global createPokemonGame function
        const createModule = (window as any).createPokemonGame as (() => Promise<PokemonGameModule>) | undefined;

        if (!createModule) {
          console.error('❌ createPokemonGame not found on window');
          console.log(
            'Available on window:',
            Object.keys(window).filter((k) => k.includes('create') || k.includes('Pokemon')),
          );
          throw new Error('WASM module not loaded. The WASM file may be missing or corrupted.');
        }

        console.log('🎮 [5/5] Initializing WASM module...');
        const module = await createModule();
        console.log('✅ WASM module loaded successfully!');
        console.log('Module contents:', Object.keys(module));

        if (!mounted) {
          console.warn('⚠️ Component unmounted, aborting initialization');
          return;
        }

        // Create game engine with C++ renderer
        console.log('Creating GameEngine with dimensions:', GAME_WIDTH, GAME_HEIGHT);
        const engine = new module.GameEngine(GAME_WIDTH, GAME_HEIGHT);
        console.log('✅ GameEngine created');
        engineRef.current = engine;
        syncModalState();

        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('❌ Canvas ref is null');
          throw new Error('Canvas element not found');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('❌ Canvas context is null');
          throw new Error('Failed to get canvas 2d context');
        }

        console.log('✅ Canvas context obtained');

        // Create ImageData for pixel rendering
        const imageData = ctx.createImageData(GAME_WIDTH, GAME_HEIGHT);

        let frameCount = 0;
        let lastFpsUpdate = performance.now();

        // Game loop
        function gameLoop(currentTime: number) {
          if (!mounted || !engineRef.current) return;

          const deltaTime = (currentTime - lastTimeRef.current) / 1000;
          lastTimeRef.current = currentTime;

          // Update game state
          engineRef.current.update(deltaTime);

          // Get pixel buffer from C++
          const pixels = engineRef.current.getPixelBuffer();

          // Copy to ImageData (convert RGBA)
          const data = imageData.data;
          for (let i = 0; i < pixels.length; i++) {
            const color = pixels[i];
            const idx = i * 4;
            data[idx] = (color >> 16) & 0xff; // R
            data[idx + 1] = (color >> 8) & 0xff; // G
            data[idx + 2] = color & 0xff; // B
            data[idx + 3] = (color >> 24) & 0xff; // A
          }

          // Render to canvas
          ctx?.putImageData(imageData, 0, 0);

          // Sync modal state with engine
          syncModalState();

          // FPS counter
          frameCount++;
          if (currentTime - lastFpsUpdate > 1000) {
            setFps(frameCount);
            frameCount = 0;
            lastFpsUpdate = currentTime;
          }

          animationRef.current = requestAnimationFrame(gameLoop);
        }

        console.log('✅ All initialization complete!');
        console.log('Setting isLoading to false...');
        console.log('Current isLoading:', isLoading);
        console.log('Mounted:', mounted);

        if (mounted) {
          setIsLoading(false);
          console.log('✅ setIsLoading(false) called');
          lastTimeRef.current = performance.now();
          animationRef.current = requestAnimationFrame(gameLoop);
          console.log('✅ Game loop started');
        } else {
          console.warn('⚠️ Component unmounted, skipping state update');
        }
      } catch (err) {
        console.error('❌ Failed to initialize game:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        console.log('Mounted in catch:', mounted);

        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load game';
          console.log('Setting error state:', errorMsg);
          setError(errorMsg);
          console.log('Setting isLoading to false in error handler...');
          setIsLoading(false);
          console.log('✅ Error state set');
        } else {
          console.warn('⚠️ Component unmounted in error handler');
        }
      }
    }

    console.log('Starting init...');
    init();

    return () => {
      mounted = false;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (engineRef.current) {
        try {
          engineRef.current.delete();
        } catch (err) {
          console.error('Failed to cleanup engine:', err);
        }
      }

      // Remove script tag
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [syncModalState]);

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!engineRef.current) return;

      const key = e.key.toLowerCase();
      let handled = false;

      switch (key) {
        case 'arrowup':
        case 'w':
          engineRef.current.movePlayer(0, -1);
          handled = true;
          break;
        case 'arrowdown':
        case 's':
          engineRef.current.movePlayer(0, 1);
          handled = true;
          break;
        case 'arrowleft':
        case 'a':
          engineRef.current.movePlayer(-1, 0);
          handled = true;
          break;
        case 'arrowright':
        case 'd':
          engineRef.current.movePlayer(1, 0);
          handled = true;
          break;
        case 'z':
        case 'enter':
          engineRef.current.pressA();
          handled = true;
          break;
        case 'x':
        case 'backspace':
          engineRef.current.pressB();
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        syncModalState();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [syncModalState]);

  const handleButtonClick = (action: string) => {
    if (!engineRef.current) return;

    switch (action) {
      case 'up':
        engineRef.current.movePlayer(0, -1);
        break;
      case 'down':
        engineRef.current.movePlayer(0, 1);
        break;
      case 'left':
        engineRef.current.movePlayer(-1, 0);
        break;
      case 'right':
        engineRef.current.movePlayer(1, 0);
        break;
      case 'a':
        engineRef.current.pressA();
        break;
      case 'b':
        engineRef.current.pressB();
        break;
    }

    syncModalState();
  };

  const handleModalClose = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.dismissEncounterModal();
    }
    syncModalState();
  }, [syncModalState]);

  console.log('isLoading', isLoading);

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
          <div className="text-center">
            <div className="mb-4 text-6xl">🎮</div>
            <h2 className="text-3xl font-bold text-white">Loading Pokémon Gold...</h2>
            <p className="mt-2 text-white/80">Compiling C++ game engine</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900">
          <div className="rounded-lg bg-red-800 p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold">Error Loading Game</h2>
            <p className="mb-4">{error}</p>
            <code className="block rounded bg-red-950 p-2 text-sm">cd wasm && ./build.sh</code>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-red-600 px-4 py-2 hover:bg-red-700"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Encounter modal */}
      {modalState.visible && !isLoading && !error && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-[#C7954A] bg-[#FAF0D7] p-6 text-center shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
            <div className="text-xs font-semibold uppercase tracking-[0.5em] text-[#B2762B]">Wild Encounter</div>
            <div className="mt-3 text-5xl">✨</div>
            <h3 className="mt-4 text-2xl font-extrabold text-[#2F1B0C]">
              {modalState.pokemonId ? `포켓몬 #${modalState.pokemonId}` : '포켓몬 없음'}
            </h3>
            <p className="mt-3 text-base text-[#3B2A19]">{modalState.message}</p>
            <p className="mt-3 text-xs text-[#9C7A46]">A 또는 B 버튼을 눌러 계속하세요</p>
            <button
              onClick={handleModalClose}
              className="mt-6 w-full rounded-full bg-[#ca4249] px-4 py-3 text-base font-bold text-[#F5F1B8] shadow-[0_12px_0_rgba(0,0,0,0.35)] transition-transform hover:brightness-110 active:translate-y-[2px]"
            >
              계속하기
            </button>
          </div>
        </div>
      )}

      {/* Main game content - always rendered */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="relative">
          {/* Game Boy Color Shell */}
          <div className="relative rounded-[3rem] bg-gradient-to-br from-[#c9d87d] to-[#b8c76d] p-8 shadow-2xl">
            {/* Top Label */}
            <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 select-none text-center">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-[#51693e]">
                Game Boy <span className="text-[#d63031]">Color</span>
              </div>
              <div className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-[#6a7a4e]">
                Dot Matrix With Stereo Sound
              </div>
            </div>

            {/* Screen Container */}
            <div className="relative mt-12 rounded-[2rem] border-[6px] border-[#373b28] bg-[#2d2d2d] p-4 shadow-inner">
              {/* LCD Screen */}
              <div className="relative overflow-hidden rounded-xl border-2 border-[#1d1f13] bg-[#9BBC0F]">
                <canvas
                  ref={canvasRef}
                  width={GAME_WIDTH}
                  height={GAME_HEIGHT}
                  className="pixelated"
                  style={{
                    width: `${GAME_WIDTH * SCALE}px`,
                    height: `${GAME_HEIGHT * SCALE}px`,
                    imageRendering: 'pixelated',
                  }}
                />

                {/* FPS Counter */}
                <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/50 px-2 py-1 font-mono text-xs text-green-400">
                  {fps} FPS
                </div>
              </div>

              {/* Power LED */}
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#51693e]">Power</span>
              </div>
            </div>

            {/* Start/Select Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                className="h-6 w-16 rounded-full bg-[#4e5933] text-[0.6rem] font-bold uppercase tracking-wider text-[#9BBC0F] shadow-inner transition-transform active:scale-95"
                onClick={() => handleButtonClick('b')}
              >
                Select
              </button>
              <button
                className="h-6 w-16 rounded-full bg-[#4e5933] text-[0.6rem] font-bold uppercase tracking-wider text-[#9BBC0F] shadow-inner transition-transform active:scale-95"
                onClick={() => {
                  engineRef.current?.reset();
                  syncModalState();
                }}
              >
                Start
              </button>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-end justify-between px-4">
              {/* D-Pad */}
              <div className="relative">
                <div className="text-[0.55rem] font-semibold uppercase tracking-wider text-[#51693e]">D-Pad</div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <div />
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2f2f2f] text-xl font-bold text-[#d6e29f] shadow-[inset_0_-6px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[1px]"
                    onClick={() => handleButtonClick('up')}
                  >
                    ▲
                  </button>
                  <div />
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2f2f2f] text-xl font-bold text-[#d6e29f] shadow-[inset_0_-6px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[1px]"
                    onClick={() => handleButtonClick('left')}
                  >
                    ◀
                  </button>
                  <div />
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2f2f2f] text-xl font-bold text-[#d6e29f] shadow-[inset_0_-6px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[1px]"
                    onClick={() => handleButtonClick('right')}
                  >
                    ▶
                  </button>
                  <div />
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2f2f2f] text-xl font-bold text-[#d6e29f] shadow-[inset_0_-6px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[1px]"
                    onClick={() => handleButtonClick('down')}
                  >
                    ▼
                  </button>
                  <div />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative flex items-end gap-4">
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[0.55rem] font-semibold uppercase tracking-wider text-[#51693e]">B</span>
                  <button
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4b3e7a] text-xl font-bold text-[#f5f1b8] shadow-[inset_0_-9px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[2px]"
                    onClick={() => handleButtonClick('b')}
                  >
                    B
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[0.55rem] font-semibold uppercase tracking-wider text-[#51693e]">A</span>
                  <button
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ca4249] text-2xl font-bold text-[#f5f1b8] shadow-[inset_0_-10px_0_rgba(0,0,0,0.45)] transition-transform active:translate-y-[2px]"
                    onClick={() => handleButtonClick('a')}
                  >
                    A
                  </button>
                </div>
              </div>
            </div>

            {/* Speaker Grille */}
            <div className="pointer-events-none absolute -right-8 top-24 hidden rotate-6 md:block">
              <div className="flex h-24 w-16 flex-col items-center justify-center gap-1 rounded-3xl bg-[#2f2f2f] p-3 shadow-2xl">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="h-1 w-full rounded-full bg-black/60" />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center text-sm text-slate-400">
            <p>
              <kbd className="rounded bg-slate-700 px-2 py-1">WASD</kbd> or{' '}
              <kbd className="rounded bg-slate-700 px-2 py-1">Arrows</kbd> to move
            </p>
            <p className="mt-1">
              <kbd className="rounded bg-slate-700 px-2 py-1">Z</kbd> or{' '}
              <kbd className="rounded bg-slate-700 px-2 py-1">Enter</kbd> = A button
            </p>
            <p className="mt-1">
              <kbd className="rounded bg-slate-700 px-2 py-1">X</kbd> or{' '}
              <kbd className="rounded bg-slate-700 px-2 py-1">Backspace</kbd> = B button
            </p>
            <p className="mt-4 text-xs text-slate-500">🔥 Powered by C++ WebAssembly</p>
          </div>
        </div>
      </div>
    </>
  );
}
