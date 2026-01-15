import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { DatabaseError } from '../domain/ErrorTypes';

class DatabaseConnection {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: config.database.url,
        max: config.database.poolSize,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.pool.on('error', () => {
      });
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    return this.pool;
  }

  async query<T>(text: string, params?: unknown[]): Promise<T[]> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }

    try {
      const result = await this.pool.query(text, params);
      return result.rows as T[];
    } catch (error) {
      throw new DatabaseError('Database query failed');
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    return this.pool.connect();
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) {
        return false;
      }
      const result = await this.pool.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      return false;
    }
  }
}

export const dbConnection = new DatabaseConnection();

