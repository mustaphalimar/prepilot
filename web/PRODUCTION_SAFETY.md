# 🛡️ Production Safety Guide

This document explains the production safeguards implemented to protect the Prepilot web application from being accessed before the MVP is complete.

## 🔒 Production Protection

The web application automatically detects production environments and shows a demo page instead of the actual application to prevent premature access.

### Environment Detection

The app detects production environments through multiple methods:

- `import.meta.env.PROD` (Vite's built-in production flag)
- `VITE_NODE_ENV=production`
- `VITE_ENVIRONMENT=production`
- `VITE_RAILWAY_ENVIRONMENT=production` (Railway-specific)
- Domain-based detection (non-localhost hostnames)

### What Users See in Production

Instead of the actual application, production users will see:
- Professional demo/coming soon page
- Feature highlights and benefits
- Email waitlist signup
- Company branding and contact information

## 🏗️ Development vs Production

### Development Mode (Safe to Work)
- Full application access
- Authentication system enabled
- All features available
- Router devtools visible
- "DEV MODE" indicator in bottom-left corner
- Console logging enabled

### Production Mode (Protected)
- Demo page only
- No authentication required
- No sensitive features exposed
- No development tools
- Clean, professional presentation

## 🚀 Railway Deployment

The application is configured to automatically detect Railway's production environment:

```bash
# Railway automatically sets these in production:
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=your-project-id
```

## 🔧 Environment Configuration

The application uses a centralized environment configuration in `/src/lib/env.ts`:

### Key Configuration Options

```typescript
env.isProduction    // true in production environments
env.isDevelopment   // true in development
env.features.enableAuth    // disabled in production
env.features.enableDashboard    // disabled in production
```

### Environment Variables

Required for development:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication

Optional:
- `VITE_API_URL` - Backend API URL
- `VITE_LOG_LEVEL` - Logging level
- `VITE_ENVIRONMENT` - Manual environment override

## 🧪 Testing Production Mode Locally

To test the production safeguard locally:

```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Or set environment manually
VITE_NODE_ENV=production npm run dev
```

## 🚨 Safety Features

1. **Automatic Detection**: No manual configuration needed
2. **Multiple Fallbacks**: Uses several detection methods
3. **Clean Demo Page**: Professional appearance for early visitors
4. **Feature Flags**: Granular control over enabled features
5. **Environment Validation**: Ensures required variables are set

## 📝 Removing Production Protection

When ready to launch the MVP:

1. Update `env.ts` to enable production features:
```typescript
features: {
  enableAuth: true,        // Enable in production
  enableDashboard: true,   // Enable in production
}
```

2. Or modify the root component check:
```typescript
// Change this line in __root.tsx:
if (!isSafeToShowApp()) {
  return <DemoPage />;
}
```

## 🔍 Debugging

### Development Indicators
- Orange "DEV MODE" badge (bottom-left)
- Browser console environment logs
- Router devtools available

### Production Verification
- Demo page should load on production domains
- No authentication components visible
- No sensitive data exposed
- Clean, professional presentation

## 📞 Support

If you need to bypass protection for testing:
1. Set `VITE_ENVIRONMENT=development` 
2. Use localhost for development
3. Check browser console for environment logs

---

**⚠️ Important**: Do not remove these safeguards until the MVP is complete and thoroughly tested!