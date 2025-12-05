import './InstructionsPanel.css';

interface Props {
  onClose: () => void;
}

export default function InstructionsPanel({ onClose }: Props) {
  return (
    <div className="instructions-panel">
      <div className="instructions-header">
        <h2>How to Play Connect Four</h2>
        <button className="close-instructions" onClick={onClose} aria-label="Close instructions">
          ✕
        </button>
      </div>
      
      <div className="instructions-content">
        <div className="instruction-section">
          <h3>🎯 Objective</h3>
          <p>Be the first player to connect four of your pieces in a row—horizontally, vertically, or diagonally!</p>
        </div>

        <div className="instruction-section">
          <h3>🎮 How to Play</h3>
          <ol>
            <li>Click on any column to drop your piece (orange)</li>
            <li>The piece will fall to the lowest available position in that column</li>
            <li>After your move, the AI will make its move (blue)</li>
            <li>Continue taking turns until someone wins or the board is full</li>
          </ol>
        </div>

        <div className="instruction-section">
          <h3>🤖 About the AI</h3>
          <p>
            Your opponent uses a <strong>minimax algorithm with alpha-beta pruning</strong> to make strategic moves.
            The AI evaluates multiple moves ahead and uses heuristics to choose the best move.
          </p>
        </div>

        <div className="instruction-section">
          <h3>💡 Tips</h3>
          <ul>
            <li>Control the center columns—they give you more winning opportunities</li>
            <li>Watch for your opponent's three-in-a-row setups</li>
            <li>Block your opponent while building your own winning sequences</li>
            <li>Think multiple moves ahead</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

