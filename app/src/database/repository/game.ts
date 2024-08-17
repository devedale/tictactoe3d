import { Game } from '../models/game';
import { UserRepository } from './user';
import BoardService from '../../services/board'

const boardService = new BoardService();



interface ICreateGame {
  userId1!: number;
  userId2!: number;
  type!: 'classic' | '3D';
  currentTurn!: number;
}

const userRepository = new UserRepository();

class GameRepository {
  async createGame(data: ICreateGame): Promise<Partial<Game>> {
    try {
      const game = await Game.dao.save(data);
      return game as Game;
    } catch (error) {
      console.error(error);
      throw new Error('Game creation failed');
    }
  }

  async getGameById(id: number): Promise<Game | null> {
    try {
      if (await this.gameIdExist(id)) {
        const game = await Game.dao.get(id);
        return game as Game | null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Recupero utente per ID fallito');
    }
  }
  async gameIdExist(id: number): Promise<boolean> {

    const count = await Game.count({ where: { id: id } });
    return count > 0;
  }

  async getGames(): Promise<Game[] | null> {
    try {
      const games = await Game.dao.getAll();
      return games as Game[] | null;
    } catch (error) {
      console.error(error);
      throw new Error('Recupero utenti fallito');
    }
  }
  async getBoardByGameId(id: number): Promise<number[][] | number[][][] | null> {
    try {
      if (await this.gameIdExist(id)) {
        const game = await Game.dao.get(id);
        return game.board as number[][] | number[][][] | null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Board retreival by gameId failed');
    }
  }

  async updateGame(id: number, data: Partial<Game>): Promise<0|1> {
    try {
      if (await this.gameIdExist(id)) {
        const game = await Game.dao.get(id);

        console.log('Updating Game:', JSON.stringify(game), JSON.stringify(data));
        
        return await Game.dao.update(game,data);
      }
    } catch (error) {
      console.error(error);
      throw new Error('Game updating failed');
    }
  }

  async updateBoard(id: number, board: Board2D | Board3D): Promise<0|1> {
    try {
        console.log("REPOSITORY  UPDATE BOARD", id, board);
        return await this.updateGame(id, {board: board});

      
    } catch (error) {
      console.error(error);
      throw new Error('Board updating failed');
    }
  }

  async updateMoves(id: number, move: Coordinate2D | Coordinate3D, userId: number): Promise<void> {
    try {


      if (await this.gameIdExist(id)) {
        const game = await Game.dao.get(id);
        const moves = game.moves as Move[] | null;
        moves.push({
          playerId: userId,
          position: move,
          timestamp: new Date().toISOString()
        })
      }



        console.log("REPOSITORY  UPDATE BOARD", id, board);
        await this.updateGame(id, {board: board});

      
    } catch (error) {
      console.error(error);
      throw new Error('Board updating failed');
    }
  }



  async changeTurn(gameId: number): Promise<void> {
    try {
      if (await this.gameIdExist(gameId)) {
        const game = await Game.dao.get(gameId);

        if (game.currentPlayer === 1) {
          await Game.dao.update(game, { currentPlayer: 2 });
        } else if (game.currentPlayer === 2) {
          await Game.dao.update(game, { currentPlayer: 1 });
        }
        
      } 

    } catch (error) {
      console.error(error);
      throw new Error('Turn Changing failed');
    }
  }

  async checkWin(gameId: number): Promise< 'X' | 'O' | null > {
    
    try {
      if (await this.gameIdExist(gameId)) {
        const game = await Game.dao.get(gameId);


        const winner = await boardService.checkVictory(game.board)

        return winner



      }
    } catch (error) {
      console.error(error);
      throw new Error('Game checkWin failed');
    }
  }
  
}

export { GameRepository };
