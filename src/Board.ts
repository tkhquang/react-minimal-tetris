export type Color =
  | "Red"
  | "Green"
  | "Blue"
  | "Magenta"
  | "Cyan"
  | "Yellow"
  | "Orange";

export type Position = [number, number];

export class Board {
  private map: Map<string, Color>;

  constructor(entries: [Position, Color][] = []) {
    this.map = new Map(
      entries.map(([pos, color]) => [posKey(pos[0], pos[1]), color])
    );
  }

  static fromPositions(positions: Position[], color: Color): Board {
    return positions.reduce((boardAccumulator, pos) => {
      boardAccumulator.set(pos, color);
      return boardAccumulator;
    }, new Board());
  }

  get(pos: Position): Color | undefined {
    return this.map.get(posKey(pos[0], pos[1]));
  }

  set(pos: Position, color: Color): void {
    this.map.set(posKey(pos[0], pos[1]), color);
  }

  delete(pos: Position): void {
    this.map.delete(posKey(pos[0], pos[1]));
  }

  entries(): [Position, Color][] {
    return Array.from(this.map.entries()).map(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      return [[x, y], color];
    });
  }

  modified(transform: (pos: Position) => Position): Board {
    const transformedEntries = this.entries().map(
      ([pos, color]): [Position, Color] => {
        return [transform(pos), color];
      }
    );
    return new Board(transformedEntries);
  }

  modifiedFilter(transform: (pos: Position) => Position | null): Board {
    const newBoard = new Board();
    for (const [pos, color] of this.entries()) {
      const newPos = transform(pos);
      if (newPos) newBoard.set(newPos, color);
    }
    return newBoard;
  }

  transposed(): Board {
    return this.modified(([x, y]) => [y, x]);
  }

  mirroredY(): Board {
    return this.modified(([x, y]) => [x, -y]);
  }

  rotated(): Board {
    return this.mirroredY().transposed();
  }

  rotatedCounter(): Board {
    return this.rotated().rotated().rotated();
  }

  negativeShift(): [number, number] {
    let minX = 0,
      minY = 0;
    for (const [pos] of this.entries()) {
      minX = Math.min(minX, pos[0]);
      minY = Math.min(minY, pos[1]);
    }
    return [minX, minY];
  }

  shifted(shift: [number, number]): Board {
    return this.modified(([x, y]) => [x + shift[0], y + shift[1]]);
  }

  merged(other: Board): Board | null {
    const newMap = new Map(this.map);
    for (const [key, color] of other.map) {
      if (newMap.has(key)) return null;
      newMap.set(key, color);
    }
    const newBoard = new Board();
    newBoard.map = newMap;
    return newBoard;
  }

  contained(boardX: number, boardY: number): boolean {
    return this.entries().every(([pos]) => {
      const [x, y] = pos;
      return x >= 0 && x < boardX && y >= 0 && y < boardY;
    });
  }

  wholeLines(boardX: number, boardY: number): number[] {
    return Array.from({ length: boardY }, (_, y) => y).filter((y) => {
      // For each y, check if all x positions in that row are occupied
      return Array.from({ length: boardX }, (_, x) =>
        this.map.has(posKey(x, y))
      ).every(Boolean);
    });
  }

  killLine(y: number): Board {
    return this.modifiedFilter(([x, oy]) => {
      if (oy > y) return [x, oy];
      if (oy === y) return null;
      return [x, oy + 1];
    });
  }
}

export function posKey(x: number, y: number): string {
  return `${x},${y}`;
}
