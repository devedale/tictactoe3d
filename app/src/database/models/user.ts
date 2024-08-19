import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../connection';
import { Dao } from './dao';
import { Role } from './role';

class User extends Model {
  private id!: number;
  private email!: string;
  private password!: string;
  private tokens!: number;
  private roleId!: number;
  public dao!: Dao<User>;

  static initialize(): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tokens: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0.0,
        },
        roleId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'roles',
            key: 'id',
          },
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'user',
        timestamps: true,
        hooks: {
          beforeCreate: async (user: User) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password')) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }
          },
        },
      }
    );

    this.dao = Dao.getInstance(User);
  }

  public comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  static associate() {
    this.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  }
}

User.initialize();
User.associate();

export { User };
