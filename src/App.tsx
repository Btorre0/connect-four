import { useEffect, useState } from "react";
import "./App.css";

import type { Board, Player } from "./game/types";
import { createEmptyBoard } from "./game/createBoard";
import { dropPiece } from "./game/dropPiece";
import { checkWin } from "./game/checkWin";
import { isBoardFull } from "./game/utils";
import { chooseAIMove, HUMAN_PLAYER, AI_PLAYER } from "./game/ai";
import { Rows, Columns } from "./game/constaints";

type Winner = Player | "draw" | null;

function App() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(HUMAN_PLAYER);
  const [winner, setWinner] = useState<Winner>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const [message, setMessage] = useState("Your turn!");
  const [lastMove, setLastMove] = useState<{ r: number; c: number } | null>(null);

  const handleColumnClick = (col: number) => {
    if (winner !== null) return;
    if (currentPlayer !== HUMAN_PLAYER) return;
    if (isAITurn) return;

    const result = dropPiece(board, col, HUMAN_PLAYER);
    if (!result) return;

    setBoard(result.board);
    setLastMove({ r: result.row, c: col });

    if (checkWin(result.board, HUMAN_PLAYER)) {
      setWinner(HUMAN_PLAYER);
      setMessage("You win!!!");
      return;
    }

    if (isBoardFull(result.board)) {
      setWinner("draw");
      setMessage("It's a draw.");
      return;
    }

    setCurrentPlayer(AI_PLAYER);
    setIsAITurn(true);
    setMessage("AI is thinking...");
  };

  useEffect(() => {
    if (!isAITurn) return;
    if (winner !== null) return;
    if (currentPlayer !== AI_PLAYER) return;

    const timeout = setTimeout(() => {
      const col = chooseAIMove(board);
      if (col === null) {
        setWinner("draw");
        setMessage("No moves left.");
        setIsAITurn(false);
        return;
      }

      const result = dropPiece(board, col, AI_PLAYER);
      if (!result) {
        setIsAITurn(false);
        setCurrentPlayer(HUMAN_PLAYER);
        setMessage("Your turn!");
        return;
      }

      setBoard(result.board);
      setLastMove({ r: result.row, c: col });

      if (checkWin(result.board, AI_PLAYER)) {
        setWinner(AI_PLAYER);
        setMessage("AI wins!!!");
      } else if (isBoardFull(result.board)) {
        setWinner("draw");
        setMessage("It's a draw.");
      } else {
        setCurrentPlayer(HUMAN_PLAYER);
        setMessage("Your turn!");
      }

      setIsAITurn(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isAITurn, currentPlayer, winner, board]);

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(HUMAN_PLAYER);
    setWinner(null);
    setIsAITurn(false);
    setLastMove(null);
    setMessage("Your turn!");
  };

  const renderCellClass = (player: Player) => {
    if (player === HUMAN_PLAYER) return "cell human";
    if (player === AI_PLAYER) return "cell ai";
    return "cell";
  };

  return (
    <div className="app">
      <h1>Connect Four – Human vs AI</h1>
      <p className="status">{message}</p>

      <div className={`board ${isAITurn ? "thinking" : ""}`}>
        {board.rows.map((row, rIndex) => (
          <div key={rIndex} className="row">
            {row.columns.map((colObj, cIndex) => (
              <button
                key={cIndex}
                className={`${renderCellClass(colObj.player)} ${
                  lastMove?.r === rIndex && lastMove?.c === cIndex ? "drop" : ""
                }`}
                onClick={() => handleColumnClick(cIndex)}
                disabled={
                  winner !== null || currentPlayer !== HUMAN_PLAYER || isAITurn
                }
                aria-label={`Column ${cIndex + 1}`}
              />
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

      <p style={{ opacity: 0.6, marginTop: 8, fontSize: 12 }}>
        Board size: {Rows} × {Columns}
      </p>
    </div>
  );
}

export default App;