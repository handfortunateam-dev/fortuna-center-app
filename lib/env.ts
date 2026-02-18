/**
 * Environment Variables Utility
 * 
 * Provides type-safe access to environment variables with validation.
 * Import this instead of directly accessing process.env
 */

/**
 * Get environment variable with validation
 * Throws error if required variable is missing
 */
export function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];

    if (!value && required) {
        throw new Error(
            `Missing required environment variable: ${key}\n` +
            `Please check ENV_SETUP_GUIDE.md for setup instructions.`
        );
    }

    return value || '';
}

/**
 * Get optional environment variable with default value
 */
export function getEnvVarOptional(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Environment configuration object
 * All environment variables should be accessed through this object
 */
export const env = {
    // Node environment
    nodeEnv: getEnvVarOptional('NODE_ENV', 'development'),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),

    // Database
    database: {
        url: getEnvVar('DATABASE_URL'),
    },

    // Clerk Authentication
    clerk: {
        publishableKey: getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
        secretKey: getEnvVar('CLERK_SECRET_KEY'),
    },

    // LiveKit (Optional)
    livekit: {
        apiKey: getEnvVarOptional('LIVEKIT_API_KEY'),
        apiSecret: getEnvVarOptional('LIVEKIT_API_SECRET'),
        wsUrl: getEnvVarOptional('NEXT_PUBLIC_LIVEKIT_WS_URL'),
    },

    // API Configuration
    api: {
        url: getEnvVarOptional('NEXT_PUBLIC_API_URL', 'http://localhost:3000'),
        appUrl: getEnvVarOptional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    },
} as const;

/**
 * Validate all required environment variables
 * Call this at application startup
 */
export function validateEnv(): void {
    try {
        // Access all required variables to trigger validation
        env.database.url;
        env.clerk.publishableKey;
        env.clerk.secretKey;

        console.log('✅ Environment variables validated successfully');
    } catch (error) {
        console.error('❌ Environment validation failed:', error);
        throw error;
    }
}

// Type definitions for better IDE support
export type Environment = typeof env;
