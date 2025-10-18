import type { Board } from "./types";
import { Rows, Columns } from "./constaints";

export function createEmptyBoard(): Board {
    return {
        rows: Array.from({length: Rows}, (_, i) => ({
            columns: Array.from({length: Columns}, (_, i) => ({
                player: null
            }))
        }))
    }
}