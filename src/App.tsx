import { useEffect, useState } from "react";
import "./App.css";
import type { Board, Cell } from "./ai";
import { ROWS, COLS, HUMAN, AI, chooseAIMove } from "./ai";
import GameOverModal from "./components/GameOverModal";
import InstructionsPanel from "./components/InstructionsPanel";

const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 0 as Cell)
  );

interface WinLine {
  positions: Array<{ row: number; col: number }>;
}

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

const STATS_KEY = "connect4_stats";

function loadStats(): GameStats {
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { wins: 0, losses: 0, draws: 0 };
    }
  }
  return { wins: 0, losses: 0, draws: 0 };
}

function saveStats(stats: GameStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Cell>(HUMAN);
  const [winner, setWinner] = useState<Cell | "draw" | 0>(0);
  const [isAITurn, setIsAITurn] = useState(false);
  const [message, setMessage] = useState<string>("Your turn!");
  const [winLine, setWinLine] = useState<WinLine | null>(null);
  const [animatingCell, setAnimatingCell] = useState<{ row: number; col: number } | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [gameStats, setGameStats] = useState<GameStats>(loadStats);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

  const checkWinAt = (b: Board, row: number, col: number, player: Cell): WinLine | null => {
    if (player === 0) return null;

    const dirs = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1]   // diagonal down-left
    ];

    for (const [dr, dc] of dirs) {
      const positions: Array<{ row: number; col: number }> = [{ row, col }];
      
      // Check in positive direction
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r][c] === player) {
        positions.push({ row: r, col: c });
        r += dr;
        c += dc;
      }

      // Check in negative direction
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r][c] === player) {
        positions.unshift({ row: r, col: c });
        r -= dr;
        c -= dc;
      }

      if (positions.length >= 4) {
        return { positions: positions.slice(0, 4) };
      }
    }

    return null;
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
    
    // Set animation
    setAnimatingCell({ row, col });
    setMoveCount(moveCount + 1);

    // Clear animation after delay
    setTimeout(() => {
      setAnimatingCell(null);
    }, 600);

    const winLineResult = checkWinAt(newBoard, row, col, HUMAN);
    setBoard(newBoard);

    if (winLineResult) {
      setWinLine(winLineResult);
      setWinner(HUMAN);
      setMessage("You win! 🎉");
      setGameStats(prev => {
        const newStats = { ...prev, wins: prev.wins + 1 };
        saveStats(newStats);
        return newStats;
      });
      setTimeout(() => setShowGameOverModal(true), 1000);
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner("draw");
      setMessage("It's a draw.");
      setGameStats(prev => {
        const newStats = { ...prev, draws: prev.draws + 1 };
        saveStats(newStats);
        return newStats;
      });
      setTimeout(() => setShowGameOverModal(true), 1000);
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
      
      // Set animation
      setAnimatingCell({ row, col });
      setMoveCount(prev => prev + 1);

      // Clear animation after delay
      setTimeout(() => {
        setAnimatingCell(null);
      }, 600);

      const winLineResult = checkWinAt(newBoard, row, col, AI);
      setBoard(newBoard);

      if (winLineResult) {
        setWinLine(winLineResult);
        setWinner(AI);
        setMessage("You lose!");
        setGameStats(prev => {
          const newStats = { ...prev, losses: prev.losses + 1 };
          saveStats(newStats);
          return newStats;
        });
        setTimeout(() => setShowGameOverModal(true), 1000);
      } else if (isBoardFull(newBoard)) {
        setWinner("draw");
        setMessage("It's a draw.");
        setGameStats(prev => {
          const newStats = { ...prev, draws: prev.draws + 1 };
          saveStats(newStats);
          return newStats;
        });
        setTimeout(() => setShowGameOverModal(true), 1000);
      } else {
        setCurrentPlayer(HUMAN);
        setMessage("Your turn!");
      }

      setIsAITurn(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [isAITurn, currentPlayer, winner, board]);

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(HUMAN);
    setWinner(0);
    setIsAITurn(false);
    setMessage("Your turn!");
    setWinLine(null);
    setAnimatingCell(null);
    setHoveredColumn(null);
    setMoveCount(0);
    setShowGameOverModal(false);
  };

  const handleRematch = () => {
    handleReset();
    setShowGameOverModal(false);
  };

  const isWinningCell = (row: number, col: number): boolean => {
    if (!winLine) return false;
    return winLine.positions.some((pos) => pos.row === row && pos.col === col);
  };

  const isAnimating = (row: number, col: number): boolean => {
    if (!animatingCell) return false;
    return animatingCell.row === row && animatingCell.col === col;
  };

  const isValidColumn = (col: number): boolean => {
    return board[0][col] === 0;
  };

  const getDropRow = (col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === 0) {
        return row;
      }
    }
    return null;
  };

  return (
    <div className="app">
      <div className="header-section">
        <h1>Connect Four – Human vs AI</h1>
        <button 
          className="instructions-btn" 
          onClick={() => setShowInstructions(!showInstructions)}
          aria-label="Toggle instructions"
        >
          {showInstructions ? "✕" : "?"}
        </button>
      </div>

      {showInstructions && <InstructionsPanel onClose={() => setShowInstructions(false)} />}

      <div className="game-info">
        <p className="status">{message}</p>
        <div className="move-counter">Moves: {moveCount}</div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Wins:</span>
          <span className="stat-value">{gameStats.wins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Losses:</span>
          <span className="stat-value">{gameStats.losses}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draws:</span>
          <span className="stat-value">{gameStats.draws}</span>
        </div>
      </div>

      <div className="board-container">
        <div className="board">
          {board.map((row, rIndex) => (
            <div key={rIndex} className="row">
              {row.map((cell, cIndex) => {
                const dropRow = hoveredColumn !== null ? getDropRow(hoveredColumn) : null;
                const isHovered = hoveredColumn === cIndex && isValidColumn(cIndex) && currentPlayer === HUMAN && !isAITurn && winner === 0;
                const showDropIndicator = isHovered && dropRow === rIndex && cell === 0;
                const isWinner = isWinningCell(rIndex, cIndex);
                const isAnimatingCell = isAnimating(rIndex, cIndex);
                
                return (
                  <button
                    key={cIndex}
                    className={`cell ${cell === HUMAN ? "human" : ""} ${
                      cell === AI ? "ai" : ""
                    } ${isWinner ? "winning" : ""} ${isAnimatingCell ? "animating" : ""} ${
                      isHovered ? "hovered" : ""
                    }`}
                    onClick={() => handleColumnClick(cIndex)}
                    onMouseEnter={() => isValidColumn(cIndex) && setHoveredColumn(cIndex)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    disabled={winner !== 0 || currentPlayer !== HUMAN || isAITurn || !isValidColumn(cIndex)}
                    aria-label={`Column ${cIndex + 1}, Row ${rIndex + 1}`}
                  >
                    {showDropIndicator && (
                      <div className="drop-indicator"></div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button className="reset" onClick={handleReset}>
        Reset Game
      </button>

      <div className="legend">
        <span className="dot human" /> You
        <span className="dot ai" /> AI
      </div>

      <GameOverModal
        open={showGameOverModal}
        winner={winner}
        stats={gameStats}
        onRematch={handleRematch}
        onClose={() => setShowGameOverModal(false)}
      />
    </div>
  );
}

export default App;
