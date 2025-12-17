import type { Column } from "../../game/types";
import { HUMAN_PLAYER, AI_PLAYER } from "../../game/ai";

type Props = {
  column: Column;
  columnID: number;
  onColumnClick: (columnID: number) => void;
};

const GameColumn = ({ column, columnID, onColumnClick }: Props) => {
  const className =
    column.player === HUMAN_PLAYER
      ? "cell human"
      : column.player === AI_PLAYER
      ? "cell ai"
      : "cell";

  return (
    <button
      className={className}
      onClick={() => onColumnClick(columnID)}
      aria-label={`Column ${columnID + 1}`}
    />
  );
};

export default GameColumn;
