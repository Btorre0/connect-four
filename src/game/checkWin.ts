import { Columns, Rows } from "./constaints"
import type { Board, Row } from "./types";

export function checkWin(board: Board, rowID: number, columnID: number): boolean {
    if (checkHorizontal(board, rowID) || 
        checkVertical(board, columnID) || 
        checkDiagonalLeft(board, rowID, columnID) ||
        checkDiagonalRight(board, rowID, columnID)) {
            return true;
    }
    return false;
}

function checkHorizontal(board: Board, rowID: number): boolean {
    let consecutiveCell: number = 1;
    let row: Row = board.rows[rowID];
    for (let i: number = 0; i<Columns-1; i++) {
        if (row.columns[i].player != null &&
            row.columns[i].player === row.columns[i+1].player) {
            consecutiveCell++;
            if (consecutiveCell >= 4) return true;
        }
        else {
            consecutiveCell = 1;
        }
    }
    return false;
}

function checkVertical(board: Board, columnID: number): boolean {
    let consecutiveCell: number = 1;
    for (let i: number = 0; i<Rows-1; i++) {
        if (board.rows[i].columns[columnID].player != null &&
            board.rows[i].columns[columnID].player === board.rows[i+1].columns[columnID].player) {
            consecutiveCell++;
            if (consecutiveCell >= 4) return true;
        }
        else {
            consecutiveCell = 1;
        }
    }
    return false;
}

function checkDiagonalLeft(board: Board, rowID: number, columnID: number): boolean {
    let consecutiveCell: number = 1;
    let ic: number, ir: number;
    if (rowID >= columnID) {
        ir = rowID - columnID;
        ic = 0;
    }
    else {
        ir = 0;
        ic = columnID - rowID;
    }
    while (ir < Rows-1 && ic < Columns-1) {
        if (board.rows[ir].columns[ic].player != null &&
            board.rows[ir].columns[ic].player === board.rows[ir+1].columns[ic+1].player) {
            consecutiveCell++;
            if (consecutiveCell >= 4) return true;
        }
        else {
            consecutiveCell = 1;
        }
        ir++;
        ic++;
    }
    return false;
}

function checkDiagonalRight(board: Board, rowID: number, columnID: number): boolean {
    let consecutiveCell: number = 1;
    let ic: number, ir: number;
    if (rowID + columnID >= 5) {
        ir = 5;
        ic = rowID + columnID - 5;
    }
    else {
        ir = rowID + columnID;
        ic = 0;
    }
    while (ir > 1 && ic < Columns-1) {
        if (board.rows[ir].columns[ic].player != null &&
            board.rows[ir].columns[ic].player === board.rows[ir-1].columns[ic+1].player) {
            consecutiveCell++;
            if (consecutiveCell >= 4) return true;
        }
        else {
            consecutiveCell = 1;
        }
        ir--;
        ic++;
    }
    return false;
}