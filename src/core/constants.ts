/**
 * Game constants including piece definitions, metrics, and timing values.
 * These values configure the core gameplay experience.
 */

import { Board } from "./Board";
import type { Metrics } from "./types";

/**
 * Default game board dimensions and rendering configuration.
 * These values create a standard Tetris experience with an 8x20 grid.
 */
export const DEFAULT_METRICS: Metrics = {
  blockPixels: 20, // Each block is 20x20 pixels
  boardX: 8, // 8 blocks wide (160px total)
  boardY: 20, // 20 blocks tall (400px total)
};

/**
 * All possible tetromino pieces in the game.
 * Each piece is defined by its initial block positions and color.
 * Positions are relative to (0,0) at the top-left of the piece's bounding box.
 */
export const POSSIBLE_PIECES: Board[] = [
  // O-piece (square) - 2x2 red block
  Board.fromPositions(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    "Red"
  ),

  // T-piece - Green piece shaped like letter T
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    "Green"
  ),

  // I-piece - Blue horizontal line (will rotate to vertical)
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    "Blue"
  ),

  // L-piece - Orange piece shaped like letter L
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    "Orange"
  ),

  // J-piece - Yellow piece shaped like reversed L
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    "Yellow"
  ),

  // S-piece - Cyan piece with step shape
  Board.fromPositions(
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    "Cyan"
  ),

  // Z-piece - Magenta piece with reversed step shape
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    "Magenta"
  ),
];

/**
 * Timing constants for game mechanics.
 * These values control the feel and difficulty of the game.
 */
export const TIMING = {
  FALL_INTERVAL: 700, // Milliseconds between automatic piece movements
  FLASH_DURATION: 50, // Milliseconds per flash animation frame
  FLASH_STAGES: 18, // Total number of flash animation frames
  ANIMATION_INTERVAL: 16, // Target milliseconds for setInterval mode (60fps)
};

/**
 * Keyboard mappings for player controls.
 * Maps keyboard keys to movement directions.
 */
export const MOVE_DIRECTIONS: { [key: string]: [number, number] } = {
  ArrowRight: [1, 0], // Move right
  ArrowLeft: [-1, 0], // Move left
  ArrowDown: [0, 1], // Soft drop (move down)
};
