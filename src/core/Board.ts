/**
 * Board class represents the game board and individual tetromino pieces.
 * It uses a sparse storage approach where only occupied cells are tracked,
 * making it memory-efficient and suitable for both the game board and piece representations.
 */

import type { Color, Position } from "./types";

/**
 * The Board class is the core data structure for the Tetris game.
 * It can represent both the main game board and individual tetromino pieces.
 * Uses a Map for sparse storage - only occupied cells are stored.
 */
export class Board {
  private map: Map<string, Color>;

  /**
   * Creates a new Board from position-color pairs.
   * @param entries - Array of [position, color] tuples for occupied cells
   */
  constructor(entries: [Position, Color][] = []) {
    this.map = new Map(
      entries.map(([pos, color]) => [posKey(pos[0], pos[1]), color])
    );
  }

  /**
   * Factory method to create a Board from positions with a single color.
   * Useful for creating tetromino pieces where all blocks share the same color.
   * @param positions - Array of positions for the piece blocks
   * @param color - Color for all blocks
   * @returns New Board instance
   */
  static fromPositions(positions: Position[], color: Color): Board {
    return positions.reduce((boardAccumulator, pos) => {
      boardAccumulator.set(pos, color);
      return boardAccumulator;
    }, new Board());
  }

  /**
   * Retrieves the color at a specific position.
   * @param pos - Position to check
   * @returns Color at position, or undefined if empty
   */
  get(pos: Position): Color | undefined {
    return this.map.get(posKey(pos[0], pos[1]));
  }

  /**
   * Sets a color at a specific position.
   * @param pos - Position to set
   * @param color - Color to place
   */
  set(pos: Position, color: Color): void {
    this.map.set(posKey(pos[0], pos[1]), color);
  }

  /**
   * Removes a block at a specific position.
   * @param pos - Position to clear
   */
  delete(pos: Position): void {
    this.map.delete(posKey(pos[0], pos[1]));
  }

  /**
   * Gets all occupied positions and their colors.
   * @returns Array of [position, color] pairs
   */
  entries(): [Position, Color][] {
    return Array.from(this.map.entries()).map(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      return [[x, y], color];
    });
  }

  /**
   * Creates a new Board with all positions transformed by a function.
   * Essential for implementing rotation and movement operations.
   * @param transform - Function to transform each position
   * @returns New transformed Board
   */
  modified(transform: (pos: Position) => Position): Board {
    const transformedEntries = this.entries().map(
      ([pos, color]): [Position, Color] => {
        return [transform(pos), color];
      }
    );
    return new Board(transformedEntries);
  }

  /**
   * Creates a new Board with positions transformed and filtered.
   * Useful for operations that may remove blocks, like line clearing.
   * @param transform - Function returning new position or null to remove
   * @returns New filtered Board
   */
  modifiedFilter(transform: (pos: Position) => Position | null): Board {
    const newBoard = new Board();
    for (const [pos, color] of this.entries()) {
      const newPos = transform(pos);
      if (newPos) newBoard.set(newPos, color);
    }
    return newBoard;
  }

  /**
   * Swaps x and y coordinates for all positions.
   * Part of the rotation algorithm.
   * @returns New transposed Board
   */
  transposed(): Board {
    return this.modified(([x, y]) => [y, x]);
  }

  /**
   * Flips all y coordinates to their negative values.
   * Part of the rotation algorithm.
   * @returns New mirrored Board
   */
  mirroredY(): Board {
    return this.modified(([x, y]) => [x, -y]);
  }

  /**
   * Rotates the board 90 degrees clockwise.
   * Combines mirroring and transposition for rotation.
   * @returns New rotated Board
   */
  rotated(): Board {
    return this.mirroredY().transposed();
  }

  /**
   * Rotates the board 90 degrees counter-clockwise.
   * Equivalent to three clockwise rotations.
   * @returns New counter-rotated Board
   */
  rotatedCounter(): Board {
    return this.rotated().rotated().rotated();
  }

  /**
   * Finds the minimum x and y coordinates across all positions.
   * Used to normalize piece positions after rotation.
   * @returns [minX, minY] offset values
   */
  negativeShift(): [number, number] {
    let minX = 0,
      minY = 0;
    for (const [pos] of this.entries()) {
      minX = Math.min(minX, pos[0]);
      minY = Math.min(minY, pos[1]);
    }
    return [minX, minY];
  }

  /**
   * Moves all positions by the given offset.
   * Core operation for piece movement and positioning.
   * @param shift - [x, y] offset to apply
   * @returns New shifted Board
   */
  shifted(shift: [number, number]): Board {
    return this.modified(([x, y]) => [x + shift[0], y + shift[1]]);
  }

  /**
   * Attempts to merge another Board into this one.
   * Returns null if any positions overlap (collision detected).
   * @param other - Board to merge in
   * @returns Merged Board or null if collision
   */
  merged(other: Board): Board | null {
    const newMap = new Map(this.map);
    for (const [key, color] of other.map) {
      if (newMap.has(key)) return null; // Collision detected
      newMap.set(key, color);
    }
    const newBoard = new Board();
    newBoard.map = newMap;
    return newBoard;
  }

  /**
   * Checks if all positions are within the game board bounds.
   * Used for collision detection with board edges.
   * @param boardX - Board width
   * @param boardY - Board height
   * @returns True if all positions are in bounds
   */
  contained(boardX: number, boardY: number): boolean {
    return this.entries().every(([pos]) => {
      const [x, y] = pos;
      return x >= 0 && x < boardX && y >= 0 && y < boardY;
    });
  }

  /**
   * Finds all complete (full) horizontal lines.
   * A line is complete when all x positions in that y row are occupied.
   * @param boardX - Board width
   * @param boardY - Board height
   * @returns Array of y-coordinates for complete lines
   */
  wholeLines(boardX: number, boardY: number): number[] {
    return Array.from({ length: boardY }, (_, y) => y).filter((y) => {
      return Array.from({ length: boardX }, (_, x) =>
        this.map.has(posKey(x, y))
      ).every(Boolean);
    });
  }

  /**
   * Removes a horizontal line and drops all lines above it.
   * Used during line clearing after finding complete lines.
   * @param y - Y-coordinate of line to remove
   * @returns New Board with line removed and above lines dropped
   */
  killLine(y: number): Board {
    return this.modifiedFilter(([x, oy]) => {
      if (oy > y) return [x, oy]; // Keep lines below unchanged
      if (oy === y) return null; // Remove the cleared line
      return [x, oy + 1]; // Drop lines above
    });
  }
}

/**
 * Creates a string key from x,y coordinates for Map storage.
 * This allows efficient position-based lookups in the sparse storage.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns String key like "3,7"
 */
export function posKey(x: number, y: number): string {
  return `${x},${y}`;
}
