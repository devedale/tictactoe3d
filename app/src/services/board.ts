class BoardService {
    // Function to determine the size of the board based on the type (2D or 3D)
    private SIZE(type: '2d' | '3d'): number {
      return type.toLowerCase() === '3d' ? 4 : 3;
    }
  
    // Function to create a game board based on the specified type
    public createBoard(type: '2d' | '3d'): Board2D | Board3D {
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
  
    // Function to check if a move is valid based on the current board and coordinates
    public isValidMove(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): boolean {
        console.log("ISVALID?", board, coordinates)
      if (Array.isArray(board[0][0])) {
        const [x, y, z] = coordinates as Coordinate3D;
        const board3D = board as Board3D;
        if (x >= 0 && x < board3D.length &&
            y >= 0 && y < board3D[x].length &&
            z >= 0 && z < board3D[x][y].length) 
            {return board3D[x][y][z]}



      } else {
        const [x, y] = coordinates as Coordinate2D;
        const board2D = board as Board2D;
  

        if (x >= 0 && x < board2D.length &&
            y >= 0 && y < board2D[x].length)
            {return board2D[x][y]}
      }
    }
  
    // Function to set a move on the board if it is valid
    public setMove(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D, player: string): Board2D | Board3D {
      if (this.isValidMove(board, coordinates)!=null) {
        console.log(`\n\n\nInvalid move attempt: ${coordinates} on board: ${JSON.stringify(board)}\n\n\n`);
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
    }
  
    // Function to check if a cell is empty in the board
    public isEmptyCell(board: Board2D | Board3D, coordinates: Coordinate2D | Coordinate3D): boolean {
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
  }
  
  export default BoardService;