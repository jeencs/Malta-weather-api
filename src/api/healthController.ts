import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../utils/database';

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  try {
    const dbConnected = await checkDatabaseConnection();

    const health = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
      },
    };

    const statusCode = dbConnected ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}

