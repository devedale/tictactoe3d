/** Service class for managing and interacting with game boards. Supports both 2D and 3D boards and provides various CPU strategies for gameplay. */
class BoardService {
  /** The default method name for CPU move strategy. */
  private CPU_METHOD_NAME = 'cpuMCTSLogic';

  /**
   * Determines the size of the board based on its type.
   *
   * @param type The type of the board ('2d' or '3d').
   * @returns The size of the board (3 for 2D, 4 for 3D).
   */
  private SIZE(type: '2d' | '3d'): number {
    return type.toLowerCase() === '3d' ? 4 : 3;
  }

  /**
   * Creates a new board based on the specified type.
   *
   * @param type The type of the board ('2d' or '3d').
   * @returns A promise that resolves to the created board (2D or 3D).
   * @throws Error if the board type is invalid.
   */
  public async createBoard(type: '2d' | '3d'): Promise<Board2D | Board3D> {
    const size = this.SIZE(type);
    if (type.toLowerCase() === '2d') {
      return Array(size)
        .fill(null)
        .map(() => Array(size).fill(null));
    } else if (type.toLowerCase() === '3d') {
      return Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => Array(size).fill(null))
        );
    } else {
      throw new Error("Invalid board type. Please use '2d' or '3d'.");
    }
  }

  /**
   * Recursively retrieves all indices of a given array.
   *
   * @param arr The array to search.
   * @param currentPath The current path of indices (used in recursion).
   * @returns A promise that resolves to an array of index paths.
   */
  public async getAllIndices(arr: any[], currentPath: number[] = []): Promise<number[][]> {
    if (!Array.isArray(arr)) {
      return [currentPath];
    } else {
      const results = [];
      for (let index = 0; index < arr.length; index++) {
        const indices = await this.getAllIndices(arr[index], [...currentPath, index]);
        results.push(...indices);
      }
      return results;
    }
  }

  /**
   * Recursively retrieves indices where the value in the array is null.
   *
   * @param arr The array to search.
   * @param currentPath The current path of indices (used in recursion).
   * @returns A promise that resolves to an array of index paths where the value is null.
   */
  public async getNullIndices(arr: any[], currentPath: number[] = []): Promise<number[][]> {
    if (!Array.isArray(arr)) {
      return arr === null ? [currentPath] : [];
    } else {
      const results = [];
      for (let index = 0; index < arr.length; index++) {
        const indices = await this.getNullIndices(arr[index], [...currentPath, index]);
        results.push(...indices);
      }
      return results;
    }
  }

  /**
   * Executes a CPU move based on the specified method name.
   *
   * @param board The current game board.
   * @param currentPlayer The current player ('X' or 'O').
   * @param methodName The method name for the CPU move strategy.
   * @returns A promise that resolves to the chosen move coordinates.
   */
  public async cpuMove(board: Board2D | Board3D, currentPlayer: 'X' | 'O', methodName: string = this.CPU_METHOD_NAME): Promise<number[]> {
    return this[methodName](board, currentPlayer);
  }

  /**
   * CPU strategy for easy logic: selects the first available move.
   *
   * @param board The current game board.
   * @param currentPlayer The current player ('X' or 'O').
   * @returns A promise that resolves to the coordinates of the first available move.
   * @throws Error if there are no available moves.
   */
  public async cpuEasyLogic(board: Board2D | Board3D, currentPlayer?: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);
    if (nullIndices.length === 0) {
      throw new Error('No available moves.');
    }
    return nullIndices[0];
  }

  /**
   * CPU strategy for random logic: selects a random available move.
   *
   * @param board The current game board.
   * @param currentPlayer The current player ('X' or 'O').
   * @returns A promise that resolves to the coordinates of a random available move.
   * @throws Error if there are no available moves.
   */
  public async cpuRandomLogic(board: Board2D | Board3D, currentPlayer?: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);

    if (nullIndices.length === 0) {
      throw new Error('No available moves.');
    }

    const randomIndex = Math.floor(Math.random() * nullIndices.length);
    return nullIndices[randomIndex];
  }

  /**
   * CPU strategy for hard logic: uses Monte Carlo Tree Search (MCTS) to determine the best move.
   *
   * @param board The current game board.
   * @param currentPlayer The current player ('X' or 'O').
   * @returns A promise that resolves to the coordinates of the best move based on MCTS.
   */
  public async cpuMCTSLogic(board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number[]> {
    const mcts = new this.MCTS(this, board, currentPlayer, 1000);
    return await mcts.run();
  }

  /**
   * CPU strategy for dynamic logic: uses dynamic programming to evaluate the best move.
   *
   * @param board The current game board.
   * @param currentPlayer The current player ('X' or 'O').
   * @returns A promise that resolves to the coordinates of the best move based on dynamic programming.
   */
  public async cpuDynamicLogic(board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number[]> {
    const memo: Record<string, number> = {};
    const startTime = Date.now();

    const boardToString = (board: Board2D | Board3D): string => JSON.stringify(board);

    /**
     * Evaluates a move using dynamic programming.
     *
     * @param board The current game board.
     * @param currentPlayer The current player ('X' or 'O').
     * @returns A promise that resolves to the score of the board state after the move.
     */
    const valuateMoveDynamicProgramming = async (board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number> => {
      const boardKey = `${boardToString(board)}-${currentPlayer}`;
      if (memo[boardKey] !== undefined) {
        return memo[boardKey];
      }

      const winner = await this.checkVictory(board);
      if (winner !== null) {
        return winner === 'O' ? 1 : -1;
      }

      const nullIndices = await this.getNullIndices(board);
      if (nullIndices.length === 0) {
        return 0;
      }

      let bestScore = null;

      for (let i = 0; i < nullIndices.length; i++) {
        const coordinates = nullIndices[i];

        const boardCopy = JSON.parse(JSON.stringify(board));

        const newBoard = await this.setMove(boardCopy, coordinates, currentPlayer);

        if (Date.now() - startTime > 5000) {
          return null;
        }

        const score = await valuateMoveDynamicProgramming(newBoard, currentPlayer === 'X' ? 'O' : 'X');

        if (bestScore === null || (currentPlayer === 'O' && score > bestScore) || (currentPlayer === 'X' && score < bestScore)) {
          bestScore = score;
        }
      }

      memo[boardKey] = bestScore;
      return bestScore;
    };

    const nullIndices = await this.getNullIndices(board);
    let bestMove = nullIndices[0];
    let bestScore = null;

    for (let i = 0; i < nullIndices.length; i++) {
      const coordinates = nullIndices[i];

      const boardCopy = JSON.parse(JSON.stringify(board));

      const newBoard = await this.setMove(boardCopy, coordinates, currentPlayer);

      // Check for timeout to avoid starvation
      if (Date.now() - startTime > 5000) {
        const randomIndex = Math.floor(Math.random() * nullIndices.length);
        return nullIndices[randomIndex];
      }

      const score = await valuateMoveDynamicProgramming(newBoard, currentPlayer === 'X' ? 'O' : 'X');

      if (bestScore === null || (currentPlayer === 'O' && score > bestScore) || (currentPlayer === 'X' && score < bestScore)) {
        bestMove = coordinates;
        bestScore = score;
      }
    }

    return bestMove;
  }

  /**
   * Retrieves the value in the board at the specified coordinates.
   *
   * @param board The current game board.
   * @param coordinates The coordinates to check (2D or 3D).
   * @returns A promise that resolves to the value at the specified coordinates, or undefined if out of bounds.
   */
  public async valueInBoardCoordinates(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): Promise<string | null | undefined> {
    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      if (x >= 0 && x < board3D.length && y >= 0 && y < board3D[x].length && z >= 0 && z < board3D[x][y].length) {
        return board3D[x][y][z];
      } else {
        return undefined;
      }
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      if (x >= 0 && x < board2D.length && y >= 0 && y < board2D[x].length) {
        return board2D[x][y];
      } else {
        return undefined;
      }
    }
  }

  /**
   * Sets a move for a player at the specified coordinates on the board.
   *
   * @param board The current game board.
   * @param coordinates The coordinates where the move will be set (2D or 3D).
   * @param player The player making the move ('X' or 'O').
   * @returns A promise that resolves to the updated board.
   */
  public async setMove(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D, player: string): Promise<Board2D | Board3D> {
    const isValidMove = await this.valueInBoardCoordinates(board, coordinates);
    if (isValidMove !== null) {
      return board;
    }

    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      board3D[x][y][z] = player;
      return board3D;
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      board2D[x][y] = player;
      return board2D;
    }
  }

  /**
   * Retrieves the IDs of the current player and the opponent.
   *
   * @param game The game object containing player IDs and the current player index.
   * @returns A promise that resolves to an object containing the current player ID and opponent ID.
   */
  public async getCurrentAndOpponentPlayers(game): Promise<{ currentPlayerId: string; opponentId: string }> {
    const players = [game.userId1, game.userId2];
    const currentPlayerId = players[game.currentPlayer - 1];
    const opponentId = players.find((p) => p !== currentPlayerId);
    return { currentPlayerId, opponentId };
  }

  /**
   * Checks if a cell in the board is empty (i.e., contains null).
   *
   * @param board The current game board.
   * @param coordinates The coordinates to check (2D or 3D).
   * @returns A promise that resolves to a boolean indicating if the cell is empty.
   */
  public async isEmptyCell(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): Promise<boolean> {
    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      return x >= 0 && x < board3D.length && y >= 0 && y < board3D[x].length && z >= 0 && z < board3D[x][y].length && board3D[x][y][z] === null;
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      return x >= 0 && x < board2D.length && y >= 0 && y < board2D[x].length && board2D[x][y] === null;
    }
  }

  /**
   * Checks for a winning condition on the board.
   *
   * @param board The current game board.
   * @returns A promise that resolves to the winner ('X' or 'O') or null if there is no winner yet.
   */
  public async checkVictory(board: Board2D | Board3D): Promise<string | null> {
    const size = board.length;

    /**
     * Checks a single line (row, column, or diagonal) for a winner.
     *
     * @param line The line to check.
     * @returns The winner ('X' or 'O') or null if the line does not have a winner.
     */
    const checkLine = (line: (string | null)[]): string | null => {
      return line.reduce((acc, cell) => (acc === cell ? acc : null));
    };

    /**
     * Retrieves all lines (rows, columns, diagonals) from a 3D board.
     *
     * @param board The 3D board.
     * @returns An array of 2D lines.
     */
    const getLines = (board: Board3D): Board2D => {
      let lines: Board2D = [];

      board.forEach((level) => {
        lines = lines.concat(level);
        lines = lines.concat(level[0].map((_, colIndex) => level.map((row) => row[colIndex])));
      });

      board.forEach((level) => {
        lines.push(level.map((row, index) => row[index]));
        lines.push(level.map((row, index) => row[size - 1 - index]));
      });

      for (let i = 0; i < size; i++) {
        lines.push(board.map((level) => level[i][i]));
        lines.push(board.map((level) => level[i][size - 1 - i]));
      }
      lines.push(board.map((level, index) => level[index][index]));
      lines.push(board.map((level, index) => level[index][size - 1 - index]));
      lines.push(board.map((level, index) => level[size - 1 - index][index]));
      lines.push(board.map((level, index) => level[size - 1 - index][size - 1 - index]));

      return lines;
    };

    /**
     * Retrieves all lines (rows, columns, diagonals) from a 2D board.
     *
     * @param board The 2D board.
     * @returns An array of 2D lines.
     */
    const getLines2D = (board: Board2D): Board2D => {
      let lines: Board2D = [];

      lines = lines.concat(board);
      lines = lines.concat(board[0].map((_, colIndex) => board.map((row) => row[colIndex])));

      lines.push(board.map((row, index) => row[index]));
      lines.push(board.map((row, index) => row[size - 1 - index]));

      return lines;
    };

    const lines = Array.isArray(board[0][0]) ? getLines(board as Board3D) : getLines2D(board as Board2D);

    const winner = lines.map(checkLine).filter((result) => result !== null)[0];

    return winner || null;
  }

  /** Class implementing Monte Carlo Tree Search (MCTS) for move selection. */
  private MCTS = class MCTS {
    private boardService: BoardService;
    private board: Board2D | Board3D;
    private player: 'X' | 'O';
    private simulations: number;

    /**
     * Initializes an MCTS instance.
     *
     * @param boardService The BoardService instance.
     * @param board The current game board.
     * @param player The player using MCTS ('X' or 'O').
     * @param simulations The number of simulations to run.
     */
    constructor(boardService: BoardService, board: Board2D | Board3D, player: 'X' | 'O', simulations: number) {
      this.boardService = boardService;
      this.board = board;
      this.player = player;
      this.simulations = simulations;
    }

    /**
     * Simulates a game from the current board state and returns the result.
     *
     * @param board The board state to simulate from.
     * @param currentPlayer The current player in the simulation ('X' or 'O').
     * @returns A promise that resolves to the result of the simulation (1 for win, -1 for loss, 0 for draw).
     */
    private async simulate(board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number> {
      const nullIndices = await this.boardService.getNullIndices(board);
      if (nullIndices.length === 0) {
        return 0;
      }
      const randomIndex = Math.floor(Math.random() * nullIndices.length);
      const randomMove = nullIndices[randomIndex];
      const newBoard = await this.boardService.setMove(JSON.parse(JSON.stringify(board)), randomMove, currentPlayer);
      const winner = await this.boardService.checkVictory(newBoard);
      if (winner === this.player) {
        return 1;
      } else if (winner) {
        // Check for losing conditions
        return -1;
      } else {
        return await this.simulate(newBoard, currentPlayer === 'X' ? 'O' : 'X');
      }
    }

    /**
     * Runs the MCTS algorithm to select the best move.
     *
     * @returns A promise that resolves to the best move as a coordinate array.
     */
    public async run(): Promise<number[]> {
      const moves = await this.boardService.getNullIndices(this.board);
      const scores: Map<string, number> = new Map();
      const moveCounts: Map<string, number> = new Map();

      for (const move of moves) {
        scores.set(JSON.stringify(move), 0);
        moveCounts.set(JSON.stringify(move), 0);
      }

      for (let i = 0; i < this.simulations; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        const boardCopy = JSON.parse(JSON.stringify(this.board));
        const newBoard = await this.boardService.setMove(boardCopy, move, this.player);
        const result = await this.simulate(newBoard, this.player === 'X' ? 'O' : 'X');
        const moveKey = JSON.stringify(move);
        const currentScore = scores.get(moveKey) || 0;
        const currentCount = moveCounts.get(moveKey) || 0;
        scores.set(moveKey, currentScore + result);
        moveCounts.set(moveKey, currentCount + 1);
      }

      let bestMove: number[] = moves[0];
      let bestScore = -Infinity;
      for (const move of moves) {
        const moveKey = JSON.stringify(move);
        const averageScore = (scores.get(moveKey) || 0) / (moveCounts.get(moveKey) || 1);
        if (averageScore > bestScore) {
          bestScore = averageScore;
          bestMove = move;
        }
      }

      return bestMove;
    }
  };
}

export default BoardService;
