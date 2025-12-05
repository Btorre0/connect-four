import { useEffect, useState } from "react";
import "./App.css";
import type { Board, Cell } from "./ai";
import { ROWS, COLS, HUMAN, AI, chooseAIMove } from "./ai";

const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 0 as Cell)
  );

function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Cell>(HUMAN);
  const [winner, setWinner] = useState<Cell | "draw" | 0>(0);
  const [isAITurn, setIsAITurn] = useState(false);
  const [message, setMessage] = useState<string>("Your turn!");

  // Drop a piece for the given player in a column on the *real* board
  const dropOnRealBoard = (
    b: Board,
    col: number,
    player: Cell
  ): { board: Board; row: number } | null => {
    const newBoard = b.map((row) => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === 0) {
        newBoard[row][col] = player;
        return { board: newBoard, row };
      }
    }
    return null;
  };

  const checkWinAt = (b: Board, row: number, col: number, player: Cell): boolean => {
    if (player === 0) return false;

    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ];

    for (const [dr, dc] of dirs) {
      let count = 1;

      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r][c] === player) {
        count++;
        r += dr;
        c += dc;
      }

      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }

    return false;
  };

  const isBoardFull = (b: Board): boolean =>
    b.every((row) => row.every((cell) => cell !== 0));

  // Handle human click
  const handleColumnClick = (col: number) => {
    if (winner !== 0) return;
    if (currentPlayer !== HUMAN) return;
    if (isAITurn) return;

    const result = dropOnRealBoard(board, col, HUMAN);
    if (!result) return;

    const { board: newBoard, row } = result;
    const humanWon = checkWinAt(newBoard, row, col, HUMAN);

    setBoard(newBoard);

    if (humanWon) {
      setWinner(HUMAN);
      setMessage("You win! 🎉");
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner("draw");
      setMessage("It's a draw.");
      return;
    }

    // Switch to AI
    setCurrentPlayer(AI);
    setIsAITurn(true);
    setMessage("AI is thinking...");
  };

  // Let the AI move automatically on its turn
  useEffect(() => {
    if (!isAITurn) return;
    if (winner !== 0) return;
    if (currentPlayer !== AI) return;

    const timeout = setTimeout(() => {
      const col = chooseAIMove(board);
      if (col === null) {
        setIsAITurn(false);
        setMessage("No moves left.");
        return;
      }

      const result = dropOnRealBoard(board, col, AI);
      if (!result) {
        setIsAITurn(false);
        setCurrentPlayer(HUMAN);
        setMessage("Your turn!");
        return;
      }

      const { board: newBoard, row } = result;
      const aiWon = checkWinAt(newBoard, row, col, AI);

      setBoard(newBoard);

      if (aiWon) {
        setWinner(AI);
        setMessage("You lose!");
      } else if (isBoardFull(newBoard)) {
        setWinner("draw");
        setMessage("It's a draw.");
      } else {
        setCurrentPlayer(HUMAN);
        setMessage("Your turn!");
      }

      setIsAITurn(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [isAITurn, currentPlayer, winner, board]);

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(HUMAN);
    setWinner(0);
    setIsAITurn(false);
    setMessage("Your turn!");
  };

  return (
    <div className="app">
      <h1>Connect Four – Human vs AI</h1>
      <p className="status">{message}</p>

      <div className="board">
        {board.map((row, rIndex) => (
          <div key={rIndex} className="row">
            {row.map((cell, cIndex) => (
              <button
                key={cIndex}
                className={`cell ${cell === HUMAN ? "human" : ""} ${
                  cell === AI ? "ai" : ""
                }`}
                onClick={() => handleColumnClick(cIndex)}
                disabled={winner !== 0 || currentPlayer !== HUMAN || isAITurn}
              >
                {/* empty – purely visual via CSS */}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button className="reset" onClick={handleReset}>
        Reset Game
      </button>

      <div className="legend">
        <span className="dot human" /> You
        <span className="dot ai" /> AI
      </div>
    </div>
  );
}

export default App;
