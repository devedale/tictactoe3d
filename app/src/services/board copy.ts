class BoardService {
  // Function to determine the size of the board based on the type (2D or 3D)
  private SIZE(type: '2d' | '3d'): number {
    return type.toLowerCase() === '3d' ? 4 : 3;
  }

  // Function to create a game board based on the specified type
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

  public async getAllIndices(arr, currentPath = []) {
    if (!Array.isArray(arr)) {
      return [currentPath];
    } else {
      return arr.flatMap(async (_, index) =>
        await this.getAllIndices(arr[index], [...currentPath, index])
      );
    }
  }
  
  public async getNullIndices(arr, currentPath = []) {
    if (!Array.isArray(arr)) {
      return arr === null ? [currentPath] : [];
    } else {
      return arr.flatMap(async (_, index) =>
        await this.getNullIndices(arr[index], [...currentPath, index])
      );
    }
  }

  public async cpuMove(arr, currentPath = [], methodName = 'cpuEasyLogic') {
    const nullIndices = await this.getNullIndices(arr, currentPath);
    return await this[methodName](nullIndices);
}
  public async cpuEasyLogic(nullIndices) {
    console.log("cpuEasyLogic", nullIndices[0], nullIndices);
    return nullIndices[0];
  }

  // Function to check if a move is valid based on the current board and coordinates
  public async valueInBoardCoordinates(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): Promise<boolean | null> {
    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      if (x >= 0 && x < board3D.length &&
          y >= 0 && y < board3D[x].length &&
          z >= 0 && z < board3D[x][y].length) {
        return board3D[x][y][z];
      } else {
        return null; // Invalid coordinates
      }
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      if (x >= 0 && x < board2D.length &&
          y >= 0 && y < board2D[x].length) {
        return board2D[x][y];
      } else {
        return null; // Invalid coordinates
      }
    }
  }

  // Function to set a move on the board if it is valid
  public async setMove(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D, player: string): Promise<Board2D | Board3D> {
    try{
    const isValidMove = await this.valueInBoardCoordinates(board, coordinates);
    if (isValidMove != null) {
      console.log(\n\n\nInvalid move attempt: ${coordinates} on board: ${JSON.stringify(board)}\n\n\n);
      return board; // Move is invalid
    }

    if (Array.isArray(board[0][0])) {
      const [x, y, z] = coordinates as Coordinate3D;
      const board3D = board as Board3D;
      board3D[x][y][z] = player; // Set the position to the player's identifier
      return board3D;
    } else {
      const [x, y] = coordinates as Coordinate2D;
      const board2D = board as Board2D;
      board2D[x][y] = player; // Set the position to the player's identifier
      return board2D;
    }
    
    } catch(error) {
      console.error("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nError occurred while setting move", error);
    }
  }

  // Function to check if a cell is empty in the board
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

  // Function to check for victory on the board
  public async checkVictory(board: Board2D | Board3D): Promise<string | null> {
    console.log("\n\n\n\nCheckVictory\n\n\n\n");
    const size = board.length;

    const checkLine = (line: (string | null)[]): string | null => {
        return line.reduce((acc, cell) => acc === cell ? acc : null);
    };

    const getLines = (board: Board3D): Board2D => {
        let lines: Board2D = [];
        
        board.forEach((level, levelIndex) => {
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
}

export default BoardService;