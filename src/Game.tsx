import BoardCanvas from "./BoardCanvas";
import { useGameLogic } from "./GameLogic";
import { metrics, type DrawEffect } from "./Utils";
import { Board } from "./Board";

const Game = () => {
  const { gameState } = useGameLogic(metrics);

  const getRenderProps = (): { board: Board; drawEffect: DrawEffect } => {
    switch (gameState.type) {
      case "Falling": {
        const shifted = gameState.falling.shifted(gameState.shift);
        const merged = gameState.board.merged(shifted) || gameState.board;
        return {
          board: merged,
          drawEffect: { type: "None" },
        };
      }
      case "Flashing":
        return {
          board: gameState.board,
          drawEffect:
            gameState.stage % 2 === 0
              ? { type: "None" }
              : { type: "Flash", lines: gameState.lines },
        };
      case "GameOver":
        return {
          board: gameState.board,
          drawEffect: { type: "Darker" },
        };
    }
  };

  const { board, drawEffect } = getRenderProps();

  return (
    <BoardCanvas metrics={metrics} board={board} drawEffect={drawEffect} />
  );
};

export default Game;
