// src/ai.ts

// 0 = empty, 1 = human, 2 = AI
export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

export const ROWS = 6;
export const COLS = 7;

export const HUMAN: Cell = 1;
export const AI: Cell = 2;

// Difficulty: higher depth = stronger but slower
// these are levels from 1 to 5
const SEARCH_DEPTH = 5;

// ---------- Basic helpers ----------

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function dropPiece(
  board: Board,
  col: number,
  player: Cell
): { board: Board; row: number } | null {
  const newBoard = cloneBoard(board);

  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === 0) {
      newBoard[row][col] = player;
      return { board: newBoard, row };
    }
  }

  return null;
}

// Check if player has 4 in a row anywhere on the board
function hasWinner(board: Board, player: Cell): boolean {
  if (player === 0) return false;

  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      ) {
        return true;
      }
    }
  }

  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      ) {
        return true;
      }
    }
  }

  // diag down-right
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  // diag down-left
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c - 1] === player &&
        board[r + 2][c - 2] === player &&
        board[r + 3][c - 3] === player
      ) {
        return true;
      }
    }
  }

  return false;
}

function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function getValidColumns(board: Board): number[] {
  const valid: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) valid.push(c);
  }
  return valid;
}

// ---------- Heuristic evaluation ----------

// Evaluate a 4-cell window for the heuristic
function evaluateWindow(window: Cell[]): number {
  const aiCount = window.filter((c) => c === AI).length;
  const humanCount = window.filter((c) => c === HUMAN).length;
  const emptyCount = window.filter((c) => c === 0).length;

  let score = 0;
  if (aiCount === 4) {
    score += 1000;
  } else if (aiCount === 3 && emptyCount === 1) {
    score += 10;
  } else if (aiCount === 2 && emptyCount === 2) {
    score += 4;
  }

  // Strong patterns for human (bad for us)
  if (humanCount === 3 && emptyCount === 1) {
    score -= 8;
  } else if (humanCount === 2 && emptyCount === 2) {
    score -= 3;
  }

  return score;
}

function evaluateBoard(board: Board): number {
  let score = 0;
  const centerCol = Math.floor(COLS / 2);
  const centerArray = [];
  for (let r = 0; r < ROWS; r++) {
    centerArray.push(board[r][centerCol]);
  }
  const centerCount = centerArray.filter((c) => c === AI).length;
  score += centerCount * 6;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(window);
    }
  }

  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window);
    }
  }

  // Diagonal (down-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3],
      ];
      score += evaluateWindow(window);
    }
  }

  // Diagonal (down-left)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      const window = [
        board[r][c],
        board[r + 1][c - 1],
        board[r + 2][c - 2],
        board[r + 3][c - 3],
      ];
      score += evaluateWindow(window);
    }
  }

  return score;
}

// ---------- Minimax with alpha-beta pruning ----------

type MinimaxResult = { column: number | null; score: number };

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): MinimaxResult {
  const validColumns = getValidColumns(board);
  const terminal =
    hasWinner(board, AI) || hasWinner(board, HUMAN) || validColumns.length === 0;

  if (depth === 0 || terminal) {
    if (terminal) {
      if (hasWinner(board, AI)) {
        return { column: null, score: 1000000 };
      } else if (hasWinner(board, HUMAN)) {
        return { column: null, score: -1000000 };
      } else {
        return { column: null, score: 0 };
      }
    } else {
      return { column: null, score: evaluateBoard(board) };
    }
  }

  if (maximizingPlayer) {
    let value = Number.NEGATIVE_INFINITY;
    let bestColumn: number | null = validColumns[0] ?? null;

    for (const col of validColumns) {
      const result = dropPiece(board, col, AI);
      if (!result) continue;

      const newScore = minimax(result.board, depth - 1, alpha, beta, false).score;

      if (newScore > value) {
        value = newScore;
        bestColumn = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }

    return { column: bestColumn, score: value };
  } else {
    let value = Number.POSITIVE_INFINITY;
    let bestColumn: number | null = validColumns[0] ?? null;

    for (const col of validColumns) {
      const result = dropPiece(board, col, HUMAN);
      if (!result) continue;

      const newScore = minimax(result.board, depth - 1, alpha, beta, true).score;

      if (newScore < value) {
        value = newScore;
        bestColumn = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }

    return { column: bestColumn, score: value };
  }
}

// ---------- Public AI entry point ----------

export function chooseAIMove(board: Board): number | null {
  const valid = getValidColumns(board);
  if (valid.length === 0) return null;

  // Run minimax from this position -- slides for more info
  const { column } = minimax(
    board,
    SEARCH_DEPTH,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true
  );

  // Safety fallback
  if (column === null) {
    const validCols = getValidColumns(board);
    if (validCols.length === 0) return null;
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  return column;
}
