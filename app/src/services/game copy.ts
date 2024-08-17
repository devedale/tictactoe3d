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
      
      if(user2.email!=='ai'){

        const tokens = parseFloat(user1.tokens);
        if (tokens < 0.5) {
          return res.build('BadRequest', 'User does not have enough tokens');
        }
        await userRepository.updateUser({ id: userId1, tokens: tokens - 0.5 });


      }
      const tokens = parseFloat(user1.tokens);
      if (tokens < 0.5) {
        return res.build('BadRequest', 'User does not have enough tokens');
      }
      await userRepository.updateUser(user1,{ id: userId1, tokens: tokens - 0.5 });


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
      let winner;
      if (game.winner !== null) {
        return res.build('BadRequest', `this game already finished with winner player ${game.winner} (${parseInt(game.winner)===1?'X':parseInt(game.winner)===2?'O':'its a tie'})`);
      }
      const move = game.type === '3d' ? [x, y, z] : [x, y];
      if (game.type !=='3d' && z !== undefined) {
        return res.build('BadRequest', 'this is a classic game, insert just x and y, you need no z');
      }
      const user1 = await userRepository.getUserById(game.userId1);
      const user2 = await userRepository.getUserById(game.userId2);
      const user1Mail = user1.email;
      const user2Mail = user2.email;
      if (req.userEmail!==user1Mail && req.userEmail!==user2Mail) {
        return res.build('Forbidden', 'Cannot move other players game');
      }
      const players = [game.userId1, game.userId2]
      if (parseInt(players[game.currentPlayer-1])!==parseInt(req.userId) ) {
        return res.build('Forbidden', 'This is not your turn');
      }
      const board = game.board;
      const valueInCoord = await boardService.valueInBoardCoordinates(board, move);
      const updatedBoard = await boardService.setMove(board, move, game.currentPlayer === 1 ? 'X' : 'O');

      if (valueInCoord !== null) {
        if (valueInCoord === undefined) {
          return res.build('BadRequest', 'Invalid move, out of bounds');
        } else if (valueInCoord == 'X' || valueInCoord == 'O') {
          return res.build('BadRequest', Invalid move, value in coord: ${valueInCoord});
        }
      } else {


        //MAKE MOVE
        console.log("\n\n\n\nMAKEMOVE GAME",updatedBoard, game, JSON.stringify(game));
        const result = await gameRepository.updateBoard(game.id, updatedBoard);




        //CHECK WINNER
        winner = await gameRepository.checkWin(game.id);
        console.log("\n\n\n\nWINNER ", winner)
        if (winner) {
        
          await gameRepository.updateGame(game.id, { winner });

          if (winner === 'X') {
            await gameRepository.updateGame(game.id, { winner: 1 });
            
          } else if (winner === 'O') {
            await gameRepository.updateGame(game.id, { winner: 2 });
          }

          return res.build('OK', Player ${winner==='X'?1:2} (${winner})  won, { result, board: updatedBoard });
        } else if (winner === null) {
          const availableMove = await boardService.getNullIndices(game.board)
          console.log("\n\n\n\n\n MAKE MOVE CHECK AVAILABLE MOVES: ",availableMove)
          if (!availableMove){

            await gameRepository.updateGame(game.id, { winner: 0 });
            return res.build('OK', 'It\'s a tie', { result, board: updatedBoard });

            
          }
        }
        
        console.log("\n\n\n\n\n\n\n\nCPU     MAKEMOVE    CPU    ______________user2.email",user2.email,user2.email === 'ai')
        if (user2.email === 'ai') {
          const cpuMove =  await boardService.cpuMove(updatedBoard)
          console.log(cpuMove,"cpuMove\n\n\n\n")
          //MAKE MOVE CPU
          const updatedBoardCpu = await boardService.setMove(updatedBoard, cpuMove, 'O');
          const resultCpu = await gameRepository.updateBoard(game.id, updatedBoardCpu);
          //CHECK WINNER CPU
          winner = await gameRepository.checkWin(game.id);
          console.log("\n\n\n\nWINNER CPU", winner)
          if (winner) {
            await gameRepository.updateGame(game.id, { winner });
            if (winner === 'X') {
              await gameRepository.updateGame(game.id, { winner: 1 });
            } else if (winner === 'O') {
              await gameRepository.updateGame(game.id, { winner: 2 });
            }

            return res.build('OK', After your move the computer won the game, { resultCpu, board: updatedBoardCpu });


          } else if (winner === null) {
            const availableMove = await boardService.getNullIndices(game.board)
            console.log("\n\n\n\n\n MAKE MOVE CHECK AVAILABLE MOVES FOR CPU: ",availableMove)
            if (!availableMove){
              await gameRepository.updateGame(game.id, { winner: 0 });  
              return res.build('OK', After your move, the computer made its move, and the game ended in a tie., { resultCpu, board: updatedBoardCpu });

            }

          }

          return res.build('OK', After your move, the computer made its move, { resultCpu, board: updatedBoardCpu });

  
        }  else {
          await gameRepository.changeTurn(game.id);
          return res.build(
            'OK', 
            'Move made successfully, waiting for challenger move', 
            { result, board: updatedBoard }
          );  
        }
      }  

    } catch (err) {
      next(ISError('Error during games retrieval.', err));
    }
  }
  
}
  
export default GameService;
  