
// Observer interface defining the contract for any class that wants to observe changes in the board state.
interface Observer {
    update(board: (string | null)[][][] | (string | null)[][]): void;
}

class VictoryConditionObserver implements Observer {
    update(board: (string | null)[][][] | (string | null)[][]): void {
        if (this.checkVictory(board)) {
            console.log('Victory condition met!');
            // Logica per gestire la vittoria, ad esempio aggiornare lo stato della partita
        }
    }

    private checkVictory(board: (string | null)[][][] | (string | null)[][]): boolean {
        // Implementa la logica per verificare se c'è una vittoria
        // Restituisce true se la vittoria è stata raggiunta
        return false;
    }
}

// Observable class to manage a list of observers and notify them of changes.
class Observable {
    private observers: Observer[] = []; // Array to hold all registered observers.

    // Method to add an observer to the list.
    public addObserver(observer: Observer): void {
        console.log('Adding observer:', observer);
        this.observers.push(observer);
    }

    // Method to remove an observer from the list.
    public removeObserver(observer: Observer): void {
        console.log('Removing observer:', observer);
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    // Method to notify all registered observers of a change in the board.
    protected notifyObservers(board: (string | null)[][][] | (string | null)[][]): void {
        console.log('Notifying observers...');
        for (const observer of this.observers) {
            observer.update(board);
        }
    }
}

// Importing necessary modules from Sequelize and local files.
import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';

// Game class that extends Sequelize's Model and incorporates Observable pattern for board updates.
class Game extends Model {
    public id!: number; // Unique identifier for each game.
    public userId1!: number; // ID of the first player.
    public userId2!: number | null; // ID of the second player, if applicable.
    public type!: '2d' | '3d'; // Type of the game, either 2D or 3D.
    private _board!: Board2D | Board3D; // Internal board representation.
    public currentTurn!: number; // Indicator of which player's turn it is.
    public winner!: number | null; // ID of the winning player, if the game is over.
    public moves!: {
      playerId: number;
      position: Coordinate2D | Coordinate3D;
      timestamp: Date;
    }[]; // Array of moves made during the game.

    public dao!: Dao<Game>; // Data Access Object for managing database operations.

    private observable: Observable = new Observable(); // Observable instance for managing observers.

    constructor(values){
        super(values);
        this.observable.addObserver(new VictoryConditionObserver());
    }
    // Static method to initialize the Game model with its attributes and options.
    static initialize(): void {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId1: {
                type: DataTypes.INTEGER,
                references: {
                  model: 'users',
                  key: 'id',
                },
                allowNull: false,
            },
            userId2: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                  },
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('2d', '3d'),
                allowNull: false,
            },
            board: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            currentPlayer: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            winner: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            moves: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            }
        },
        {
            sequelize,
            modelName: 'game',
            timestamps: true,
        });

        this.dao = new Dao<Game>(this); // Initialize the Data Access Object for this model.
    }

    // Static method to set up associations with other models.
    static associate() {
        this.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
        this.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });
    }

    // Getter for the board property.
    get board(): Board2D | Board3D {
        return this._board;
    }

    // Setter for the board property. It updates the internal board state and notifies observers of the change.
    set board(newBoard: Board2D | Board3D) {
        this._board = newBoard;
        this.observable.notifyObservers(this._board); // Notify all observers that the board has changed.
    }

    // Method to add an observer to the game.
    public addObserver(observer: Observer): void {
        this.observable.addObserver(observer);
    }

    // Method to remove an observer from the game.
    public removeObserver(observer: Observer): void {
        this.observable.removeObserver(observer);
    }
}

Game.initialize(); // Initialize the Game model.
Game.associate(); // Set up associations between models.

export { Game };