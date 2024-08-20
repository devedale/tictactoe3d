import { Game } from '../models/game';
import { UserRepository } from './user';
import BoardService from '../../services/board';

const boardService = new BoardService();

interface ICreateGame {
  userId1: number;
  userId2: number;
  type: 'classic' | '3D';
  currentTurn: number;
}

const userRepository = new UserRepository();

/** Repository class for managing Game-related database operations. */
class GameRepository {
  /**
   * Creates a new game and saves it to the database.
   *
   * @param {ICreateGame} data - The data required to create a new game.
   * @returns {Promise<Partial<Game>>} - The created game instance.
   * @throws {Error} - Throws an error if game creation fails.
   */
  async createGame(data: ICreateGame): Promise<Partial<Game>> {
    try {
      const game = await Game.dao.save(data);
      return game as Game;
    } catch (error) {
      console.error(error);
      throw new Error('Game creation failed');
    }
  }

  /**
   * Retrieves a game by its ID.
   *
   * @param {number} id - The ID of the game to retrieve.
   * @returns {Promise<Game | null>} - The retrieved game instance or null if not found.
   * @throws {Error} - Throws an error if the ID is invalid or the game does not exist.
   */
  async getGameById(id: number): Promise<Game | null> {
    try {
      if (isNaN(id) || !(await this.gameIdExist(id))) {
        throw new Error('Invalid ID or game does not exist');
      }
      const game = await Game.dao.get(id);
      return game as Game | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a game with the given ID exists.
   *
   * @param {number} id - The ID to check.
   * @returns {Promise<boolean>} - True if the game exists, false otherwise.
   */
  async gameIdExist(id: number): Promise<boolean> {
    const count = await Game.count({ where: { id: id } });
    return count > 0;
  }

  /**
   * Retrieves all games from the database.
   *
   * @returns {Promise<Game[] | null>} - An array of games or null if none found.
   * @throws {Error} - Throws an error if retrieving games fails.
   */
  async getGames(): Promise<Game[] | null> {
    try {
      const games = await Game.dao.getAll();
      return games as Game[] | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the board state for a specific game by its ID.
   *
   * @param {number} id - The ID of the game.
   * @returns {Promise<Board2D | Board3D | null>} - The board state or null if not found.
   * @throws {Error} - Throws an error if board retrieval fails.
   */
  async getBoardByGameId(id: number): Promise<Board2D | Board3D | null> {
    try {
      const game = await this.getGameById(id);
      return game.board as number[][] | number[][][] | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a game with new data.
   *
   * @param {number} id - The ID of the game to update.
   * @param {Partial<Game>} data - The new data to update the game with.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, 0 otherwise.
   * @throws {Error} - Throws an error if updating the game fails.
   */
  async updateGame(id: number, data: Partial<Game>): Promise<0 | 1> {
    try {
      const game = await this.getGameById(id);
      return await Game.dao.update(game, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the board state of a game.
   *
   * @param {number} id - The ID of the game to update.
   * @param {Board2D | Board3D} board - The new board state.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, 0 otherwise.
   * @throws {Error} - Throws an error if updating the board fails.
   */
  async updateBoard(id: number, board: Board2D | Board3D): Promise<0 | 1> {
    try {
      console.log('REPOSITORY UPDATE BOARD', id, board);
      return await this.updateGame(id, { board: board });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the moves of a game.
   *
   * @param {number} id - The ID of the game to update.
   * @param {number} userId - The ID of the user making the move.
   * @param {Move.position} move - The move to add to the game.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, 0 otherwise.
   * @throws {Error} - Throws an error if updating the moves fails.
   */
  async updateMoves(id: number, userId: number, move: Move.position): Promise<0 | 1> {
    try {
      const game = await this.getGameById(id);
      const user = await userRepository.getUserById(userId);
      console.log('UPDATE MOVE');
      const moves = game.moves as Move[] | null;
      moves.push({
        playerId: userId,
        playerEmail: user.email,
        position: move,
        timestamp: new Date().toISOString(),
      });
      return await this.updateGame(id, { moves: moves });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Changes the current player's turn in a game.
   *
   * @param {number} gameId - The ID of the game to update.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, 0 otherwise.
   * @throws {Error} - Throws an error if changing the turn fails.
   */
  async changeTurn(gameId: number): Promise<0 | 1> {
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
      throw error;
    }
  }

  /**
   * Checks if there is a winner in the game.
   *
   * @param {number} gameId - The ID of the game to check.
   * @returns {Promise<'X' | 'O' | null>} - The winner ('X' or 'O') or null if no winner.
   * @throws {Error} - Throws an error if checking for a winner fails.
   */
  async checkWin(gameId: number): Promise<'X' | 'O' | null> {
    try {
      if (await this.gameIdExist(gameId)) {
        const game = await Game.dao.get(gameId);
        const winner = await boardService.checkVictory(game.board);
        return winner;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Allows a player to resign from the game.
   *
   * @param {number} gameId - The ID of the game.
   * @param {number} userId - The ID of the user resigning.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, 0 otherwise.
   * @throws {Error} - Throws an error if resigning from the game fails.
   */
  async resignGame(gameId: number, userId: number): Promise<0 | 1> {
    try {
      const game = await this.getGameById(gameId);
      if (game.userId1 === userId || game.userId2 === userId) {
        await this.updateMoves(gameId, userId, 'RESIGN');
        return await this.updateGame(gameId, {
          winner: game.userId1 === userId ? 2 : game.userId2 === userId ? 1 : null,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a user can create a new game.
   *
   * @param {number} userId - The ID of the user.
   * @returns {Promise<{ canCreateNewGame: boolean; userActiveGame: Game | null }>}
   *
   *   - Object indicating whether the user can create a new game and the user's active game if any.
   *
   * @throws {Error} - Throws an error if the check fails.
   */
  async canCreateNewGame(userId: number): Promise<boolean> {
    try {
      const games = await this.getGames();
      const userActiveGames = games.filter((game) => (game.userId1 === userId || game.userId2 === userId) && game.winner == null);
      return { canCreateNewGame: userActiveGames.length == 0, userActiveGame: userActiveGames[0] };
    } catch (error) {
      throw error;
    }
  }
}

export { GameRepository };
