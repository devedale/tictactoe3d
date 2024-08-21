import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../database/repository/game';
import { UserRepository } from '../database/repository/user';
import { RoleRepository } from '../database/repository/role';
import BoardService from './board';
import ExportService from './export';
import { ErrorFactory } from '../errors/ErrorFactory';
const ISError = ErrorFactory.ISError;

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const gameRepository = new GameRepository();
const boardService = new BoardService();

/**
 * Parses a date string into a Date object.
 *
 * @param {string} dateStr - The date string to parse.
 * @returns {Date | null} - Returns a Date object if valid, otherwise null.
 */
function parseDate(dateStr: string): Date | null {
  if (dateStr.length < 10 || isNaN(Date.parse(dateStr))) {
    return null;
  }
  return new Date(Date.parse(dateStr));
}

/** Service class to handle game-related operations. */
export class GameService {
  /**
   * Creates a new game between two players.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async createGame(req: Request, res: Response, next: NextFunction) {
    req.validateBody(['player2Mail', 'type', 'currentPlayer']);
    const { player2Mail, type, currentPlayer } = req.body;
    const userId1 = parseInt(req['userId']);

    try {
      // Validate game type
      if (type.toLowerCase() !== '2d' && type.toLowerCase() !== '3d') {
        return res.build('BadRequest', 'Game type not specified, choose "classic" or "3d"');
      }

      // Validate user ID
      if (isNaN(userId1)) {
        return res.build('BadRequest', 'User ID is required and must be a valid number');
      }
      if (!(await userRepository.userIdExist(userId1))) {
        return res.build('NotFound', 'User not found');
      }
      const user1 = await userRepository.getUserById(userId1);

      // Check if user can create a new game
      const { canCreateNewGame, userActiveGame } = await gameRepository.canCreateNewGame(user1.id);
      if (!canCreateNewGame) {
        return res.build('BadRequest', `You must finish your active game first, active game id: ${userActiveGame.id}`);
      }

      // Validate second player
      const user2 = await userRepository.getUserByEmail(player2Mail);
      if (!user2) {
        return res.build('NotFound', 'User email not found');
      }

      // Validate current player
      if (parseInt(currentPlayer) !== 1 && parseInt(currentPlayer) !== 2) {
        return res.build('BadRequest', `Invalid currentPlayer field: ${currentPlayer}`);
      }

      // Deduct tokens if not playing against AI
      const tokens = parseFloat(user1.tokens);
      if (tokens < 0.5) {
        return res.build('BadRequest', 'User does not have enough tokens');
      }
      if (user2.email !== 'ai') {
        await userRepository.updateUser(user1, { tokens: tokens - 0.5 });
      }
      await userRepository.updateUser(user1, { tokens: tokens - 0.5 });

      // Create board and game
      const board = await boardService.createBoard(type);
      const newGame = await gameRepository.createGame({
        userId1,
        userId2: user2.id,
        type: type.toLowerCase(),
        board,
        currentPlayer: parseInt(currentPlayer),
        winner: null,
        moves: [],
      });

      // Handle AI move if applicable
      if (player2Mail.toLowerCase() === 'ai' && parseInt(currentPlayer) === 2) {
        const cpuMove = await boardService.cpuMove(board, 'O');
        const updatedBoard = await boardService.setMove(board, cpuMove, 'O'); // AI always uses 'O'
        await gameRepository.updateBoard(newGame.id, updatedBoard);
        await gameRepository.updateMoves(newGame.id, user2.id, cpuMove);
        await gameRepository.changeTurn(newGame.id);
        const newGameWithAiMove = await gameRepository.getGameById(newGame.id);
        res.build('Created', 'Game creation complete and AI played the first move', newGameWithAiMove);
      } else {
        res.build('Created', 'Game creation complete', newGame);
      }
    } catch (err) {
      next(ISError('Error during game creation.', err));
    }
  }

  /**
   * Retrieves the list of games.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await gameRepository.getGames();
      if (!games || games.length === 0) {
        return res.build('NotFound', 'No games found');
      }
      

      //debug purpose route
      const authUserId = parseInt(req['userId']);
      const role = await userRepository.getUserRoleNameById(authUserId);
      if (role !== 'Admin') {
        return res.build('Forbidden', 'Normal users cannot check games');
      }

      res.build('OK', 'Games list', games);
    } catch (err) {
      console.error(err);
      next(ISError('Error during games retrieval.', err));
    }
  }

  /**
   * Makes a move in the specified game.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async makeMove(req: Request, res: Response, next: NextFunction) {
    req.validateQuery(['x', 'y', 'z']);
    const { x, y, z } = req.query;
    const gameId = parseInt(req.params.id);

    try {
      // Validate game ID
      if (isNaN(gameId)) {
        return res.build('BadRequest', 'Game ID is required and must be a valid number');
      }
      if (!(await gameRepository.gameIdExist(gameId))) {
        return res.build('NotFound', 'Game not found');
      }
      const game = await gameRepository.getGameById(gameId);

      // Check if the game is already finished
      if (game.winner !== null) {
        return res.build(
          'BadRequest',
          `This game already finished with winner player ${game.winner} (${parseInt(game.winner) === 1 ? 'X' : parseInt(game.winner) === 2 ? 'O' : 'its a tie'})`
        );
      }

      const board = game.board;
      const user1 = await userRepository.getUserById(game.userId1);
      const user2 = await userRepository.getUserById(game.userId2);
      const user1Mail = user1.email;
      const user2Mail = user2.email;

      // Check if the user is authorized to make the move
      if (req.userEmail !== user1Mail && req.userEmail !== user2Mail) {
        return res.build('Forbidden', 'Cannot move in other players game');
      }
      const players = [game.userId1, game.userId2];
      if (parseInt(players[game.currentPlayer - 1]) !== parseInt(req.userId)) {
        return res.build('Forbidden', 'This is not your turn');
      }

      // Validate and make the move
      const currentPlayerMarker = game.currentPlayer === 1 ? 'X' : 'O';
      const opponentMarker = currentPlayerMarker === 'X' ? 'O' : 'X';
      const move = game.type === '2d' ? [parseInt(x), parseInt(y)] : [parseInt(x), parseInt(y), parseInt(z)];
      if (game.type !== '3d' && z !== undefined) {
        return res.build('BadRequest', 'This is a classic game, insert just x and y, you need no z');
      }
      const isCellEmpty = await boardService.isEmptyCell(board, move);
      if (!isCellEmpty) {
        const valueInCoord = await boardService.valueInBoardCoordinates(board, move);
        if (valueInCoord === undefined) {
          return res.build('BadRequest', 'Invalid move, out of bounds');
        } else if (valueInCoord === 'X' || valueInCoord === 'O') {
          return res.build('BadRequest', `This cell is not empty, cell value: ${valueInCoord}`);
        }
      }
      const { currentPlayerId, opponentId } = await boardService.getCurrentAndOpponentPlayers(game);

      // Set the player's move on the board
      const updatedBoard = await boardService.setMove(board, move, currentPlayerMarker);
      const result = await gameRepository.updateBoard(game.id, updatedBoard, currentPlayerId);
      await gameRepository.updateMoves(game.id, currentPlayerId, move);

      // Check for a winner
      let winner = await boardService.checkVictory(updatedBoard);
      if (winner) {
        await gameRepository.updateGame(game.id, { winner: game.currentPlayer });
        return res.build('OK', `${winner} has won!`, { result, board: updatedBoard });
      }

      const availableMove = await boardService.getNullIndices(updatedBoard);
      if (availableMove.length === 0) {
        await gameRepository.updateGame(game.id, { winner: 0 });
        return res.build('OK', 'After your move the game ended in a tie.', { result, board: updatedBoard });
      }

      await gameRepository.changeTurn(game.id);

      // If the opponent is AI, make the AI move
      if (user2.email === 'ai') {
        const cpuMove = await boardService.cpuMove(updatedBoard, 'O');
        const updatedBoardCpu = await boardService.setMove(updatedBoard, cpuMove, opponentMarker);
        await gameRepository.updateMoves(game.id, game.userId2, cpuMove);
        const resultCpu = await gameRepository.updateBoard(game.id, updatedBoardCpu, game.userId2);

        // Check for a winner after the CPU's move
        winner = await boardService.checkVictory(updatedBoardCpu);
        if (winner) {
          await gameRepository.updateGame(game.id, { winner: 2 });
          return res.build('OK', `CPU (${winner}) has won!`, { result: resultCpu, board: updatedBoardCpu });
        }
        const availableMoveCpu = await boardService.getNullIndices(updatedBoardCpu);
        if (availableMoveCpu.length === 0) {
          await gameRepository.updateGame(game.id, { winner: 0 });
          return res.build('OK', 'After your move, the computer made its move, and the game ended in a tie.', {
            result: resultCpu,
            board: updatedBoardCpu,
          });
        }
        // Update the game state and switch the turn to the player
        await gameRepository.changeTurn(game.id);
        return res.build('OK', 'After your move, the computer made its move', { result: resultCpu, board: updatedBoardCpu });
      } else {
        // Switch the turn to the other player
        await gameRepository.changeTurn(game.id);
        return res.build('OK', 'Move made successfully, waiting for challenger move', { result, board: updatedBoard });
      }
    } catch (err) {
      console.log(err);
      next(ISError('Error during game processing.', err));
    }
  }

  /**
   * Allows a player to resign from a game.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async resignGame(req: Request, res: Response, next: NextFunction) {
    try {
      const gameId = parseInt(req.params.id);

      // Validate game ID
      if (isNaN(gameId)) {
        return res.build('BadRequest', 'Game ID is required and must be a valid number');
      }
      if (!(await gameRepository.gameIdExist(gameId))) {
        return res.build('NotFound', 'Game not found');
      }
      const game = await gameRepository.getGameById(gameId);

      // Check if user is authorized to resign
      const user1 = await userRepository.getUserById(game.userId1);
      const user2 = await userRepository.getUserById(game.userId2);
      if (req.userEmail !== user1.email && req.userEmail !== user2.email) {
        return res.build('Forbidden', 'Cannot resign other players game');
      }

      // Check if game is already finished
      if (game.winner !== null) {
        return res.build('BadRequest', 'This game already finished');
      }

      // Resign from game
      await gameRepository.resignGame(parseInt(game.id), parseInt(req.userId));
      return res.build('OK', `${req.userEmail} has resigned`, { gameId });
    } catch (err) {
      next(ISError('Error during game resign.', err));
    }
  }

  /**
   * Retrieves the status of a specific game.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async gameStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const gameId = parseInt(req.params.id);

      // Validate game ID
      if (isNaN(gameId)) {
        return res.build('BadRequest', 'Game ID is required and must be a valid number');
      }
      if (!(await gameRepository.gameIdExist(gameId))) {
        return res.build('NotFound', 'Game not found');
      }
      const game = await gameRepository.getGameById(gameId);

      // Retrieve player information
      const user1 = await userRepository.getUserById(game.userId1);
      const user2 = await userRepository.getUserById(game.userId2);
      const players = [user1.email, user2.email];
      const currentPlayerId = players[game.currentPlayer - 1];

      // Build and return game status
      const gameStatus = {
        gameId,
        players,
        currentPlayer: game.winner == null ? currentPlayerId : 'GAME OVER',
        winner: game.winner == 0 ? 'TIE' : players[game.winner - 1],
        board: game.board,
        moves: game.moves,
      };
      return res.build('OK', 'Game status', gameStatus);
    } catch (err) {
      next(ISError('Error during game status retrieval.', err));
    }
  }

  /**
   * Retrieves the move history for a specific game.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async gameMoveHistory(req: Request, res: Response, next: NextFunction) {
    const gameId = parseInt(req.params.id);
    req.validateQuery(['format', 'startDate', 'endDate']);
    const { format, startDate, endDate } = req.query;

    try {
      // Validate format
      if (!['json', 'pdf', undefined].includes(format)) {
        return res.build('BadRequest', 'Invalid format');
      }

      // Validate game ID
      if (isNaN(gameId)) {
        return res.build('BadRequest', 'Game ID is required and must be a valid number');
      }
      if (!(await gameRepository.gameIdExist(gameId))) {
        return res.build('NotFound', 'Game not found');
      }
      const game = await gameRepository.getGameById(gameId);

      // Filter moves by date range
      if (startDate || endDate) {
        const start = startDate ? parseDate(startDate as string) : undefined;
        const end = endDate ? parseDate(endDate as string) : undefined;
        if ((startDate && !start) || (endDate && !end)) {
          return res.build(
            'BadRequest',
            'Invalid date format. Example of a valid value: "2023-07-21T15:00:00Z", "2023-07-21", "2023-21-07", "2023/07/21", "21-07-2023"'
          );
        }
        const gameMoves = game.moves;
        const gameFilteredMoves = gameMoves.filter((e) => {
          const moveDate = new Date(e.timestamp);
          return (!start || moveDate >= start) && (!end || moveDate <= end);
        });

        // Export moves history if format is specified
        if (format !== undefined) {
          const methodName = `generate${format.charAt(0).toUpperCase() + format.slice(1)}`;
          const exportService = new ExportService(gameFilteredMoves).movesHistoryExportService;
          if (typeof exportService[methodName] === 'function') {
            const fileBuffer = await exportService[methodName]();
            return res.sendFile(fileBuffer, format);
          } else {
            return res.build('BadRequest', 'Invalid format');
          }
        }
        return res.build('OK', 'Moves list', gameFilteredMoves);
      }

      // Export entire moves history if format is specified
      if (format !== undefined) {
        const methodName = `generate${format.charAt(0).toUpperCase() + format.slice(1)}`;
        const exportService = new ExportService(game.moves).movesHistoryExportService;
        if (typeof exportService[methodName] === 'function') {
          const fileBuffer = await exportService[methodName]();
          return res.sendFile(fileBuffer, format);
        } else {
          return res.build('BadRequest', 'Invalid format');
        }
      }

      return res.build('OK', 'Moves list', game.moves);
    } catch (err) {
      next(ISError('Error during gameMoveHistory retrieval.', err));
    }
  }

  /**
   * Retrieves the rank list of users based on their game performance.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async rankList(req: Request, res: Response, next: NextFunction) {
    try {
      // Retrieve users and games
      const users = await userRepository.getUsers();
      const games = await gameRepository.getGames();

      // Calculate rank list
      const rankList = users.map((user) => {
        const userGames = games.filter((game) => (game.userId1 === user.id || game.userId2 === user.id) && game.winner != null);
        const wins = userGames.filter((game) => game.winner === user.id).length;
        const winsForResign = userGames.filter(
          (game) => game.moves.filter((move) => move.playerId != user.id && move.position === 'RESIGN') != 0
        ).length;
        const losses = userGames.filter((game) => game.winner !== null && game.winner !== user.id).length;
        const lossesForResign = userGames.filter(
          (game) => game.moves.filter((move) => move.playerId === user.id && move.position === 'RESIGN') != 0
        ).length;

        return {
          userId: user.id,
          email: user.email,
          wins,
          winsForResign,
          losses,
          lossesForResign,
          totalGames: userGames.length,
          winPercentage: (wins / (wins + losses)) * 100,
        };
      });
      return res.build('OK', 'RankList:', rankList);
    } catch (err) {
      next(ISError('Error during rankList retrieval.', err));
    }
  }
}

export default GameService;
