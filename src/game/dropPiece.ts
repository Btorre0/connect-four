// src/game/dropPiece.ts
import type { Board, Player } from "./types";
import { Rows } from "./constaints";

export function cloneBoard(board: Board): Board {
  return {
    rows: board.rows.map((row) => ({
      columns: row.columns.map((col) => ({ player: col.player })),
    })),
  };
}

/**
 * Pure drop: does NOT mutate the input board.
 * Returns the new board + the row where the piece landed.
 */
export function dropPiece(
  board: Board,
  col: number,
  player: Player
): { board: Board; row: number } | null {
  const newBoard = cloneBoard(board);

  for (let row = Rows - 1; row >= 0; row--) {
    if (newBoard.rows[row].columns[col].player === null) {
      newBoard.rows[row].columns[col].player = player;
      return { board: newBoard, row };
    }
  }

  return null; // column full
}
