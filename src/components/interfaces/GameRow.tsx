import type { Row, Column } from '../../game/types';
import GameColumn from './GameColumn';

type Props = {
    row: Row;
    onColumnClick: (columnID: number) => void;
};
const GameRow = ({row, onColumnClick}: Props) => {
    return (
        <div className='rows'>
            {row.columns.map((column: Column, i: number ) => (
                <GameColumn 
                    key={i} 
                    column={column} 
                    columnID={i} 
                    onColumnClick={onColumnClick}/>
            ))}
        </div>
    )
}
export default GameRow;