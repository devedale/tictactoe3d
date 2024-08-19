class BoardService {

  private CPU_METHOD_NAME = 'cpuHardLogic';

  private SIZE(type: '2d' | '3d'): number {
    return type.toLowerCase() === '3d' ? 4 : 3;
  }

  public async createBoard(type: '2d' | '3d'): Promise<Board2D | Board3D> {
    const size = this.SIZE(type);
    if (type.toLowerCase() === '2d') {
      return Array(size).fill(null).map(() => Array(size).fill(null));
    } else if (type.toLowerCase() === '3d') {
      return Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => Array(size).fill(null))
      );
    } else {
      throw new Error("Invalid board type. Please use '2d' or '3d'.");
    }
  }

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

  public async cpuMove(board: Board2D | Board3D, currentPlayer: 'X' | 'O', methodName: string = this.CPU_METHOD_NAME): Promise<number[]> {
    return this[methodName](board, currentPlayer);
  }

  public async cpuEasyLogic(board: Board2D | Board3D, currentPlayer?: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);
    if (nullIndices.length === 0) {
      throw new Error("No available moves.");
    }
    return nullIndices[0];
  }

  public async cpuRandomLogic(board: Board2D | Board3D, currentPlayer?: 'X' | 'O'): Promise<number[]> {
    const nullIndices = await this.getNullIndices(board);
  
    if (nullIndices.length === 0) {
      throw new Error("No available moves.");
    }
  
    const randomIndex = Math.floor(Math.random() * nullIndices.length);
    return nullIndices[randomIndex];
  }

  public async cpuHardLogic(board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number[]> {
    const mcts = new this.MCTS(this, board, currentPlayer, 1000); 
    return await mcts.run();
  }

  public async cpuDynamicLogic(board: Board2D | Board3D, currentPlayer: 'X' | 'O'): Promise<number[]> {
    const memo: Record<string, number> = {};
    const startTime = Date.now();
  
    const boardToString = (board: Board2D | Board3D): string => JSON.stringify(board);
  
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
  
      // Check for timeout (this alghoritm works fine ONLY for 3x3 and low dimensions so this timeout avoids starvation)
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
  
  public async valueInBoardCoordinates(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): Promise<string | null | undefined> {
    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      if (x >= 0 && x < board3D.length &&
          y >= 0 && y < board3D[x].length &&
          z >= 0 && z < board3D[x][y].length) {
        return board3D[x][y][z];
      } else {
        return undefined; 
      }
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      if (x >= 0 && x < board2D.length &&
          y >= 0 && y < board2D[x].length) {
        return board2D[x][y];
      } else {
        return undefined; 
      }
    }
  }

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

  public async getCurrentAndOpponentPlayers(game): Promise<{ currentPlayerId: string, opponentId: string }> {
    const players = [game.userId1, game.userId2];
    const currentPlayerId = players[game.currentPlayer - 1];
    const opponentId = players.find(p => p !== currentPlayerId);
    return { currentPlayerId, opponentId };
  }

  public async isEmptyCell(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): Promise<boolean> {
    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      return x >= 0 && x < board3D.length &&
             y >= 0 && y < board3D[x].length &&
             z >= 0 && z < board3D[x][y].length &&
             board3D[x][y][z] === null;
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      return x >= 0 && x < board2D.length &&
             y >= 0 && y < board2D[x].length &&
             board2D[x][y] === null;
    }
  }

  public async checkVictory(board: Board2D | Board3D): Promise<string | null> {
    const size = board.length;

    const checkLine = (line: (string | null)[]): string | null => {
      return line.reduce((acc, cell) => (acc === cell ? acc : null));
    };

    const getLines = (board: Board3D): Board2D => {
      let lines: Board2D = [];

      board.forEach((level) => {
        lines = lines.concat(level);
        lines = lines.concat(level[0].map((_, colIndex) => level.map(row => row[colIndex])));
      });

      board.forEach((level) => {
        lines.push(level.map((row, index) => row[index]));
        lines.push(level.map((row, index) => row[size - 1 - index]));
      });


      for (let i = 0; i < size; i++) {
        lines.push(board.map(level => level[i][i]));
        lines.push(board.map(level => level[i][size - 1 - i]));
      }
      lines.push(board.map((level, index) => level[index][index]));
      lines.push(board.map((level, index) => level[index][size - 1 - index]));
      lines.push(board.map((level, index) => level[size - 1 - index][index]));
      lines.push(board.map((level, index) => level[size - 1 - index][size - 1 - index]));

      return lines;
    };

    const getLines2D = (board: Board2D): Board2D => {
      let lines: Board2D = [];


      lines = lines.concat(board);
      lines = lines.concat(board[0].map((_, colIndex) => board.map(row => row[colIndex])));


      lines.push(board.map((row, index) => row[index]));
      lines.push(board.map((row, index) => row[size - 1 - index]));

      return lines;
    };


    const lines = Array.isArray(board[0][0]) ? getLines(board as Board3D) : getLines2D(board as Board2D);


    const winner = lines.map(checkLine).filter(result => result !== null)[0];

    return winner || null;
  }


  private MCTS = class MCTS {
    private boardService: BoardService;
    private board: Board2D | Board3D;
    private player: 'X' | 'O';
    private simulations: number;

    constructor(boardService: BoardService, board: Board2D | Board3D, player: 'X' | 'O', simulations: number) {
      this.boardService = boardService;
      this.board = board;
      this.player = player;
      this.simulations = simulations;
    }

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
        return -1; 
      } else {
        return await this.simulate(newBoard, currentPlayer === 'X' ? 'O' : 'X');
      }
    }

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
  }
}

export default BoardService;
