/**
 * Define a type for a 2D board, where each cell can be null, 'X', or 'O'.
 * @typedef {(null | 'X' | 'O')[][]} Board2D
 */
type Board2D = (null | 'X' | 'O')[][];

/**
 * Define a type for a 3D board, where each cell can be null, 'X', or 'O'.
 * @typedef {(null | 'X' | 'O')[][][]} Board3D
 */
type Board3D = (null | 'X' | 'O')[][][];

/**
 * Define a type for 2D coordinates, which are tuples of two numbers.
 * @typedef {[number, number]} Coordinate2D
 */
type Coordinate2D = [number, number];

/**
 * Define a type for 3D coordinates, which are tuples of three numbers.
 * @typedef {[number, number, number]} Coordinate3D
 */
type Coordinate3D = [number, number, number];

/**
 * Define a recursive type for an N-dimensional array, which can be a number or an array of numbers.
 * @typedef {number | NDimensionalArray[]} NDimensionalArray
 */
type NDimensionalArray = number | NDimensionalArray[];

/**
 * Define a type for a move, which includes a playerId, a position (which can be 2D, 3D, or 'RESIGN'), and a timestamp.
 * @typedef {Object} Move
 * @property {number} playerId - The ID of the player making the move.
 * @property {Coordinate2D | Coordinate3D | 'RESIGN'} position - The position of the move, which can be 2D coordinates, 3D coordinates, or 'RESIGN'.
 * @property {Date} timestamp - The date and time when the move was made.
 */
type Move = {
  playerId: number;
  position: Coordinate2D | Coordinate3D | 'RESIGN';
  timestamp: Date;
};

/**
 * Define a type for MoveHistoryData that includes the game ID, players, current player, board state, and moves.
 * @typedef {Object} MoveHistoryData
 * @property {number} gameId - The unique ID of the game.
 * @property {string[]} players - The list of player names.
 * @property {string} currentPlayer - The name of the current player.
 * @property {Board2D | Board3D} board - The current state of the board, which can be 2D or 3D.
 * @property {Move[]} moves - The list of moves made so far in the game.
 */
type MoveHistoryData = {
  gameId: number;
  players: string[];
  currentPlayer: string;
  board: Board2D | Board3D;
  moves: Move[];
};

/**
 * Define a type for the DataItem, which represents a single piece of move history data.
 * if you need to add more DataItem types define the new types and just add types like this:
 * EXAMPLE: 
 * type DataItem = MoveHistoryData|NewTypeJustDefined1|NewTypeJustDefined2;
 * @typedef {MoveHistoryData} DataItem
 */
type DataItem = MoveHistoryData;
