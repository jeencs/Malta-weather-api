export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    public type: string,
    public title: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toProblemDetails(instance: string): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.statusCode,
      detail: this.message,
      instance,
    };
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(
      400,
      'https://api.malta-weather.com/problems/validation-error',
      'Validation Error',
      message
    );
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(
      404,
      'https://api.malta-weather.com/problems/not-found',
      'Resource Not Found',
      message
    );
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string) {
    super(
      500,
      'https://api.malta-weather.com/problems/database-error',
      'Database Error',
      message
    );
  }
}

export class ScraperError extends ApplicationError {
  constructor(message: string) {
    super(
      503,
      'https://api.malta-weather.com/problems/scraper-error',
      'Scraper Error',
      message
    );
  }
}

