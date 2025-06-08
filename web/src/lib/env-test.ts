// Environment detection test utility
import { env, isSafeToShowApp, getDeploymentUrl } from './env';

/**
 * Test utility to verify environment detection is working correctly
 * Run this in browser console to check environment status
 */
export function testEnvironmentDetection() {
  console.group('🧪 Environment Detection Test');
  
  console.log('📊 Environment Status:');
  console.table({
    'Is Production': env.isProduction,
    'Is Development': env.isDevelopment,
    'Environment': env.environment,
    'Safe to Show App': isSafeToShowApp(),
    'Current URL': getDeploymentUrl(),
  });

  console.log('🔧 Environment Variables:');
  console.table({
    'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
    'VITE_ENVIRONMENT': import.meta.env.VITE_ENVIRONMENT,
    'VITE_RAILWAY_ENVIRONMENT': import.meta.env.VITE_RAILWAY_ENVIRONMENT,
    'MODE': import.meta.env.MODE,
    'PROD': import.meta.env.PROD,
    'DEV': import.meta.env.DEV,
  });

  console.log('🌐 Browser Context:');
  console.table({
    'Hostname': window.location.hostname,
    'Protocol': window.location.protocol,
    'Port': window.location.port,
    'Origin': window.location.origin,
  });

  console.log('🚀 Railway Detection:');
  console.table(env.railway);

  console.log('🎛️ Feature Flags:');
  console.table(env.features);

  console.log('🔍 Production Detection Logic:');
  const checks = {
    'import.meta.env.PROD': import.meta.env.PROD,
    'NODE_ENV === production': import.meta.env.VITE_NODE_ENV === 'production',
    'ENVIRONMENT === production': import.meta.env.VITE_ENVIRONMENT === 'production',
    'RAILWAY_ENV === production': import.meta.env.VITE_RAILWAY_ENVIRONMENT === 'production',
    'Non-localhost hostname': window.location.hostname !== 'localhost' && 
                              window.location.hostname !== '127.0.0.1' &&
                              window.location.hostname !== '0.0.0.0',
  };
  
  console.table(checks);
  
  const anyProductionCheck = Object.values(checks).some(Boolean);
  console.log(`%c${anyProductionCheck ? '🔴 PRODUCTION DETECTED' : '🟢 DEVELOPMENT DETECTED'}`, 
              `font-weight: bold; font-size: 16px; color: ${anyProductionCheck ? 'red' : 'green'}`);

  if (env.isProduction) {
    console.warn('⚠️ Application is in PRODUCTION mode - Demo page will be shown');
  } else {
    console.info('✅ Application is in DEVELOPMENT mode - Full app access enabled');
  }

  console.groupEnd();
  
  return {
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
    safeToShow: isSafeToShowApp(),
    environment: env.environment,
    checks,
  };
}

/**
 * Simulate different environments for testing
 */
export function simulateEnvironment(envType: 'production' | 'development' | 'railway') {
  console.group(`🎭 Simulating ${envType.toUpperCase()} environment`);
  
  const originalEnv = { ...import.meta.env };
  
  switch (envType) {
    case 'production':
      // @ts-ignore - For testing purposes
      import.meta.env.PROD = true;
      import.meta.env.DEV = false;
      import.meta.env.VITE_NODE_ENV = 'production';
      break;
      
    case 'development':
      // @ts-ignore - For testing purposes
      import.meta.env.PROD = false;
      import.meta.env.DEV = true;
      import.meta.env.VITE_NODE_ENV = 'development';
      break;
      
    case 'railway':
      // @ts-ignore - For testing purposes
      import.meta.env.PROD = true;
      import.meta.env.VITE_RAILWAY_ENVIRONMENT = 'production';
      break;
  }
  
  console.log(`Environment simulated as: ${envType}`);
  const result = testEnvironmentDetection();
  
  // Restore original environment
  Object.assign(import.meta.env, originalEnv);
  
  console.groupEnd();
  return result;
}

/**
 * Check if environment detection is working as expected
 */
export function validateEnvironmentSetup(): boolean {
  const issues: string[] = [];
  
  // Check for conflicting environment states
  if (env.isProduction && env.isDevelopment) {
    issues.push('Both production and development flags are true');
  }
  
  // Check required variables in development
  if (env.isDevelopment && !env.clerkPublishableKey) {
    issues.push('Missing VITE_CLERK_PUBLISHABLE_KEY in development');
  }
  
  // Check production safety
  if (env.isProduction && isSafeToShowApp()) {
    issues.push('Production detected but app is marked as safe to show');
  }
  
  // Check Railway-specific variables
  if (env.railway.isRailway && !env.isProduction) {
    console.warn('Railway environment detected but not marked as production');
  }
  
  if (issues.length > 0) {
    console.error('❌ Environment validation failed:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    return false;
  }
  
  console.log('✅ Environment validation passed');
  return true;
}

/**
 * Get environment recommendations
 */
export function getEnvironmentRecommendations() {
  const recommendations: string[] = [];
  
  if (env.isProduction && env.features.enableAuth) {
    recommendations.push('Consider disabling auth in production until MVP is ready');
  }
  
  if (env.isDevelopment && !env.debug.enableLogs) {
    recommendations.push('Enable debug logs in development for better debugging');
  }
  
  if (window.location.protocol === 'http:' && env.isProduction) {
    recommendations.push('Use HTTPS in production for security');
  }
  
  if (!env.apiUrl.startsWith('https://') && env.isProduction) {
    recommendations.push('Use HTTPS for API URLs in production');
  }
  
  return recommendations;
}

// Auto-run tests in development
if (env.isDevelopment) {
  // Make test functions available globally for console access
  (window as any).testEnv = testEnvironmentDetection;
  (window as any).simulateEnv = simulateEnvironment;
  (window as any).validateEnv = validateEnvironmentSetup;
  
  console.log('%c🧪 Environment Test Utils Available', 'color: blue; font-weight: bold');
  console.log('Run testEnv() in console to check environment detection');
}