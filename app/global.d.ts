// Define a type for a 2D board, where each cell can be null, 'X', or 'O'
type Board2D = (null | 'X' | 'O')[][];

// Define a type for a 3D board, where each cell can be null, 'X', or 'O'
type Board3D = (null | 'X' | 'O')[][][];

// Define a type for 2D coordinates, which are tuples of two numbers
type Coordinate2D = [number, number];

// Define a type for 3D coordinates, which are tuples of three numbers
type Coordinate3D = [number, number, number];

// Define a recursive type for an N-dimensional array, which can be a number or an array of numbers
type NDimensionalArray = number | NDimensionalArray[];

// Define a type for a move, which includes a playerId, a position (which can be 2D, 3D, or 'RESIGN'), and a timestamp
type Move = {
  playerId: number;
  position: Coordinate2D | Coordinate3D | 'RESIGN';
  timestamp: Date;
};

// Define a type for MoveHistoryData that includes the game ID, players, current player, board state, and moves
type MoveHistoryData = {
  gameId: number;
  players: string[];
  currentPlayer: string;
  board: Board2D | Board3D;
  moves: Move[];
};

// Define a type for the DataItem, which represents a single piece of move history data
type DataItem = MoveHistoryData;