/**
 * Game logic hook that manages the entire game state and mechanics.
 * This hook encapsulates all game rules, timing, and state transitions,
 * providing a clean interface for the React components.
 */

import { useState, useEffect, useRef } from "react";
import { Board } from "../core/Board";
import { POSSIBLE_PIECES, MOVE_DIRECTIONS, TIMING } from "../core/constants";
import type { Metrics, GameState } from "../core/types";

/**
 * Custom hook that manages all game logic and state.
 * Provides both requestAnimationFrame and setInterval timing options.
 *
 * @param metrics - Game board dimensions and rendering configuration
 * @returns Object containing current game state
 */
export function useGameLogic(metrics: Metrics) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createNewFalling(new Board(), metrics)
  );

  /**
   * Handles keyboard input for player controls.
   * Processes movement, rotation, and restart commands based on current game state.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setGameState((prev: GameState) => {
        switch (prev.type) {
          case "Falling": {
            // Handle directional movement
            const move = MOVE_DIRECTIONS[event.key];
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

              // Allow movement if no collision
              if (merged && contained) {
                return { ...prev, shift: newShift };
              }
              // If moving down and collision occurs, lock the piece
              else if (move[1] === 1) {
                const mergedBoard = prev.board.merged(
                  prev.falling.shifted(prev.shift)
                );
                if (mergedBoard) {
                  const lines = mergedBoard.wholeLines(
                    metrics.boardX,
                    metrics.boardY
                  );
                  // Transition to flashing state if lines are complete
                  if (lines.length) {
                    return {
                      type: "Flashing",
                      board: mergedBoard,
                      stage: 0,
                      lastStageSwitch: Date.now(),
                      lines,
                    };
                  }
                  // Otherwise, spawn a new piece
                  return createNewFalling(mergedBoard, metrics);
                }
              }
              return prev;
            }

            // Handle rotation
            if (event.key === "ArrowUp") {
              // Counter-clockwise rotation
              return attemptRotation(prev, metrics, false);
            } else if (event.key === " ") {
              // Clockwise rotation
              return attemptRotation(prev, metrics, true);
            }
            return prev;
          }

          case "GameOver":
            // Restart game on Enter key
            if (event.key === "Enter") {
              return createNewFalling(new Board(), metrics);
            }
            return prev;

          default:
            return prev;
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [metrics]);

  /**
   * Main game loop using requestAnimationFrame for smooth animation.
   * This is the default timing mechanism, providing better performance
   * and visual quality compared to setInterval.
   */
  // Animation frame references for the game loop
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const flashAccumulatorRef = useRef<number>(0);
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      // Initialize timing on first frame
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setGameState((prev) => {
        switch (prev.type) {
          case "Falling":
            // Check if enough time has passed for gravity
            if (currentTime - prev.timeSinceFall >= TIMING.FALL_INTERVAL) {
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
                // Continue falling
                return { ...prev, shift: newShift, timeSinceFall: currentTime };
              } else {
                // Lock piece and check for completed lines
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
                // Cannot place new piece - game over
                return { type: "GameOver", board: prev.board };
              }
            }
            return prev;

          case "Flashing":
            // Accumulate time for flash animation
            flashAccumulatorRef.current += deltaTime;
            if (flashAccumulatorRef.current >= TIMING.FLASH_DURATION) {
              flashAccumulatorRef.current =
                flashAccumulatorRef.current % TIMING.FLASH_DURATION;
              const stage = prev.stage + 1;

              if (stage < TIMING.FLASH_STAGES) {
                // Continue flashing animation
                return { ...prev, stage, lastStageSwitch: currentTime };
              }

              // Animation complete - remove cleared lines
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

  /**
   * Alternative game loop using setInterval.
   * This is kept as an option for environments where RAF might not be optimal.
   * To use this instead of RAF, uncomment this effect and comment out the RAF version.
   */
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setGameState((prev) => {
  //       const now = Date.now();
  //       switch (prev.type) {
  //         case "Falling":
  //           if (now - prev.timeSinceFall >= TIMING.FALL_INTERVAL) {
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
  //           if (now - prev.lastStageSwitch >= TIMING.FLASH_DURATION) {
  //             const stage = prev.stage + 1;
  //             if (stage < TIMING.FLASH_STAGES) {
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
  //   }, TIMING.ANIMATION_INTERVAL);

  //   return () => clearInterval(interval);
  // }, [metrics]);

  return { gameState };
}

/**
 * Creates a new falling piece with random type and rotation.
 * If the new piece cannot be placed, transitions to game over state.
 *
 * @param board - Current board state
 * @param metrics - Game configuration
 * @returns New game state with falling piece or game over
 */
function createNewFalling(board: Board, metrics: Metrics): GameState {
  // Select random piece type
  const idx = Math.floor(Math.random() * POSSIBLE_PIECES.length);
  let falling = POSSIBLE_PIECES[idx];
  let shift: [number, number] = [0, 0];

  // Check if piece can be placed at spawn position
  const initialShifted = falling.shifted(shift);
  if (
    !board.merged(initialShifted) ||
    !initialShifted.contained(metrics.boardX, metrics.boardY)
  ) {
    return { type: "GameOver", board };
  }

  // Apply random initial rotation
  const rotations = Math.floor(Math.random() * 4);
  for (let i = 0; i < rotations; i++) {
    const rotated = falling.rotatedCounter();
    const [minX, minY] = rotated.negativeShift();
    const adjusted = rotated.shifted([-minX, -minY]);

    // Try wall-kick positions
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

/**
 * Attempts to rotate the falling piece, applying wall-kick if necessary.
 *
 * @param state - Current falling state
 * @param metrics - Game configuration
 * @param clockwise - Direction of rotation
 * @returns New state with rotated piece or original state if rotation fails
 */
function attemptRotation(
  state: GameState & { type: "Falling" },
  metrics: Metrics,
  clockwise: boolean
): GameState {
  const rotated = clockwise
    ? state.falling.rotated()
    : state.falling.rotatedCounter();
  const [minX, minY] = rotated.negativeShift();
  const adjusted = rotated.shifted([-minX, -minY]);

  // Try rotation with wall-kick positions
  for (const d of [
    [0, 0],
    [-1, 0],
  ]) {
    const testShift: [number, number] = [
      state.shift[0] + d[0],
      state.shift[1] + d[1],
    ];
    const testFalling = adjusted.shifted(testShift);
    const merged = state.board.merged(testFalling);
    const contained = testFalling.contained(metrics.boardX, metrics.boardY);

    if (merged && contained) {
      return { ...state, falling: adjusted, shift: testShift };
    }
  }

  // Rotation failed - return original state
  return state;
}
