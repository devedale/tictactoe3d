import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../database/repository/game';
import { UserRepository } from '../database/repository/user';
import { ISError } from '../errors/ErrorFactory';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { User } from '../database/models/user';

const userRepository = new UserRepository();
const gameRepository = new GameRepository();

class GameService {
  async createGame(req: Request, res: Response, next: NextFunction) {
    req.validate(['player2Mail', 'type', 'startingPlayer']);
    const { player2Mail, type, startingPlayerIn } = req.body;
    const userId1 = parseInt(req['userId']);
  
    try {
      // Fetch user1 from the repository
      const user1 = await userRepository.getUserById(userId1);
      if (!user1) {
        return res.build('NotFound', 'User not found');
      }
  
      // Validate the game type
      if (type !== 'classic' && type !== '3D') {
        return res.build('BadRequest', 'Game type not specified, choose "classic" or "3D"');
      }
  
      // Fetch user2 from the repository
      const user2 = await userRepository.getUserByEmail(player2Mail);
      if (!user2) {
        return res.build('NotFound', 'User email not found');
      }
  
      // Determine the starting player
      let startingPlayer;
      if (startingPlayerIn) {
        if (parseInt(startingPlayerIn) !== 1 && parseInt(startingPlayerIn) !== 2) {
          return res.build('BadRequest', `Invalid firstMovePlayer field: ${startingPlayerIn}`);
        }
        startingPlayer = parseInt(startingPlayerIn);
      } else {
        startingPlayer = 1; // Default to player 1 if not specified
      }
  
      const userId2 = user2.id;
      const board = type === 'classic' ?
        Array(3).fill(null).map(() => Array(3).fill(null)) :
        Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
      const winner = null;
      const moves = [];
  
      // Check if user1 has enough tokens
      const tokens = parseFloat(user1.tokens); // Parse the tokens to ensure it's a number
      if (tokens >= 0.5) {
        // Create a new game
        const newGame = await gameRepository.createGame({
          userId1,
          userId2,
          type,
          board,
          startingPlayer,
          winner,
          moves,
        });
  
        // Remaining tokens from user1 and update the repository
        const updatedTokens = tokens - 0.5;
        await userRepository.updateUser({ id: userId1, tokens: updatedTokens });
  
        res.build('Created', 'Game creation complete', newGame);
      } else {
        return res.build('BadRequest', 'User does not have enough tokens');
      }
    } catch (err) {
      next(ISError('Error during game creation.', err));
    }
  }

  async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await gameRepository.getGames();
      if (!users) {
        return res.build('NotFound', 'Games not found');
      }

      res.build('OK', 'Games list', users);
    } catch (err) {
      next(ISError('Error during games retreival.'), err);
    }
  }

  async makeMove(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await gameRepository.getGames();
      if (!users) {
        return res.build('NotFound', 'Games not found');
      }

      res.build('OK', 'Games list', users);
    } catch (err) {
      next(ISError('Error during games retreival.'), err);
    }
  }
}

export default GameService;
