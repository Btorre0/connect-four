import  { useEffect, useState } from 'react';
import type { Board, Row } from '../../game/types';
import GameRow from './GameRow';
import { dropPiece } from '../../game/dropPiece';
import { createEmptyBoard } from '../../game/createBoard';
import { checkWin } from '../../game/checkWin';
import PopupWindow from '../popup/PopupWindow';


const GameBoard = () => {
    const initialBoard = createEmptyBoard();
    const [board, setBoard] = useState<Board>(initialBoard);
    const [currentPlayer, setCurrentPlayer] = useState<number>(1)
    const [winner, setWinner] = useState<number|null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [frozen, setFrozen] = useState<boolean>(false);

    const updateBoard = (columnID: number): void => {
        if (frozen) return;
        const res = dropPiece(board, columnID, currentPlayer);
        if (!res) return;
        setBoard(res.board);
        if (checkWin(res.board, res.rowID, columnID)) {
            setWinner(currentPlayer);
            setFrozen(true);
            return;
        }
        setCurrentPlayer(currentPlayer => (currentPlayer === 1 ? 2 : 1))
    }

    const resetBoard = (): void => {
        setFrozen(false);
        setWinner(null);
        setCurrentPlayer(1);
        setBoard(initialBoard);
    }

    useEffect(() => {
        if (winner) {
            const timer = setTimeout(() => {setShowPopup(true)}, 500);
            return () => {clearTimeout(timer)};
        }
    }, [winner])

    return (
        <div>
            <button className='button' onClick={resetBoard}>New Game</button>
            <div className='board'>
                {board.rows.map((row: Row, i: number) => (
                    <GameRow 
                        key={i} 
                        row={row}
                        onColumnClick={updateBoard}
                    />
                ))}
            </div>

            <div>
                <PopupWindow
                    open={showPopup}
                    message = {`Player ${winner} win!\nStart a new game?`}
                    onCancel={() => {
                        setShowPopup(false)}
                    }
                    onConfirm={() => {
                        resetBoard();
                        setShowPopup(false);
          }}
        />
            </div>
        </div>
    );
}
export default GameBoard;