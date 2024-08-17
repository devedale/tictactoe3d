type Board2D = (null | 'X' | 'O')[][];
type Board3D = (null | 'X' | 'O')[][][];
type Coordinate2D = [number, number];
type Coordinate3D = [number, number, number];
type NDimensionalArray = number | NDimensionalArray[];
type Move = {
  playerId: number;
  position: Coordinate2D | Coordinate3D | 'RESIGN';
  timestamp: Date;
};
