import React from "react";
import { type Metrics, type DrawEffect, getColorCode } from "./Utils";
import { Board } from "./Board";

interface BoardCanvasProps {
  metrics: Metrics;
  board: Board;
  drawEffect: DrawEffect;
}

const BoardCanvas = ({ metrics, board, drawEffect }: BoardCanvasProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < metrics.boardX; x++) {
      for (let y = 0; y < metrics.boardY; y++) {
        const pos: [number, number] = [x, y];
        const color = board.get(pos);
        const bp = metrics.blockPixels;
        const bs = bp / 20;
        const outer: [number, number, number, number] = [
          x * bp,
          y * bp,
          bp,
          bp,
        ];
        const inner: [number, number, number, number] = [
          outer[0] + bs,
          outer[1] + bs,
          outer[2] - 2 * bs,
          outer[3] - 2 * bs,
        ];

        ctx.fillStyle = "rgb(51,51,51)";
        ctx.fillRect(...outer);
        ctx.fillStyle = "rgb(26,26,26)";
        ctx.fillRect(...inner);

        if (color) {
          const code = getColorCode(color);
          ctx.fillStyle = code;
          ctx.fillRect(...outer);
          const match = code.match(/\d+/g);

          if (match) {
            const [r, g, b] = match.map(Number);
            ctx.fillStyle = `rgb(${r * 0.8},${g * 0.8},${b * 0.8})`;
            ctx.fillRect(...inner);
          }
        }

        if (drawEffect.type === "Flash" && drawEffect.lines.includes(y)) {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillRect(...outer);
        } else if (drawEffect.type === "Darker") {
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
    />
  );
};

export default BoardCanvas;
