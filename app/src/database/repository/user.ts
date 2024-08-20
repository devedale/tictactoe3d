import { User } from '../models/user';
import { Role } from '../models/role';
import { RoleRepository } from './role';

interface ICreateUser {
  email: string;
  password: string;
}

const roleRepository = new RoleRepository();

/** Repository class for managing User-related database operations. */
class UserRepository {
  /**
   * Creates a new user in the system.
   *
   * @param {ICreateUser} data - The data required to create a user.
   * @returns {Promise<Partial<User>>} - The created user with sensitive fields (like password) excluded.
   * @throws {Error} - Throws an error if user creation fails.
   */
  async createUser(data: ICreateUser): Promise<Partial<User>> {
    try {
      const user = await User.dao.save(data);
      const { password, ...otherKeys } = user.dataValues;
      return otherKeys as Partial<User>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new admin user in the system.
   *
   * @param {ICreateUser} data - The data required to create an admin user.
   * @returns {Promise<User>} - The created admin user.
   * @throws {Error} - Throws an error if admin creation fails.
   */
  async createAdmin(data: ICreateUser): Promise<User> {
    // Missing service for registering admin
    try {
      const role = await roleRepository.getRoleByName('admin');

      if (!role) {
        throw new Error('Admin role not found');
      }

      data.roleId = role.id;

      const user = await User.dao.save(data);
      console.log('Admin created');
      console.log(user);
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param {number} id - The ID of the user to retrieve.
   * @returns {Promise<User | null>} - The user if found, otherwise null.
   * @throws {Error} - Throws an error if retrieving the user by ID fails.
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      if (await this.userIdExist(id)) {
        const user = await User.dao.get(id);
        return user as User | null;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a user exists by their ID.
   *
   * @param {number} userId - The ID of the user to check.
   * @returns {Promise<boolean>} - True if the user exists, false otherwise.
   */
  async userIdExist(userId: number): Promise<boolean> {
    try {
      // Cache handling is missing
      const count = await User.count({ where: { id: userId } });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the role associated with a user by their ID.
   *
   * @param {number} id - The ID of the user.
   * @returns {Promise<Role | null>} - The user's role if found, otherwise null.
   * @throws {Error} - Throws an error if retrieving the role by user ID fails.
   */
  async getRoleByUserId(id: number): Promise<Role | null> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }
      const role = await roleRepository.getRoleById(user.roleId);
      return role as Role | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the role name associated with a user by their ID.
   *
   * @param {number} id - The ID of the user.
   * @returns {Promise<string | null>} - The name of the user's role, or null if not found.
   * @throws {Error} - Throws an error if retrieving the role name by user ID fails.
   */
  async getUserRoleNameById(id: number): Promise<string | null> {
    try {
      const role = await this.getRoleByUserId(id);
      return role.name as string | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user by their email.
   *
   * @param {string} email - The email of the user to retrieve.
   * @returns {Promise<User | null>} - The user if found, otherwise null.
   * @throws {Error} - Throws an error if retrieving the user by email fails.
   */
  async getUserByEmail(email: string): Promise<User | null> {
    // Cache handling is missing
    try {
      const user = await User.findOne({ where: { email } });
      return user as User | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all users from the system.
   *
   * @returns {Promise<User[] | null>} - An array of users, or null if none found.
   * @throws {Error} - Throws an error if retrieving users fails.
   */
  async getUsers(): Promise<User[] | null> {
    try {
      const users = await User.dao.getAll();
      return users as User[] | null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a user's details.
   *
   * @param {User} user - The user to update.
   * @param {Partial<ICreateUser>} data - The new data for the user.
   * @returns {Promise<0 | 1>} - 1 if the update was successful, otherwise 0.
   * @throws {Error} - Throws an error if updating the user fails.
   */
  async updateUser(user: User, data: Partial<ICreateUser>): Promise<0 | 1> {
    try {
      console.log('Updating user:', user);
      return (await User.dao.update(user, data)) as 0 | 1;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a user from the system.
   *
   * @param {User} user - The user to delete.
   * @returns {Promise<0 | 1>} - 1 if deletion was successful, otherwise 0.
   * @throws {Error} - Throws an error if deleting the user fails.
   */
  async deleteUser(user: User): Promise<0 | 1> {
    try {
      console.log('Deleting user:', user);
      return (await User.dao.delete(user)) as 0 | 1;
    } catch (error) {
      throw error;
    }
  }
}

export { UserRepository };
