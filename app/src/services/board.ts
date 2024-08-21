/** Service class for managing and interacting with game boards. Supports both 2D and 3D boards and provides various CPU strategies for gameplay. */
class BoardService {
  /** The default method name for CPU move strategy. */

  //BOTH LOGIC WORK FINE AND SHOULD NOT LOSE WITH 2d and 3d Games
  //private CPU_METHOD_NAME = 'cpuDynamicLogic';  //this logic try to work dinamically and than stops if pass to much time
  private CPU_METHOD_NAME = 'cpuMCTSLogic'; //this logic is based on MCTS random algorithm

  /**
   * Determines the size of the board based on its type.
   *
   * @param type The type of the board ('2d' or '3d').
   * @returns The size of the board (3 for 2D, 4 for 3D).
   */
  private SIZE(type: '2d' | '3d'): number {
    return type.toLowerCase() === '3d' ? 4 : 3;
  }
  private memo: Map<string, { bestScore: number; bestMove: number[] }> = new Map();

  private boardToString(board: Board2D | Board3D): string {
    return JSON.stringify(board);
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
    const startTime = Date.now();
    const timeout = 5000; // 5 seconds timeout
    const oppositePlayer = currentPlayer === 'X' ? 'O' : 'X';

    // Memoization map for board states
    this.memo = new Map<string, { bestScore: number; bestMove: number[] }>();

    const evaluateMove = async (
      board: Board2D | Board3D,
      currentPlayer: 'X' | 'O',
      alpha: number = -Infinity,
      beta: number = Infinity
    ): Promise<number> => {
      if (Date.now() - startTime > timeout) {
        // Timeout protection
        return currentPlayer === 'O' ? 0 : 0; // Adjust this to a sensible default
      }

      const boardKey = this.boardToString(board);

      if (this.memo.has(boardKey)) {
        return this.memo.get(boardKey).bestScore;
      }

      const winner = await this.checkVictory(board);
      if (winner !== null) {
        return winner === 'O' ? 1 : -1;
      }

      const nullIndices = await this.getNullIndices(board);
      if (nullIndices.length === 0) {
        return 0; // Draw
      }

      let bestScore = currentPlayer === 'O' ? -Infinity : Infinity;

      for (const move of nullIndices) {
        const boardCopy = JSON.parse(JSON.stringify(board));
        const newBoard = await this.setMove(boardCopy, move, currentPlayer);

        const score = await evaluateMove(newBoard, currentPlayer === 'X' ? 'O' : 'X', alpha, beta);

        if (currentPlayer === 'O') {
          bestScore = Math.max(bestScore, score);
          alpha = Math.max(alpha, bestScore);
        } else {
          bestScore = Math.min(bestScore, score);
          beta = Math.min(beta, bestScore);
        }

        if (beta <= alpha) {
          break; // Beta cut-off
        }
      }

      this.memo.set(boardKey, { bestScore, bestMove: nullIndices[0] });
      return bestScore;
    };

    // Check for immediate winning moves for the CPU
    const winningMove = await this.findWinningMove(board, currentPlayer);
    if (winningMove) {
      return winningMove; // Make a winning move
    }

    // Check for immediate blocking moves
    const blockMove = await this.findBlockingMove(board, oppositePlayer);
    if (blockMove) {
      return blockMove; // Block the opponent's winning move
    }

    // Proceed with move evaluation if no immediate actions were taken
    const nullIndices = await this.getNullIndices(board);
    let bestMove = nullIndices[0];
    let bestScore = currentPlayer === 'O' ? -Infinity : Infinity;

    for (const move of nullIndices) {
      const boardCopy = JSON.parse(JSON.stringify(board));
      const newBoard = await this.setMove(boardCopy, move, currentPlayer);

      const score = await evaluateMove(newBoard, currentPlayer === 'X' ? 'O' : 'X');

      if (Date.now() - startTime > timeout) {
        break; // Timeout protection
      }

      if ((currentPlayer === 'O' && score > bestScore) || (currentPlayer === 'X' && score < bestScore)) {
        bestMove = move;
        bestScore = score;
      }
    }

    return bestMove;
  }

  // Helper method to find a blocking move
  private async findBlockingMove(board: Board2D | Board3D, player: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);

    for (const move of nullIndices) {
      const boardCopy = JSON.parse(JSON.stringify(board));
      const newBoard = await this.setMove(boardCopy, move, player);

      if ((await this.checkVictory(newBoard)) === player) {
        return move; // This move blocks the opponent's winning move
      }
    }

    return null;
  }

  // Helper method to find a winning move
  private async findWinningMove(board: Board2D | Board3D, player: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);

    for (const move of nullIndices) {
      const boardCopy = JSON.parse(JSON.stringify(board));
      const newBoard = await this.setMove(boardCopy, move, player);

      if ((await this.checkVictory(newBoard)) === player) {
        return move; // This move wins the game
      }
    }

    return null;
  }

  public async checkOpponentVictory(board: Board2D | Board3D, player: 'X' | 'O'): Promise<boolean> {
    // The opponent is the other player
    const opponent = player === 'X' ? 'O' : 'X';

    // Check if the opponent has won with the current board state
    const winner = await this.checkVictory(board);
    return winner === opponent;
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
    const opponentId = players.filter((p) => p !== currentPlayerId)[0];
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
  /** Monte Carlo Tree Search (MCTS) implementation for game AI. This class performs MCTS to determine the best move for a given player in a board game. */
  private MCTS = class MCTS {
    private boardService: BoardService;
    private board: Board2D | Board3D;
    private player: 'X' | 'O';
    private simulations: number;
    private root: MCTSNode;

    /**
     * Creates an instance of MCTS.
     *
     * @param {BoardService} boardService - Service used for interacting with the game board.
     * @param {Board2D | Board3D} board - The current state of the game board.
     * @param {'X' | 'O'} player - The player for whom the MCTS is being performed.
     * @param {number} simulations - The number of simulations to perform.
     */
    constructor(boardService: BoardService, board: Board2D | Board3D, player: 'X' | 'O', simulations: number) {
      this.boardService = boardService;
      this.board = board;
      this.player = player;
      this.simulations = simulations;
      this.root = {
        board,
        move: [],
        parent: null,
        children: [],
        visits: 0,
        wins: 0,
      };
    }

    /**
     * Simulates a random game from a given node to the end.
     *
     * @param {MCTSNode} node - The node to simulate from.
     * @returns {Promise<number>} - Returns 1 if the player wins, -1 if loses, or 0 if a draw.
     */
    private async simulate(node: MCTSNode): Promise<number> {
      let currentBoard = JSON.parse(JSON.stringify(node.board));
      let currentPlayer = this.player;
      let winner: string | null = null;

      while (winner === null) {
        const nullIndices = await this.boardService.getNullIndices(currentBoard);
        if (nullIndices.length === 0) break; // Draw

        const randomMove = nullIndices[Math.floor(Math.random() * nullIndices.length)];
        currentBoard = await this.boardService.setMove(currentBoard, randomMove, currentPlayer);

        winner = await this.boardService.checkVictory(currentBoard);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }

      if (winner === this.player) return 1;
      if (winner === null) return 0;
      return -1;
    }

    /**
     * Expands the given node by generating all possible moves from that node.
     *
     * @param {MCTSNode} node - The node to expand.
     * @returns {Promise<void>}
     */
    private async expand(node: MCTSNode): Promise<void> {
      const nullIndices = await this.boardService.getNullIndices(node.board);

      for (const move of nullIndices) {
        const newBoard = await this.boardService.setMove(JSON.parse(JSON.stringify(node.board)), move, this.player);
        const childNode: MCTSNode = {
          board: newBoard,
          move,
          parent: node,
          children: [],
          visits: 0,
          wins: 0,
        };
        node.children.push(childNode);
      }
    }

    /**
     * Selects the best child node using the Upper Confidence Bound for Trees (UCT) formula.
     *
     * @param {MCTSNode} node - The node to select the best child from.
     * @returns {Promise<MCTSNode>} - The best child node.
     */
    private async bestChild(node: MCTSNode): Promise<MCTSNode> {
      let bestChild = node.children[0];
      let bestScore = -Infinity;

      for (const child of node.children) {
        const score = child.wins / (child.visits + 1) + Math.sqrt((2 * Math.log(node.visits + 1)) / (child.visits + 1));
        if (score > bestScore) {
          bestScore = score;
          bestChild = child;
        }
      }

      return bestChild;
    }

    /**
     * Runs the MCTS algorithm to determine the best move.
     *
     * @returns {Promise<number[]>} - The best move determined by the MCTS algorithm.
     */
    public async run(): Promise<number[]> {
      // Check if there's an immediate blocking move
      const blockMove = await this.boardService.findBlockingMove(this.board, this.player === 'X' ? 'O' : 'X');
      if (blockMove) {
        return blockMove; // Block the opponent's winning move
      }

      // Main MCTS logic
      for (let i = 0; i < this.simulations; i++) {
        let node = this.root;

        // Selection
        while (node.children.length > 0) {
          node = await this.bestChild(node);
        }

        // Expansion
        await this.expand(node);

        // Simulation
        const result = await this.simulate(node);

        // Backpropagation
        while (node !== null) {
          node.visits++;
          node.wins += result;
          node = node.parent;
        }
      }

      // Choose the best move based on the root node's children
      let bestMove = null;
      let bestWinRatio = -Infinity;
      for (const child of this.root.children) {
        const winRatio = child.wins / child.visits;
        if (winRatio > bestWinRatio) {
          bestWinRatio = winRatio;
          bestMove = child.move;
        }
      }

      return bestMove;
    }
  };
}

export default BoardService;
