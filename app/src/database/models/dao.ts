import { Model, ModelCtor, Optional } from 'sequelize';
import redisClient from '../cache';

const getFromCache = redisClient.getFromCache;
const setInCache = redisClient.setInCache;
const deleteFromCache = redisClient.deleteFromCache;

interface DaoI<T extends Model> {
  get(id: number): Promise<T | null>;
  getAll(): Promise<T[]>;
  save(instance: Partial<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T | null>;
  update(instance: T, updateParams: Optional<T, keyof T>): Promise<boolean>;
  delete(instance: T): Promise<boolean>;
}

export class Dao<T extends Model> implements DaoI<T> {
  private static instances: Map<ModelCtor<any>, Dao<any>> = new Map();

  private model: ModelCtor<T>;

  private constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  public static getInstance<T extends Model>(model: ModelCtor<T>): Dao<T> {
    if (!this.instances.has(model)) {
      this.instances.set(model, new Dao(model));
    }
    return this.instances.get(model) as Dao<T>;
  }

  private generateCacheKey(id?: number): string {
    const className = this.model.name;
    return id ? `${className}:${id}` : `${className}:all`;
  }

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
      console.error(`Error in get method: ${error}`);
      throw error;
    }
  }

  private createInstance(data: any): T {
    return Object.assign(new this.model(), data);
  }

  async getAll(): Promise<T[]> {
    const cacheKey = this.generateCacheKey();
    try {
      const cachedResult = await getFromCache(cacheKey);

      if (cachedResult) {
        console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
        return JSON.parse(cachedResult) as T[];
      }

      const result = await this.model.findAll() as T[];

      if (result && result.length > 0) {
        console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
        await setInCache(cacheKey, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error(`Error in getAll method: ${error}`);
      throw error;
    }
  }

  async save(data: Partial<T>): Promise<T | null> {
    try {
      const instance = await this.model.create(data);
      await this.invalidateCache(instance);
      return instance as T;
    } catch (error) {
      console.error(`Error in save method: ${error}`);
      return null;
    }
  }

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
      console.error(`Error in update method: ${error}`);
      return false;
    }
  }

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
      console.error(`Error in delete method: ${error}`);
      return false;
    }
  }

  private async invalidateCache(instance: T): Promise<void> {
    const id = (instance as T).id as number;
    const cacheKey = this.generateCacheKey(id);
    try {
      await deleteFromCache(cacheKey);
    } catch (error) {
      console.error(`Error deleting cache for key ${cacheKey}: ${error}`);
    }

    const allCacheKey = this.generateCacheKey();
    try {
      await deleteFromCache(allCacheKey);
    } catch (error) {
      console.error(`Error deleting cache for key ${allCacheKey}: ${error}`);
    }
  }
}
