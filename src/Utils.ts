import { Board, type Color } from "./Board";

export interface Metrics {
  blockPixels: number;
  boardX: number;
  boardY: number;
}

export type DrawEffect =
  | { type: "None" }
  | { type: "Darker" }
  | { type: "Flash"; lines: number[] };

export type GameState =
  | {
      type: "Falling";
      board: Board;
      falling: Board;
      shift: [number, number];
      timeSinceFall: number;
    }
  | {
      type: "Flashing";
      board: Board;
      stage: number;
      lastStageSwitch: number;
      lines: number[];
    }
  | { type: "GameOver"; board: Board };

export const metrics: Metrics = {
  blockPixels: 20,
  boardX: 8,
  boardY: 20,
};

export const possiblePieces: Board[] = [
  Board.fromPositions(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    "Red"
  ),
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
    "Green"
  ),
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    "Blue"
  ),
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    "Orange"
  ),
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    "Yellow"
  ),
  Board.fromPositions(
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    "Cyan"
  ),
  Board.fromPositions(
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    "Magenta"
  ),
];

export function getColorCode(color: Color): string {
  switch (color) {
    case "Red":
      return "rgb(255,0,0)";
    case "Green":
      return "rgb(0,255,0)";
    case "Blue":
      return "rgb(128,128,255)";
    case "Magenta":
      return "rgb(255,0,255)";
    case "Cyan":
      return "rgb(0,255,255)";
    case "Yellow":
      return "rgb(255,255,0)";
    case "Orange":
      return "rgb(255,128,0)";
  }
}
