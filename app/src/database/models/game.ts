import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';


// Observer interface defining the contract for any class that wants to observe changes in the board state.
interface Observer {
    update(board: (string | null)[][][] | (string | null)[][]): void;
}

class VictoryConditionObserver implements Observer {
    update(board: (string | null)[][][] | (string | null)[][]): void {
        console.log("update OBSERVER VictoryConditionObserver")
        if (this.checkVictory(board)) {
            console.log('\n\n\n\n\n\n\n\nVictory condition met!');

        }
    }

    private checkVictory(board: (string | null)[][][] | (string | null)[][]): string | null {
        console.log("\n\n\n\nCheckVictory\n\n\n\n");
        const size = board.length;
        console.log(`Board size: ${size}`);
      
        const checkLine = (line: (string | null)[]): string | null => {
            console.log(`Checking line: ${JSON.stringify(line)}`);
            const result = line.reduce((acc, cell) => acc === cell ? acc : null);
            console.log(`Result for line ${JSON.stringify(line)}: ${result}`);
            return result;
        };
      
        const getLines = (board: (string | null)[][][]): (string | null)[][] => {
            let lines: (string | null)[][] = [];
            console.log("Extracting lines from 3D board");
      
            board.forEach((level, levelIndex) => {
                console.log(`Processing level ${levelIndex}`);
                lines = lines.concat(level);
                lines = lines.concat(level[0].map((_, colIndex) => level.map(row => row[colIndex])));
            });
      
            board.forEach((level, levelIndex) => {
                console.log(`Processing diagonals in level ${levelIndex}`);
                lines.push(level.map((row, index) => row[index]));
                lines.push(level.map((row, index) => row[size - 1 - index]));
            });
      
            for (let i = 0; i < size; i++) {
                console.log(`Processing 3D column and diagonal ${i}`);
                lines.push(board.map(level => level[i][i]));
                lines.push(board.map(level => level[i][size - 1 - i]));
            }
            lines.push(board.map((level, index) => level[index][index]));
            lines.push(board.map((level, index) => level[index][size - 1 - index]));
            lines.push(board.map((level, index) => level[size - 1 - index][index]));
            lines.push(board.map((level, index) => level[size - 1 - index][size - 1 - index]));
      
            console.log(`Total lines extracted from 3D board: ${lines.length}`);
            return lines;
        };
      
        const getLines2D = (board: (string | null)[][]): (string | null)[][] => {
            let lines: (string | null)[][] = [];
            console.log("Extracting lines from 2D board");
      
            // Righe
            lines = lines.concat(board);
            console.log(`Rows extracted: ${lines.length}`);
      
            // Colonne
            lines = lines.concat(board[0].map((_, colIndex) => board.map(row => row[colIndex])));
            console.log(`Columns extracted: ${lines.length}`);
      
            // Diagonali
            lines.push(board.map((row, index) => row[index]));
            lines.push(board.map((row, index) => row[size - 1 - index]));
            console.log(`Diagonals extracted: ${lines.length}`);
      
            return lines;
        };
      
        console.log("Determining board type (2D or 3D)...");
        const lines = Array.isArray(board[0][0]) ? getLines(board as (string | null)[][][]) : getLines2D(board as (string | null)[][]);
        console.log(`Total lines to check: ${lines.length}`);
      
        const winner = lines.map(checkLine).filter(result => result !== null)[0];
        console.log(`Winner determined: ${winner}`);
      
        return winner || null;
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



// Game class that extends Sequelize's Model and incorporates Observable pattern for board updates.
class Game extends Model {
    public id!: number; // Unique identifier for each game.
    public userId1!: number; // ID of the first player.
    public userId2!: number | null; // ID of the second player, if applicable.
    public type!: '2d' | '3d'; // Type of the game, either 2D or 3D.
    private _board!: Board2D | Board3D; // Internal board representation.
    public currentPlayer!: number; // Indicator of which player's turn it is.
    public winner!: number | null; // ID of the winning player, if the game is over.
    public moves!: {
      playerId: number;
      position: Coordinate2D | Coordinate3D;
      timestamp: Date;
    }[]; // Array of moves made during the game.

    public dao!: Dao<Game>; // Data Access Object for managing database operations.

    private observable: Observable = new Observable(); // Observable instance for managing observers.

    constructor(values) {
        super(values);
        this.dao = new Dao<Game>(this);
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
    public async updateBoard(newBoard: Board2D | Board3D) {
        console.log("Updating board METHOD INSIDE GAME MODEL...\n\n");
        this._board = newBoard;  
        const updateData = {
            board: newBoard,
            currentPlayer: this.currentPlayer === 1 ? 2 : 1,
            userId1: this.userId1,
            userId2: this.userId2,
            type: this.type
        };
    
        try {
            await this.dao.update(this, updateData);
            this.observable.notifyObservers(this._board);
        } catch (error) {
            console.error("Error during update:", error);
            throw new Error("Game updating failed");
        }
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
