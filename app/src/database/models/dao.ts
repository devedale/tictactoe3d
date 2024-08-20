import { Model, ModelCtor, Optional } from 'sequelize';
import redisClient from '../cache';

const getFromCache = redisClient.getFromCache;
const setInCache = redisClient.setInCache;
const deleteFromCache = redisClient.deleteFromCache;

/**
 * Interface representing the Data Access Object (DAO) for a Sequelize Model.
 *
 * @template T - The Sequelize Model type.
 */
interface DaoI<T extends Model> {
  /**
   * Retrieves a model instance by its primary key.
   *
   * @param {number} id - The primary key of the instance to retrieve.
   * @returns {Promise<T | null>} - The retrieved instance or null if not found.
   */
  get(id: number): Promise<T | null>;

  /**
   * Retrieves all instances of the model.
   *
   * @returns {Promise<T[]>} - An array of all instances.
   */
  getAll(): Promise<T[]>;

  /**
   * Saves a new instance of the model.
   *
   * @param {Partial<T>} instance - The data to create the instance with.
   * @returns {Promise<T | null>} - The created instance or null if creation failed.
   */
  save(instance: Partial<T>): Promise<T | null>;

  /**
   * Creates a new instance of the model.
   *
   * @param {Partial<T>} data - The data to create the instance with.
   * @returns {Promise<T | null>} - The created instance or null if creation failed.
   */
  create(data: Partial<T>): Promise<T | null>;

  /**
   * Updates an existing instance of the model.
   *
   * @param {T} instance - The instance to update.
   * @param {Optional<T, keyof T>} updateParams - The fields to update.
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
   */
  update(instance: T, updateParams: Optional<T, keyof T>): Promise<boolean>;

  /**
   * Deletes an existing instance of the model.
   *
   * @param {T} instance - The instance to delete.
   * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise.
   */
  delete(instance: T): Promise<boolean>;
}

/**
 * Generic Data Access Object (DAO) class for Sequelize models. Provides caching and CRUD operations.
 *
 * @template T - The Sequelize Model type.
 */
export class Dao<T extends Model> implements DaoI<T> {
  /**
   * Stores instances of DAOs, one for each model.
   *
   * @private
   * @type {Map<ModelCtor<any>, Dao<any>>}
   */
  private static instances: Map<ModelCtor<any>, Dao<any>> = new Map();

  /**
   * The Sequelize model associated with this DAO.
   *
   * @private
   * @type {ModelCtor<T>}
   */
  private model: ModelCtor<T>;

  /**
   * Private constructor to enforce the singleton pattern.
   *
   * @private
   * @param {ModelCtor<T>} model - The Sequelize model.
   */
  private constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  /**
   * Gets the singleton instance of the DAO for a specific model.
   *
   * @template T
   * @param {ModelCtor<T>} model - The Sequelize model.
   * @returns {Dao<T>} - The DAO instance for the given model.
   */
  public static getInstance<T extends Model>(model: ModelCtor<T>): Dao<T> {
    if (!this.instances.has(model)) {
      this.instances.set(model, new Dao(model));
    }
    return this.instances.get(model) as Dao<T>;
  }

  /**
   * Generates a cache key based on the model name and optional ID.
   *
   * @private
   * @param {number} [id] - The ID of the model instance.
   * @returns {string} - The generated cache key.
   */
  private generateCacheKey(id?: number): string {
    const className = this.model.name;
    return id ? `${className}:${id}` : `${className}:all`;
  }

  /**
   * Retrieves a model instance by its primary key, utilizing cache.
   *
   * @param {number} id - The primary key of the instance to retrieve.
   * @returns {Promise<T | null>} - The retrieved instance or null if not found.
   */
  async get(id: number): Promise<T | null> {
    const cacheKey = this.generateCacheKey(id);
    try {
      const cachedResult = await getFromCache(cacheKey);

      if (cachedResult) {
        console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
        return this.createInstance(JSON.parse(cachedResult)) as T;
      }

      const result = await this.model.findByPk(id);

      if (result) {
        console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
        await setInCache(cacheKey, JSON.stringify(result));
      }

      return result as T;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a model instance from raw data.
   *
   * @private
   * @param {any} data - The raw data to create the instance from.
   * @returns {T} - The created model instance.
   */
  private createInstance(data: any): T {
    return Object.assign(new this.model(), data);
  }

  /**
   * Retrieves all instances of the model, utilizing cache.
   *
   * @returns {Promise<T[]>} - An array of all instances.
   */
  async getAll(): Promise<T[]> {
    const cacheKey = this.generateCacheKey();
    try {
      const cachedResult = await getFromCache(cacheKey);

      if (cachedResult) {
        console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
        return JSON.parse(cachedResult) as T[];
      }

      const result = (await this.model.findAll()) as T[];

      if (result && result.length > 0) {
        console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
        await setInCache(cacheKey, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Saves a new instance of the model and invalidates relevant cache.
   *
   * @param {Partial<T>} data - The data to create the instance with.
   * @returns {Promise<T | null>} - The created instance or null if creation failed.
   */
  async save(data: Partial<T>): Promise<T | null> {
    try {
      const instance = await this.model.create(data);
      await this.invalidateCache(instance);
      return !instance ? null : (instance as T);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an existing instance of the model and invalidates relevant cache.
   *
   * @param {T} instance - The instance to update.
   * @param {Partial<T>} updateParams - The fields to update.
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
   */
  async update(instance: T, updateParams: Partial<T>): Promise<boolean> {
    const id = (instance as any).id as number;
    if (!id) {
      console.error('Instance ID is missing');
      return false;
    }

    try {
      const [affectedRows, updatedRows] = await this.model.update(updateParams, {
        where: { id },
        returning: true,
      });

      if (affectedRows === 0) {
        console.error('No rows were updated. Ensure that the ID is correct and the data is valid.');
        return false;
      }

      await this.invalidateCache(updatedRows[0]);
      return affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes an existing instance of the model and invalidates relevant cache.
   *
   * @param {T} instance - The instance to delete.
   * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise.
   */
  async delete(instance: T): Promise<boolean> {
    const id = (instance as T).id as number;
    if (!id) {
      console.error('Instance ID is missing');
      return false;
    }

    try {
      await this.invalidateCache(instance);
      const result = await this.model.destroy({ where: { id } });
      return result > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidates the cache for the given instance and all instances of the model.
   *
   * @private
   * @param {T} instance - The instance for which to invalidate the cache.
   * @returns {Promise<void>}
   */
  private async invalidateCache(instance: T): Promise<void> {
    const id = (instance as T).id as number;
    const cacheKey = this.generateCacheKey(id);
    try {
      await deleteFromCache(cacheKey);
    } catch (error) {
      throw error;
    }

    const allCacheKey = this.generateCacheKey();
    try {
      await deleteFromCache(allCacheKey);
    } catch (error) {
      throw error;
    }
  }
}
