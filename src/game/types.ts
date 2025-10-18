export interface Board {
    rows: Row[]
}

export interface Row {
    columns: Column[]
}

export interface Column {
    player: number | null
}