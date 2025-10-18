import { Rows } from "./constaints";
import type { Board } from "./types";

export function dropPiece(board: Board, columnID: number, player: number) {
    for(let i = Rows - 1; i >= 0; i--) {
        if (board.rows[i].columns[columnID].player === null) {
            const newBoard: Board = {
                rows: board.rows.map((row, ri) => ({
                    columns: row.columns.map((column, ci) => (
                        ri === i && ci === columnID ? {player} : column
                    ))
                }))
            }
            return {board: newBoard, rowID: i};
        }
    }
    return null;
}