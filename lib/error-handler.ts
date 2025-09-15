import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        statusCode: error.statusCode 
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors
  if (error instanceof Error && error.name === 'ZodError') {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message 
      },
      { status: 400 }
    );
  }

  // Handle database errors
  if (error instanceof Error && error.message.includes('database')) {
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        statusCode: 503 
      },
      { status: 503 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    { 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500 
    },
    { status: 500 }
  );
}

export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      500
    );
  }
}
