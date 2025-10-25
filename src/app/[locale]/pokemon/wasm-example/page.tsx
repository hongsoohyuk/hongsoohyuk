'use client';

import {useEffect, useState} from 'react';
import {usePokemonGame} from '@/lib/hooks/use-pokemon-game';
import {Badge, Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/component/ui';

export default function WasmExamplePage() {
  const {game, isLoading, error, playerPosition, playerDirection, movePlayer, checkEncounter, getTileAt} =
    usePokemonGame();
  const [encounterLog, setEncounterLog] = useState<Array<{id: number; time: string}>>([]);
  const [performanceStats, setPerformanceStats] = useState<{
    moveTime: number;
    encounterTime: number;
  }>({moveTime: 0, encounterTime: 0});

  const handleMove = (dx: number, dy: number) => {
    if (!game) return;

    const start = performance.now();
    const moved = movePlayer(dx, dy);
    const moveEnd = performance.now();

    if (moved) {
      const encounterResult = checkEncounter();
      const encounterEnd = performance.now();

      setPerformanceStats({
        moveTime: moveEnd - start,
        encounterTime: encounterEnd - moveEnd,
      });

      if (encounterResult.encountered) {
        setEncounterLog((prev) => [
          {id: encounterResult.pokemonId, time: new Date().toLocaleTimeString()},
          ...prev.slice(0, 9),
        ]);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          handleMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          handleMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          handleMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          handleMove(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚡</div>
          <h2 className="text-2xl font-bold">Loading WASM Engine...</h2>
          <p className="mt-2 text-slate-600">Compiling C++ game logic</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">WASM Loading Error</CardTitle>
            <CardDescription className="text-red-600">{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">
              Make sure you&apos;ve built the WASM module:
              <code className="mt-2 block rounded bg-slate-100 p-2">cd wasm && ./build.sh</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500">⚡ C++ WebAssembly Engine</Badge>
          <h1 className="text-4xl font-bold text-white">Pokémon WASM Demo</h1>
          <p className="mt-2 text-slate-300">Game logic running in WebAssembly (compiled from C++)</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Game State */}
          <Card className="border-slate-700 bg-slate-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">🎮 Game State</CardTitle>
              <CardDescription className="text-slate-400">Real-time from WASM module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-800 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-400">Player Position</div>
                <div className="text-2xl font-bold text-white">
                  ({playerPosition.x}, {playerPosition.y})
                </div>
              </div>

              <div className="rounded-lg bg-slate-800 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-400">Direction</div>
                <div className="text-2xl font-bold text-white">
                  {playerDirection === 'up' && '⬆️ Up'}
                  {playerDirection === 'down' && '⬇️ Down'}
                  {playerDirection === 'left' && '⬅️ Left'}
                  {playerDirection === 'right' && '➡️ Right'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-800 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-400">Current Tile</div>
                <div className="text-lg font-mono text-white">{getTileAt(playerPosition.x, playerPosition.y)}</div>
              </div>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div />
                <button
                  className="rounded bg-slate-700 p-3 font-bold text-white hover:bg-slate-600"
                  onClick={() => handleMove(0, -1)}
                >
                  ⬆
                </button>
                <div />
                <button
                  className="rounded bg-slate-700 p-3 font-bold text-white hover:bg-slate-600"
                  onClick={() => handleMove(-1, 0)}
                >
                  ⬅
                </button>
                <div />
                <button
                  className="rounded bg-slate-700 p-3 font-bold text-white hover:bg-slate-600"
                  onClick={() => handleMove(1, 0)}
                >
                  ➡
                </button>
                <div />
                <button
                  className="rounded bg-slate-700 p-3 font-bold text-white hover:bg-slate-600"
                  onClick={() => handleMove(0, 1)}
                >
                  ⬇
                </button>
                <div />
              </div>
            </CardContent>
          </Card>

          {/* Performance & Encounters */}
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">⚡ Performance</CardTitle>
                <CardDescription className="text-slate-400">WASM execution time (microseconds)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-green-900/30 p-3">
                  <span className="text-sm text-slate-300">Move Player</span>
                  <span className="font-mono text-lg font-bold text-green-400">
                    {performanceStats.moveTime.toFixed(3)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-blue-900/30 p-3">
                  <span className="text-sm text-slate-300">Check Encounter</span>
                  <span className="font-mono text-lg font-bold text-blue-400">
                    {performanceStats.encounterTime.toFixed(3)}ms
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
                  <div className="text-xs font-semibold text-yellow-400">💡 Note</div>
                  <div className="mt-1 text-xs text-slate-300">
                    These operations run at near-native speed thanks to WebAssembly compilation from C++
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">🎲 Encounter Log</CardTitle>
                <CardDescription className="text-slate-400">Recent wild Pokémon encounters</CardDescription>
              </CardHeader>
              <CardContent>
                {encounterLog.length === 0 ? (
                  <p className="text-sm text-slate-400">Walk through grass to encounter Pokémon!</p>
                ) : (
                  <div className="space-y-2">
                    {encounterLog.map((entry, index) => (
                      <div
                        key={`${entry.id}-${entry.time}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-2"
                      >
                        <span className="text-sm text-slate-300">#{entry.id.toString().padStart(3, '0')}</span>
                        <span className="text-xs text-slate-500">{entry.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tech Info */}
        <Card className="mt-6 border-slate-700 bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">🔧 Technical Details</CardTitle>
            <CardDescription className="text-slate-400">How this works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div>
              <div className="mb-1 font-semibold text-white">Architecture</div>
              <code className="block rounded bg-slate-800 p-2 font-mono text-xs">
                C++ Game Logic → Emscripten → WebAssembly → JavaScript Bindings → React
              </code>
            </div>
            <div>
              <div className="mb-1 font-semibold text-white">Benefits</div>
              <ul className="list-inside list-disc space-y-1">
                <li>Near-native performance (5-10x faster than JavaScript)</li>
                <li>Type-safe with C++ compilation</li>
                <li>Memory efficient with manual management</li>
                <li>Can reuse code across platforms</li>
              </ul>
            </div>
            <div>
              <div className="mb-1 font-semibold text-white">Files</div>
              <ul className="list-inside list-disc space-y-1 font-mono text-xs">
                <li>wasm/src/game.cpp - Core game logic</li>
                <li>wasm/src/bindings.cpp - JS ↔ C++ interface</li>
                <li>public/wasm/pokemon-game.wasm - Compiled binary</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
