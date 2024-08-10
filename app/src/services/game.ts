import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../database/repository/game';
import { UserRepository } from '../database/repository/user';
import { ISError } from '../errors/ErrorFactory';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const userRepository = new UserRepository();
const gameRepository = new GameRepository();

class GameService {
  async createGame(req: Request, res: Response, next: NextFunction) {
    req.validate(['player2Mail', 'type', 'startingPlayer']);
    const { player2Mail, type, startingPlayerIn } = req.body;

    if ( !type=='classic'|| !type=='3D') {
      return res.build(`BadRequest', 'Game type not specified, choose 'classic' or '3D'`);
    }

    try {
      const user = await userRepository.getUserByEmail(player2Mail)
      let startingPlayer
      if (!user) {
        return res.build('NotFound', 'User mail not found');
      }
      if(startingPlayerIn){
        if(parseInt(startingPlayerIn)!=1 && parseInt(startingPlayerIn)!=2)
        {
          return res.build('BadRequest',`Invalid firstMovePlayer field: ${firstMovePlayer}`)
        } 
        startingPlayer = startingPlayerIn
      } else {
        startingPlayer=1
      }
      const userId1 = req['userId'];
      const userId2 = user.id;
      const board = type=='classic' ? Array(3).fill(null).map(() => Array(3).fill(null)) : Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
      const winner = null;
      const moves = [];
      const newGame = await gameRepository.createGame({
        userId1,
        userId2,
        type,
        board,
        startingPlayer,
        winner,
        moves,
      });
      res.build('Created', 'Game creation complete', newGame);
    } catch (err) {
      next(ISError('Error during  game creation.', err));
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
}

export default GameService;
