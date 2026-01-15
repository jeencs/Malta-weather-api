import { Request, Response } from 'express';
import { dbConnection } from '../../repositories/DatabaseConnection';
import { schedulerService } from '../../services/SchedulerService';

export class HealthController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    const dbHealthy = await dbConnection.healthCheck();
    const schedulerStatus = schedulerService.getStatus();

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealthy,
      },
      scheduler: {
        running: schedulerStatus.running,
        interval: `${schedulerStatus.interval} minutes`,
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  }
}

export const healthController = new HealthController();

