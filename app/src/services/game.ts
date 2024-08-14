import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../database/repository/game';
import { UserRepository } from '../database/repository/user';
import { ISError } from '../errors/ErrorFactory';
import BoardService from './board'; 
import { User } from '../database/models/user';

const userRepository = new UserRepository();
const gameRepository = new GameRepository();
const boardService = new BoardService(); 


export class GameService {

  async createGame(req: Request, res: Response, next: NextFunction) {
    req.validateBody(['player2Mail', 'type', 'currentPlayer']);
    const { player2Mail, type, currentPlayer } = req.body;
    const userId1 = parseInt(req['userId']);
  
    try {
      const user1 = await userRepository.getUserById(userId1);
      if (!user1) {
        return res.build('NotFound', 'User not found');
      }
  
      if (type.toLowerCase() !== '2d' && type.toLowerCase() !== '3d') {
        return res.build('BadRequest', 'Game type not specified, choose "classic" or "3d"');
      }
  
      const user2 = await userRepository.getUserByEmail(player2Mail);
      if (!user2) {
        return res.build('NotFound', 'User email not found');
      }
  
      if (parseInt(currentPlayer) !== 1 && parseInt(currentPlayer) !== 2) {
        return res.build('BadRequest', `Invalid currentPlayer field: ${currentPlayer}`);
      }
  
      const tokens = parseFloat(user1.tokens);
      if (tokens < 0.5) {
        return res.build('BadRequest', 'User does not have enough tokens');
      }
  
      const board = boardService.createBoard(type); 
      const newGame = await gameRepository.createGame({
        userId1,
        userId2: user2.id,
        type: type.toLowerCase(),
        board,
        currentPlayer: parseInt(currentPlayer),
        winner: null,
        moves: [],
      });
  
      await userRepository.updateUser({ id: userId1, tokens: tokens - 0.5 });
  
      if (currentPlayer === '2' && user2.email === 'ai') {
        await newGame.makeAIMoveIfNeeded(); 
      }
  
      res.build('Created', 'Game creation complete', newGame);
    } catch (err) {
      console.log(err);
      next(ISError('Error during game creation.', err));
    }
  }
  
  async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await gameRepository.getGames();
      if (!games || games.length === 0) {
        return res.build('NotFound', 'No games found');
      }
  
      res.build('OK', 'Games list', games);
    } catch (err) {
      console.error(err);
      next(ISError('Error during games retrieval.', err));
    }
  }
  
  async getGamesAndBoards(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await gameRepository.getGamesAndBoards();
      if (!games || games.length === 0) {
        return res.build('NotFound', 'No games found');
      }
  
      res.build('OK', 'Games and boards list', games);
    } catch (err) {
      console.error(err);
      next(ISError('Error during games retrieval.', err));
    }
  }
  
  async makeMove(req: Request, res: Response, next: NextFunction) {
    const { x, y, z } = req.query; 
    const gameId = req.params.id;
  
    if (!gameId) {
      return res.build('BadRequest', 'Game ID is required');
    }
  
    try {
      const game = await gameRepository.getGameById(gameId);
      if (!game) {
        return res.build('NotFound', 'Game not found');
      }

      const move = game.type === '3d' ? [x, y, z] : [x, y];
      const board = game.board; 
      console.log("game", JSON.stringify(game));
      console.log("board", JSON.stringify(board));

      if (boardService.isValidMove(board, move) !== null) {
        return res.build('BadRequest', 'Invalid move');
      }
  
      const updatedBoard = boardService.setMove(board, move, game.currentPlayer === 1 ? 'X' : 'O');
      console.log("MAKEMOVE GAME", game, JSON.stringify(game));
      await gameRepository.updateBoard(game.id,updatedBoard);  
  
      res.build('OK', 'Move made successfully', { board: updatedBoard });
    } catch (err) {
      console.log(err);
      next(ISError('Error during move execution.', err));
    }
  }
}
  
  export default GameService;
  