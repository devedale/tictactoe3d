import { Game } from '../models/game';
import { UserRepository } from './user';

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
  async updateBoard(id: number, board: Board2D | Board3D): Promise<void> {
    try {
      if (await this.gameIdExist(id)) {
        const game = await Game.dao.get(id);
        console.log("game instanceof Game", game instanceof Game); // Dovrebbe restituire true ora
        console.log("game.constructor.name", game.constructor.name);
        console.log('Updating board:', board);
        
        if (game instanceof Game) { 
          await game.updateBoard(board);
        } else {
          throw new Error("Retrieved object is not a valid game instance");
        }
      }
    } catch (error) {
      console.error(error);
      throw new Error('Game updating failed');
    }
  }
}

export { GameRepository };
