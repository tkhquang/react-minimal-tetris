/**
 * Main Game component that orchestrates the Tetris game.
 * This component manages the game state and rendering logic,
 * providing the connection between game logic and visual display.
 */

import BoardCanvas from "./BoardCanvas";
import { useGameLogic } from "../hooks/useGameLogic";
import { DEFAULT_METRICS } from "../core/constants";
import { Board } from "../core/Board";
import type { DrawEffect } from "../core/types";
import VirtualControls from "./VirtualControls";

/**
 * Game component serves as the main container for the Tetris game.
 * It uses the game logic hook to manage state and determines what
 * should be rendered based on the current game state.
 */
const Game = () => {
  const { gameState } = useGameLogic(DEFAULT_METRICS);

  /**
   * Determines what board state and visual effects to render
   * based on the current game state. This function handles
   * the logic for combining the falling piece with the board
   * and applying appropriate visual effects.
   *
   * @returns Board state and draw effect for current frame
   */
  const getRenderProps = (): { board: Board; drawEffect: DrawEffect } => {
    switch (gameState.type) {
      case "Falling": {
        // Merge the falling piece with the board for rendering
        const shifted = gameState.falling.shifted(gameState.shift);
        const merged = gameState.board.merged(shifted) || gameState.board;
        return {
          board: merged,
          drawEffect: { type: "None" },
        };
      }

      case "Flashing": {
        // Alternate between normal and flashed state for animation
        return {
          board: gameState.board,
          drawEffect:
            gameState.stage % 2 === 0
              ? { type: "None" }
              : { type: "Flash", lines: gameState.lines },
        };
      }

      case "GameOver": {
        // Show darkened board for game over state
        return {
          board: gameState.board,
          drawEffect: { type: "Darker" },
        };
      }
    }
  };

  const { board, drawEffect } = getRenderProps();

  return (
    <div
      className="game-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#111",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div>
          <h1
            style={{
              color: "#fff",
              textAlign: "center",
              marginBottom: "20px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Tetris
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BoardCanvas
              metrics={DEFAULT_METRICS}
              board={board}
              drawEffect={drawEffect}
            />
            <VirtualControls gameState={gameState} />
          </div>
          <div
            style={{
              color: "#fff",
              textAlign: "center",
              marginTop: "20px",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            <p>
              Keyboard: ← → ↓ to move, ↑ to rotate CCW, Space to rotate CW. If
              Game Over, Press Enter to restart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
