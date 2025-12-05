import './GameOverModal.css';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

interface Props {
  open: boolean;
  winner: 0 | 1 | 2 | "draw";
  stats: GameStats;
  onRematch: () => void;
  onClose: () => void;
}

export default function GameOverModal({ open, winner, stats, onRematch, onClose }: Props) {
  if (!open) return null;

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winPercentage = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : "0";

  let message = "";
  if (winner === 1) {
    message = "🎉 Congratulations! You Win! 🎉";
  } else if (winner === 2) {
    message = "😔 You Lost. Better Luck Next Time!";
  } else if (winner === "draw") {
    message = "🤝 It's a Draw!";
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="game-over-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{message}</h2>
        
        <div className="modal-stats">
          <h3>Your Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.losses}</div>
              <div className="stat-label">Losses</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.draws}</div>
              <div className="stat-label">Draws</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{winPercentage}%</div>
              <div className="stat-label">Win Rate</div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn rematch-btn" onClick={onRematch}>
            Rematch
          </button>
          <button className="modal-btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

