import { useState, useEffect, useRef } from "react";
import { type Metrics, type GameState, possiblePieces } from "./Utils";
import { Board } from "./Board";

const moveDirections: { [key: string]: [number, number] } = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
};

export function useGameLogic(metrics: Metrics) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createNewFalling(new Board(), metrics)
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setGameState((prev: GameState) => {
        switch (prev.type) {
          case "Falling": {
            const move = moveDirections[event.key];
            if (move) {
              const newShift = [
                prev.shift[0] + move[0],
                prev.shift[1] + move[1],
              ] as [number, number];
              const shifted = prev.falling.shifted(newShift);
              const merged = prev.board.merged(shifted);
              const contained = shifted.contained(
                metrics.boardX,
                metrics.boardY
              );
              if (merged && contained) {
                return { ...prev, shift: newShift };
              } else if (move[1] === 1) {
                const mergedBoard = prev.board.merged(
                  prev.falling.shifted(prev.shift)
                );
                if (mergedBoard) {
                  const lines = mergedBoard.wholeLines(
                    metrics.boardX,
                    metrics.boardY
                  );
                  if (lines.length) {
                    return {
                      type: "Flashing",
                      board: mergedBoard,
                      stage: 0,
                      lastStageSwitch: Date.now(),
                      lines,
                    };
                  }
                  return createNewFalling(mergedBoard, metrics);
                }
              }
              return prev;
            }
            if (event.key === "ArrowUp") {
              const rotated = prev.falling.rotatedCounter();
              const [minX, minY] = rotated.negativeShift();
              const adjusted = rotated.shifted([-minX, -minY]);
              for (const d of [
                [0, 0],
                [-1, 0],
              ]) {
                const testShift: [number, number] = [
                  prev.shift[0] + d[0],
                  prev.shift[1] + d[1],
                ];
                const testFalling = adjusted.shifted(testShift);
                const merged = prev.board.merged(testFalling);
                const contained = testFalling.contained(
                  metrics.boardX,
                  metrics.boardY
                );
                if (merged && contained) {
                  return { ...prev, falling: adjusted, shift: testShift };
                }
              }
            } else if (event.key === " ") {
              const rotated = prev.falling.rotated();
              const [minX, minY] = rotated.negativeShift();
              const adjusted = rotated.shifted([-minX, -minY]);
              for (const d of [
                [0, 0],
                [-1, 0],
              ]) {
                const testShift: [number, number] = [
                  prev.shift[0] + d[0],
                  prev.shift[1] + d[1],
                ];
                const testFalling = adjusted.shifted(testShift);
                const merged = prev.board.merged(testFalling);
                const contained = testFalling.contained(
                  metrics.boardX,
                  metrics.boardY
                );
                if (merged && contained) {
                  return { ...prev, falling: adjusted, shift: testShift };
                }
              }
            }
            return prev;
          }
          case "GameOver":
            if (event.key === "Enter")
              return createNewFalling(new Board(), metrics);
            return prev;
          default:
            return prev;
        }
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [metrics]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setGameState((prev) => {
  //       const now = Date.now();
  //       switch (prev.type) {
  //         case "Falling":
  //           if (now - prev.timeSinceFall >= 700) {
  //             const newShift: [number, number] = [
  //               prev.shift[0],
  //               prev.shift[1] + 1,
  //             ];
  //             const shifted = prev.falling.shifted(newShift);
  //             const merged = prev.board.merged(shifted);
  //             const contained = shifted.contained(
  //               metrics.boardX,
  //               metrics.boardY
  //             );
  //             if (merged && contained) {
  //               return { ...prev, shift: newShift, timeSinceFall: now };
  //             }
  //             const mergedBoard = prev.board.merged(
  //               prev.falling.shifted(prev.shift)
  //             );
  //             if (mergedBoard) {
  //               const lines = mergedBoard.wholeLines(
  //                 metrics.boardX,
  //                 metrics.boardY
  //               );
  //               if (lines.length) {
  //                 return {
  //                   type: "Flashing",
  //                   board: mergedBoard,
  //                   stage: 0,
  //                   lastStageSwitch: now,
  //                   lines,
  //                 };
  //               }
  //               return createNewFalling(mergedBoard, metrics);
  //             }
  //           }
  //           return prev;
  //         case "Flashing":
  //           if (now - prev.lastStageSwitch >= 50) {
  //             const stage = prev.stage + 1;
  //             if (stage < 18) {
  //               return { ...prev, stage, lastStageSwitch: now };
  //             }
  //             let newBoard = prev.board;
  //             for (const line of prev.lines) {
  //               newBoard = newBoard.killLine(line);
  //             }
  //             return createNewFalling(newBoard, metrics);
  //           }
  //           return prev;
  //         case "GameOver":
  //           return prev;
  //       }
  //     });
  //   }, 16);
  //   return () => clearInterval(interval);
  // }, [metrics]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const flashAccumulatorRef = useRef<number>(0);

  // Game loop with requestAnimationFrame
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
        // For the very first piece, ensure its timeSinceFall is aligned with the game loop's time system
        setGameState((prev) => {
          if (prev.type === "Falling") {
            // Optional: Explicitly align the first piece's time if createNewFalling didn't use performance.now()
            // but since it does, this specific adjustment might not be strictly needed,
            // as performance.now() called during useState init and the first currentTime will be close.
            // return { ...prev, timeSinceFall: currentTime };
          }
          return prev;
        });
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setGameState((prev) => {
        switch (prev.type) {
          case "Falling":
            if (currentTime - prev.timeSinceFall >= 700) {
              const newShift: [number, number] = [
                prev.shift[0],
                prev.shift[1] + 1,
              ];
              const shifted = prev.falling.shifted(newShift);
              const merged = prev.board.merged(shifted);
              const contained = shifted.contained(
                metrics.boardX,
                metrics.boardY
              );

              if (merged && contained) {
                return { ...prev, shift: newShift, timeSinceFall: currentTime };
              } else {
                const mergedBoard = prev.board.merged(
                  prev.falling.shifted(prev.shift)
                );
                if (mergedBoard) {
                  const lines = mergedBoard.wholeLines(
                    metrics.boardX,
                    metrics.boardY
                  );
                  if (lines.length) {
                    flashAccumulatorRef.current = 0;
                    return {
                      type: "Flashing",
                      board: mergedBoard,
                      stage: 0,
                      lastStageSwitch: currentTime,
                      lines,
                    };
                  }
                  return createNewFalling(mergedBoard, metrics);
                }
                return { type: "GameOver", board: prev.board };
              }
            }
            return prev;

          case "Flashing":
            flashAccumulatorRef.current += deltaTime;
            if (flashAccumulatorRef.current >= 50) {
              flashAccumulatorRef.current = flashAccumulatorRef.current % 50;
              const stage = prev.stage + 1;
              if (stage < 18) {
                return { ...prev, stage, lastStageSwitch: currentTime };
              }
              let newBoard = prev.board;
              for (const line of prev.lines) {
                newBoard = newBoard.killLine(line);
              }
              return createNewFalling(newBoard, metrics);
            }
            return prev;

          case "GameOver":
            return prev;
        }
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [metrics]);

  return { gameState };
}

export function createNewFalling(board: Board, metrics: Metrics): GameState {
  const idx = Math.floor(Math.random() * possiblePieces.length);
  let falling = possiblePieces[idx];
  let shift: [number, number] = [0, 0];
  const initialShifted = falling.shifted(shift);
  if (
    !board.merged(initialShifted) ||
    !initialShifted.contained(metrics.boardX, metrics.boardY)
  ) {
    return { type: "GameOver", board };
  }
  const rotations = Math.floor(Math.random() * 4);
  for (let i = 0; i < rotations; i++) {
    const rotated = falling.rotatedCounter();
    const [minX, minY] = rotated.negativeShift();
    const adjusted = rotated.shifted([-minX, -minY]);
    for (const d of [
      [0, 0],
      [-1, 0],
    ]) {
      const testShift: [number, number] = [shift[0] + d[0], shift[1] + d[1]];
      const testFalling = adjusted.shifted(testShift);
      const merged = board.merged(testFalling);
      const contained = testFalling.contained(metrics.boardX, metrics.boardY);
      if (merged && contained) {
        falling = adjusted;
        shift = testShift;
        break;
      }
    }
  }
  return {
    type: "Falling",
    board,
    falling,
    shift,
    timeSinceFall: performance.now(),
  };
}
