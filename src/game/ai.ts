// src/game/ai.ts
import type { Board, Player } from "./types";
import { Columns, Rows } from "./constaints";
import { dropPiece } from "./dropPiece";
import { checkWin } from "./checkWin";
import { getValidColumns } from "./utils";

export const HUMAN_PLAYER: Player = "red";
export const AI_PLAYER: Player = "yellow";

// 1–5 like you wanted
const SEARCH_DEPTH = 5;

type MinimaxResult = { column: number | null; score: number };
// Evaluate a window of 4 cells and return a score
function evaluateWindow(window: Player[]): number {
  const aiCount = window.filter((p) => p === AI_PLAYER).length;
  const humanCount = window.filter((p) => p === HUMAN_PLAYER).length;
  const emptyCount = window.filter((p) => p === null).length;

  let score = 0;

  if (aiCount === 4) score += 1000;
  else if (aiCount === 3 && emptyCount === 1) score += 10;
  else if (aiCount === 2 && emptyCount === 2) score += 4;

  if (humanCount === 3 && emptyCount === 1) score -= 8;
  else if (humanCount === 2 && emptyCount === 2) score -= 3;

  return score;
}

function evaluateBoard(board: Board): number {
  let score = 0;

  // center column preference
  const centerCol = Math.floor(Columns / 2);
  let centerCount = 0;
  for (let r = 0; r < Rows; r++) {
    if (board.rows[r].columns[centerCol].player === AI_PLAYER) centerCount++;
  }
  score += centerCount * 6;

  // horizontal windows
  for (let r = 0; r < Rows; r++) {
    for (let c = 0; c < Columns - 3; c++) {
      const window: Player[] = [
        board.rows[r].columns[c].player,
        board.rows[r].columns[c + 1].player,
        board.rows[r].columns[c + 2].player,
        board.rows[r].columns[c + 3].player,
      ];
      score += evaluateWindow(window);
    }
  }

  // vertical windows
  for (let c = 0; c < Columns; c++) {
    for (let r = 0; r < Rows - 3; r++) {
      const window: Player[] = [
        board.rows[r].columns[c].player,
        board.rows[r + 1].columns[c].player,
        board.rows[r + 2].columns[c].player,
        board.rows[r + 3].columns[c].player,
      ];
      score += evaluateWindow(window);
    }
  }

  // diag down-right
  for (let r = 0; r < Rows - 3; r++) {
    for (let c = 0; c < Columns - 3; c++) {
      const window: Player[] = [
        board.rows[r].columns[c].player,
        board.rows[r + 1].columns[c + 1].player,
        board.rows[r + 2].columns[c + 2].player,
        board.rows[r + 3].columns[c + 3].player,
      ];
      score += evaluateWindow(window);
    }
  }

  // diag down-left
  for (let r = 0; r < Rows - 3; r++) {
    for (let c = 3; c < Columns; c++) {
      const window: Player[] = [
        board.rows[r].columns[c].player,
        board.rows[r + 1].columns[c - 1].player,
        board.rows[r + 2].columns[c - 2].player,
        board.rows[r + 3].columns[c - 3].player,
      ];
      score += evaluateWindow(window);
    }
  }

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): MinimaxResult {
  const validColumns = getValidColumns(board);
  const terminal =
    checkWin(board, AI_PLAYER) ||
    checkWin(board, HUMAN_PLAYER) ||
    validColumns.length === 0;

  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, AI_PLAYER)) return { column: null, score: 1000000 };
      if (checkWin(board, HUMAN_PLAYER)) return { column: null, score: -1000000 };
      return { column: null, score: 0 };
    }
    return { column: null, score: evaluateBoard(board) };
  }

  if (maximizing) {
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestColumn: number | null = validColumns[0] ?? null;

    for (const col of validColumns) {
      const res = dropPiece(board, col, AI_PLAYER);
      if (!res) continue;

      const score = minimax(res.board, depth - 1, alpha, beta, false).score;
      if (score > bestScore) {
        bestScore = score;
        bestColumn = col;
      }

      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }

    return { column: bestColumn, score: bestScore };
  }

  // minimizing (human turn)
  let bestScore = Number.POSITIVE_INFINITY;
  let bestColumn: number | null = validColumns[0] ?? null;

  for (const col of validColumns) {
    const res = dropPiece(board, col, HUMAN_PLAYER);
    if (!res) continue;

    const score = minimax(res.board, depth - 1, alpha, beta, true).score;
    if (score < bestScore) {
      bestScore = score;
      bestColumn = col;
    }

    beta = Math.min(beta, bestScore);
    if (alpha >= beta) break;
  }

  return { column: bestColumn, score: bestScore };
}

export function chooseAIMove(board: Board): number | null {
  const valid = getValidColumns(board);
  if (valid.length === 0) return null;

  const { column } = minimax(
    board,
    SEARCH_DEPTH,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true
  );

  return column ?? valid[Math.floor(Math.random() * valid.length)];
}