/**
 * Custom error classes for Video Teacher application
 */

export class VideoTeacherError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends VideoTeacherError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  public readonly details?: unknown;
}

export class VideoNotFoundError extends VideoTeacherError {
  constructor(videoId: string) {
    super(`Video with ID "${videoId}" not found`, 404, 'VIDEO_NOT_FOUND');
    this.videoId = videoId;
  }

  public readonly videoId: string;
}

export class TranscriptNotFoundError extends VideoTeacherError {
  constructor(videoId: string) {
    super(`No transcript available for video "${videoId}"`, 404, 'TRANSCRIPT_NOT_FOUND');
    this.videoId = videoId;
  }

  public readonly videoId: string;
}

export class DeckNotFoundError extends VideoTeacherError {
  constructor(videoId: string) {
    super(`No deck found for video "${videoId}"`, 404, 'DECK_NOT_FOUND');
    this.videoId = videoId;
  }

  public readonly videoId: string;
}

export class JobNotFoundError extends VideoTeacherError {
  constructor(jobId: string) {
    super(`Job with ID "${jobId}" not found`, 404, 'JOB_NOT_FOUND');
    this.jobId = jobId;
  }

  public readonly jobId: string;
}

export class YouTubeAPIError extends VideoTeacherError {
  constructor(message: string, originalError?: Error) {
    super(`YouTube API error: ${message}`, 503, 'YOUTUBE_API_ERROR');
    this.originalError = originalError;
  }

  public readonly originalError?: Error;
}

export class OpenAIAPIError extends VideoTeacherError {
  constructor(message: string, originalError?: Error) {
    super(`OpenAI API error: ${message}`, 503, 'OPENAI_API_ERROR');
    this.originalError = originalError;
  }

  public readonly originalError?: Error;
}

export class DatabaseError extends VideoTeacherError {
  constructor(message: string, originalError?: Error) {
    super(`Database error: ${message}`, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }

  public readonly originalError?: Error;
}

export class RateLimitError extends VideoTeacherError {
  constructor(service: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${service}`, 429, 'RATE_LIMIT_ERROR');
    this.service = service;
    this.retryAfter = retryAfter;
  }

  public readonly service: string;
  public readonly retryAfter?: number;
}

/**
 * Utility function to determine if an error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof VideoTeacherError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Maps errors to appropriate HTTP responses
 */
export function errorToResponse(error: Error) {
  if (error instanceof VideoTeacherError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.details && { details: error.details })
      },
      status: error.statusCode
    };
  }

  // Handle common Node.js/JavaScript errors
  if (error instanceof SyntaxError) {
    return {
      error: {
        message: 'Invalid JSON format',
        code: 'INVALID_JSON',
        statusCode: 400
      },
      status: 400
    };
  }

  // Default to 500 for unknown errors
  console.error('Unhandled error:', error);
  return {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    },
    status: 500
  };
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Re-throw VideoTeacherErrors as-is
      if (error instanceof VideoTeacherError) {
        throw error;
      }

      // Wrap other errors
      if (error instanceof Error) {
        throw new VideoTeacherError(
          `Unexpected error: ${error.message}`,
          500,
          'UNEXPECTED_ERROR',
          false
        );
      }

      // Handle non-Error objects
      throw new VideoTeacherError(
        'Unknown error occurred',
        500,
        'UNKNOWN_ERROR',
        false
      );
    }
  };
}

/**
 * Utility to create consistent error responses for API routes
 */
export function createErrorResponse(error: Error) {
  const { error: errorData, status } = errorToResponse(error);

  return Response.json(errorData, {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}