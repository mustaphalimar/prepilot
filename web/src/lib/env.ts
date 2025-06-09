// Environment configuration utility
const createEnvConfig = () => {
  // Check if we're in staging environment
  const isStaging = 
    import.meta.env.VITE_NODE_ENV === 'staging' ||
    import.meta.env.VITE_ENVIRONMENT === 'staging' ||
    import.meta.env.VITE_RAILWAY_ENVIRONMENT === 'staging';

  // Check if we're in production environment (only true production, not staging)
  const isProduction = 
    (import.meta.env.VITE_NODE_ENV === 'production' ||
     import.meta.env.VITE_ENVIRONMENT === 'production' ||
     import.meta.env.VITE_RAILWAY_ENVIRONMENT === 'production') &&
    // Exclude staging from production
    !isStaging;

  // Check if we're in development
  const isDevelopment = 
    import.meta.env.DEV ||
    import.meta.env.VITE_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0'));

  return {
    isProduction,
    isStaging,
    isDevelopment,

    // Get current environment
    environment: import.meta.env.VITE_NODE_ENV || import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development',

    // Clerk configuration
    clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,

    // API configuration
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',

    // Feature flags for production safety
    features: {
      // Enable features in development and staging, disable only in production
      enableAuth: !isProduction,
      enableDashboard: !isProduction,
      enableRouterDevtools: import.meta.env.DEV || isStaging,
      showDevIndicator: import.meta.env.DEV || isStaging,
    },

    // Railway specific environment detection
    railway: {
      isRailway: !!import.meta.env.VITE_RAILWAY_ENVIRONMENT,
      environment: import.meta.env.VITE_RAILWAY_ENVIRONMENT,
      projectId: import.meta.env.VITE_RAILWAY_PROJECT_ID,
      service: import.meta.env.VITE_RAILWAY_SERVICE_NAME,
    },

    // Debug information (only available in development)
    debug: {
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
      enableLogs: import.meta.env.DEV,
    },
  } as const;
};

export const env = createEnvConfig();

// Validation function to ensure required environment variables are set
export function validateEnvironment() {
  const errors: string[] = [];

  // Only require Clerk key in development (production shows demo page)
  if (!env.isProduction && !env.clerkPublishableKey) {
    errors.push('VITE_CLERK_PUBLISHABLE_KEY is required for development');
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(error => console.error(`- ${error}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  // Log environment info in development
  if (env.isDevelopment) {
    console.log('🌍 Environment:', {
      mode: env.environment,
      isProduction: env.isProduction,
      isDevelopment: env.isDevelopment,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      railway: env.railway.isRailway ? env.railway : 'Not deployed on Railway',
    });
  }
}

// Helper function to get the current deployment URL
export function getDeploymentUrl(): string {
  if (typeof window === 'undefined') return '';
  
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ''
  }`;
}

// Helper function to check if we're in a specific environment
export function isEnvironment(envName: string): boolean {
  return env.environment === envName;
}

// Production safety check - returns true if it's safe to show the full app
export function isSafeToShowApp(): boolean {
  return !env.isProduction; // Allow development and staging, block only production
}