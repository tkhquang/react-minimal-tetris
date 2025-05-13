/**
 * Core type definitions for the Tetris game.
 * These types define the fundamental data structures used throughout the application.
 */
import type { Board } from "./Board";

/**
 * Represents the available colors for tetromino pieces.
 * Each piece type has a unique color for visual distinction.
 */
export type Color =
  | "Red"
  | "Green"
  | "Blue"
  | "Magenta"
  | "Cyan"
  | "Yellow"
  | "Orange";

/**
 * Represents a position on the game board.
 * [x, y] where x is horizontal (0-based from left) and y is vertical (0-based from top).
 */
export type Position = [number, number];

/**
 * Configuration for game dimensions and rendering.
 * These metrics define the visual appearance and board size.
 */
export interface Metrics {
  blockPixels: number; // Size of each block in pixels
  boardX: number; // Board width in blocks
  boardY: number; // Board height in blocks
}

/**
 * Visual effects applied during rendering.
 * Used for line clearing animations and game over display.
 */
export type DrawEffect =
  | { type: "None" } // Normal rendering
  | { type: "Darker" } // Darkened overlay for game over
  | { type: "Flash"; lines: number[] }; // Flashing lines during clear animation

/**
 * Represents the current state of the game.
 * The game transitions between these states based on player actions and game events.
 */
export type GameState =
  | {
      type: "Falling";
      board: Board; // Current board state
      falling: Board; // The falling tetromino
      shift: Position; // Current position offset of falling piece
      timeSinceFall: number; // Timestamp for gravity timing
    }
  | {
      type: "Flashing";
      board: Board; // Board with completed lines
      stage: number; // Current animation frame (0-17)
      lastStageSwitch: number; // Timestamp of last animation update
      lines: number[]; // Y-coordinates of completed lines
    }
  | {
      type: "GameOver";
      board: Board; // Final board state
    };
