// src/game/checkWin.ts
import type { Board, Player } from "./types";
import { Rows, Columns } from "./constaints";

export function checkWin(board: Board, player: Player): boolean {
  // horizontal
  for (let r = 0; r < Rows; r++) {
    for (let c = 0; c < Columns - 3; c++) {
      if (
        board.rows[r].columns[c].player === player &&
        board.rows[r].columns[c + 1].player === player &&
        board.rows[r].columns[c + 2].player === player &&
        board.rows[r].columns[c + 3].player === player
      ) return true;
    }
  }

  // vertical
  for (let c = 0; c < Columns; c++) {
    for (let r = 0; r < Rows - 3; r++) {
      if (
        board.rows[r].columns[c].player === player &&
        board.rows[r + 1].columns[c].player === player &&
        board.rows[r + 2].columns[c].player === player &&
        board.rows[r + 3].columns[c].player === player
      ) return true;
    }
  }

  // diagonal down-right
  for (let r = 0; r < Rows - 3; r++) {
    for (let c = 0; c < Columns - 3; c++) {
      if (
        board.rows[r].columns[c].player === player &&
        board.rows[r + 1].columns[c + 1].player === player &&
        board.rows[r + 2].columns[c + 2].player === player &&
        board.rows[r + 3].columns[c + 3].player === player
      ) return true;
    }
  }

  // diagonal down-left
  for (let r = 0; r < Rows - 3; r++) {
    for (let c = 3; c < Columns; c++) {
      if (
        board.rows[r].columns[c].player === player &&
        board.rows[r + 1].columns[c - 1].player === player &&
        board.rows[r + 2].columns[c - 2].player === player &&
        board.rows[r + 3].columns[c - 3].player === player
      ) return true;
    }
  }

  return false;
}
