import type { Column } from '../../game/types';

type Props = {
    column: Column;
    columnID: number;
    onColumnClick: (columnID: number) => void
}
const GameColumn = ({column, columnID, onColumnClick}: Props) => {
    let tileStatus = "open";
    if (column.player === 1) {
        tileStatus = "player1"
    }
    else if (column.player === 2) {
        tileStatus = "player2"
    }

    return (
        <div className='tile' onClick={() => onColumnClick(columnID)}>
            <div className={`circle + ${tileStatus}`}></div>
        </div>
    )
}
export default GameColumn;