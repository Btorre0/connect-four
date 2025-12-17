import { useEffect, useMemo, useState } from "react";
import type { Board, Row, Player } from "../../game/types";
import GameRow from "./GameRow";
import { dropPiece } from "../../game/dropPiece";
import { createEmptyBoard } from "../../game/createBoard";
import { checkWin } from "../../game/checkWin";
import PopupWindow from "../popup/PopupWindow";
import { HUMAN_PLAYER, AI_PLAYER } from "../../game/ai";

const GameBoard = () => {
  // Make sure initial board doesn't get recreated unexpectedly
  const initialBoard = useMemo(() => createEmptyBoard(), []);

  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(HUMAN_PLAYER);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [frozen, setFrozen] = useState<boolean>(false);

  const updateBoard = (columnID: number): void => {
    if (frozen) return;

    const res = dropPiece(board, columnID, currentPlayer);
    if (!res) return;

    setBoard(res.board);

    // ✅ checkWin is now (board, player)
    if (checkWin(res.board, currentPlayer)) {
      setWinner(currentPlayer);
      setFrozen(true);
      return;
    }

    // switch player
    setCurrentPlayer((p) => (p === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER));
  };

  const resetBoard = (): void => {
    setFrozen(false);
    setWinner(null);
    setCurrentPlayer(HUMAN_PLAYER);
    setBoard(createEmptyBoard()); // fresh board each reset
    setShowPopup(false);
  };

  useEffect(() => {
    if (winner !== null) {
      const timer = setTimeout(() => setShowPopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  const winnerLabel =
    winner === HUMAN_PLAYER ? "Human" : winner === AI_PLAYER ? "AI" : "";

  return (
    <div>
      <button className="button" onClick={resetBoard}>
        New Game
      </button>

      <div className="board">
        {board.rows.map((row: Row, i: number) => (
          <GameRow key={i} row={row} onColumnClick={updateBoard} />
        ))}
      </div>

      <PopupWindow
        open={showPopup}
        message={`${winnerLabel} wins!\nStart a new game?`}
        onCancel={() => setShowPopup(false)}
        onConfirm={resetBoard}
      />
    </div>
  );
};

export default GameBoard;
