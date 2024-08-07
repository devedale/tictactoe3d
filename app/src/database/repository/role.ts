import { Role } from '../models/role';
/**
 * ICreateRole is the inteface that defines the Role creation data format.
 */
interface ICreateRole {
  /** The name of the role to be created. */
  name: string;
}

/**
 * RoleRepository handles the CRUD operations for roles.
 */
class RoleRepository {
  /**
   * Creates a new role.
   * @param {ICreateRole} data - The data required to create a role.
   * @returns {Promise<Role>} The created role.
   * @throws {Error} If role creation fails.
   */
  async createRole(data: ICreateRole): Promise<Role> {
    try {
      const role = await Role.dao.save(data);
      return role as Role;
    } catch (error) {
      console.error(error);
      throw new Error('Role creation failed');
    }
  }

  /**
   * Retrieves a role by its ID.
   * @param {number} id - The ID of the role to retrieve.
   * @returns {Promise<Role | null>} The role if found, otherwise null.
   * @throws {Error} If finding the role by ID fails.
   */
  async getRoleById(id: number): Promise<Role | null> {
    try {
      const role = await Role.dao.get(id);
      return role as Role;
    } catch (error) {
      console.error(error);
      throw new Error('Find role by id failed');
    }
  }

  /**
   * Deletes a specified role.
   * @param {Role} role - The role to be deleted.
   * @returns {Promise<0 | 1>} Returns 1 if deletion was successful, otherwise 0.
   * @throws {Error} If role removal fails.
   */
  async deleteRole(role: Role): Promise<0 | 1> {
    try {
      console.log('Role deletion:', role);
      return await Role.dao.delete(role);
    } catch (error) {
      console.error(error);
      throw new Error('Role deletion failed');
    }
  }

  /**
   * Retrieves a role by its name.
   * @param {string} roleName - The name of the role to find.
   * @returns {Promise<Role | null>} The role if found, otherwise null.
   * @throws {Error} If finding the role by name fails.
   */
  async getRoleByName(roleName: string): Promise<Role | null> {
    // CACHE HANDLING IS MISSING
    try {
      const role = await Role.findOne({ where: { name: roleName } });
      return role as Role;
    } catch (error) {
      console.error(error);
      throw new Error('Find role by name failed');
    }
  }
}

export { RoleRepository };
