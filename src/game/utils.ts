// src/game/utils.ts
import type { Board } from "./types";
import { Columns } from "./constaints";

export function getValidColumns(board: Board): number[] {
  const valid: number[] = [];
  for (let c = 0; c < Columns; c++) {
    if (board.rows[0].columns[c].player === null) valid.push(c);
  }
  return valid;
}

export function isBoardFull(board: Board): boolean {
  return getValidColumns(board).length === 0;
}
