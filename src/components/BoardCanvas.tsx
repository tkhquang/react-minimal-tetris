/**
 * BoardCanvas component handles all visual rendering of the game.
 * Uses HTML5 Canvas for efficient drawing of the game board,
 * pieces, and visual effects like flashing lines.
 */

import React from "react";
import type { Metrics, DrawEffect } from "../core/types";
import { Board } from "../core/Board";
import {
  getColorCode,
  parseRGBComponents,
  darkenColor,
} from "../utils/colorUtils";

interface BoardCanvasProps {
  metrics: Metrics;
  board: Board;
  drawEffect: DrawEffect;
}

/**
 * Canvas-based game renderer that draws the board state with visual effects.
 * Provides efficient rendering of blocks with 3D appearance and animations.
 */
const BoardCanvas = ({ metrics, board, drawEffect }: BoardCanvasProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  /**
   * Main rendering effect that draws the entire game board.
   * Re-renders whenever board state or effects change.
   */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas for fresh render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each cell in the game board
    for (let x = 0; x < metrics.boardX; x++) {
      for (let y = 0; y < metrics.boardY; y++) {
        const pos: [number, number] = [x, y];
        const color = board.get(pos);
        const bp = metrics.blockPixels;
        const borderSize = bp / 20; // Border is 5% of block size

        // Calculate rectangles for outer block and inner shaded area
        const outer: [number, number, number, number] = [
          x * bp, // Left position
          y * bp, // Top position
          bp, // Width
          bp, // Height
        ];
        const inner: [number, number, number, number] = [
          outer[0] + borderSize,
          outer[1] + borderSize,
          outer[2] - 2 * borderSize,
          outer[3] - 2 * borderSize,
        ];

        // Draw empty cell background
        ctx.fillStyle = "rgb(51,51,51)"; // Dark gray outer border
        ctx.fillRect(...outer);
        ctx.fillStyle = "rgb(26,26,26)"; // Darker inner area
        ctx.fillRect(...inner);

        // Draw colored block if cell is occupied
        if (color) {
          const code = getColorCode(color);
          ctx.fillStyle = code;
          ctx.fillRect(...outer);

          // Create darker shade for inner area (3D effect)
          const components = parseRGBComponents(code);
          if (components) {
            const [r, g, b] = components;
            ctx.fillStyle = darkenColor(r, g, b);
            ctx.fillRect(...inner);
          }
        }

        // Apply visual effects based on game state
        if (drawEffect.type === "Flash" && drawEffect.lines.includes(y)) {
          // White flash overlay for clearing lines
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillRect(...outer);
        } else if (drawEffect.type === "Darker") {
          // Dark overlay for game over state
          ctx.fillStyle = "rgba(0,0,0,0.9)";
          ctx.fillRect(...outer);
        }
      }
    }
  }, [metrics, board, drawEffect]);

  return (
    <canvas
      ref={canvasRef}
      width={metrics.boardX * metrics.blockPixels}
      height={metrics.boardY * metrics.blockPixels}
      style={{
        display: "block",
        border: "2px solid #333",
        backgroundColor: "#000",
      }}
    />
  );
};

export default BoardCanvas;
