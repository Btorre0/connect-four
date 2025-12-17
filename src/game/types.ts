export type Player = "red" | "yellow" | null;

export type Column = {
  player: Player;
};

export type Row = {
  columns: Column[];
};

export type Board = {
  rows: Row[];
};
