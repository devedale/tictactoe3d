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
      if (isNaN(id) || !(await this.gameIdExist(id))) {
        throw new Error('Invalid ID or game does not exist');
      }
      const game = await Game.dao.get(id);
      return game as Game | null;
    } catch (error) {
      console.error(error);
      throw new Error('Repository GameByIdFailed');
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
  async getBoardByGameId(id: number): Promise<Board2D | Board3D | null> {
    try {
      const game = await this.getGameById(id) 
      
      return game.board as number[][] | number[][][] | null;

    } catch (error) {
      console.error(error);
      throw new Error('Board retreival by gameId failed');
    }
  }

  async updateGame(id: number, data: Partial<Game>): Promise<0|1> {
    try {

      const game = await this.getGameById(id) 

      return await Game.dao.update(game,data);
      
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

  async updateMoves(id: number, userId: number , move: Move.position ): Promise<0|1> {
    try {

      const game = await this.getGameById(id) 
      const user = await userRepository.getUserById(userId)
      console.log("UPDATE MOVE")
      const moves = game.moves as Move[] | null;
      moves.push({
        playerId: userId,
        playerEmail: user.email,
        position: move,
        timestamp: new Date().toISOString()
      })
      return await this.updateGame(id, {moves: moves});


    } catch (error) {
      console.error(error); 
      throw new Error('Moves updating failed');
    }
  }



  async changeTurn(gameId: number): Promise<0|1> {
    try {
      const game = await this.getGameById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      if (game.currentPlayer === 1) {
        return await this.updateGame(gameId, { currentPlayer: 2 });
      } else if (game.currentPlayer === 2) {
        return await this.updateGame(gameId, { currentPlayer: 1 });
      } else {
        throw new Error('Invalid current player state');
      }
    } catch (error) {
      console.error('Error in changeTurn:', error);
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

  async resignGame(gameId: number, userId: number): Promise<0|1> {
    
    try {

      const game = await this.getGameById(gameId);

      if (game.userId1 === userId || game.userId2 === userId) {
        await this.updateMoves(gameId,userId,'RESIGN');
        return await this.updateGame(gameId, {winner: game.userId1==userId?2:game.userId2==userId?1:null});
      }

    } catch (error) {
      console.error(error);
      throw new Error('Game resign failed');
    }
  }
  
}

export { GameRepository };
