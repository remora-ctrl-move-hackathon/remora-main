# Production Deployment Guide

## Overview

This guide covers deploying the Remora DeFi platform to production environments with proper security, performance, and monitoring configurations.

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 20GB SSD minimum
- **Network**: Stable internet connection with low latency to Aptos RPC endpoints

### Required Accounts & Services

- **Vercel Account** (recommended hosting)
- **Aptos Mainnet Wallet** with appropriate permissions
- **Domain Name** with SSL certificate
- **Monitoring Service** (optional but recommended)

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
# Network Configuration
NEXT_PUBLIC_APTOS_NETWORK=mainnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
NEXT_PUBLIC_APTOS_FAUCET_URL=https://faucet.mainnet.aptoslabs.com

# Merkle Trade Configuration
NEXT_PUBLIC_MERKLE_NETWORK=mainnet
NEXT_PUBLIC_MERKLE_API_URL=https://api.merkle.trade

# Application Configuration
NEXT_PUBLIC_APP_NAME="Remora Finance"
NEXT_PUBLIC_APP_URL=https://app.remora.finance
NEXT_PUBLIC_APP_VERSION=1.0.0

# Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Security
NEXT_PUBLIC_CSP_REPORT_URI=https://api.remora.finance/csp-report
NEXTAUTH_SECRET=your_secure_secret_key
NEXTAUTH_URL=https://app.remora.finance

# API Keys (Server-side only)
MERKLE_API_KEY=your_merkle_api_key
NOTIFICATION_SERVICE_KEY=your_notification_key
```

### Security Configuration

#### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' 
        https://fullnode.mainnet.aptoslabs.com 
        https://api.merkle.trade 
        wss://api.merkle.trade;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## Build Configuration

### Optimized Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['api.merkle.trade'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // PWA Configuration
  experimental: {
    appDir: true,
  },
  
  // Bundle analysis
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      // Bundle analyzer in production
      if (process.env.ANALYZE) {
        const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
          enabled: true,
        })
        config.plugins.push(BundleAnalyzerPlugin)
      }
    }
    return config
  },
  
  // Output configuration
  output: 'standalone',
  
  // Internationalization
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Build Process

### Production Build Script

```bash
#!/bin/bash
# build-production.sh

set -e

echo "🏗️  Starting production build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Type checking
echo "🔍 Type checking..."
npm run type-check

# Lint code
echo "🔧 Linting code..."
npm run lint

# Build application
echo "🚀 Building application..."
npm run build

# Generate sitemap
echo "🗺️  Generating sitemap..."
npm run sitemap

echo "✅ Production build completed successfully!"
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true npm run build",
    "sitemap": "next-sitemap",
    "build:production": "./scripts/build-production.sh"
  }
}
```

## Deployment Strategies

### Vercel Deployment (Recommended)

#### 1. Vercel Configuration

```json
{
  "version": 2,
  "name": "remora-finance",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": ".next"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APTOS_NETWORK": "mainnet"
  },
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 2. Deploy Command

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Docker Deployment

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APTOS_NETWORK=mainnet
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.remora.rule=Host(`app.remora.finance`)"
      - "traefik.http.routers.remora.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@remora.finance"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "letsencrypt:/letsencrypt"
    restart: unless-stopped

volumes:
  letsencrypt:
```

## Performance Optimization

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['api.merkle.trade', 'images.remora.finance'],
  },
}
```

### Caching Strategy

```typescript
// src/lib/cache.ts
export const cacheConfig = {
  // API responses
  positions: { ttl: 30 }, // 30 seconds
  orders: { ttl: 15 },    // 15 seconds
  prices: { ttl: 5 },     // 5 seconds
  history: { ttl: 300 },  // 5 minutes
  
  // Static data
  pairs: { ttl: 3600 },   // 1 hour
  config: { ttl: 86400 }, // 24 hours
}
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'remora-v1.0.0'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }
})
```

## Monitoring & Analytics

### Error Monitoring

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out sensitive information
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('private key')) {
        return null
      }
    }
    return event
  },
})
```

### Performance Monitoring

```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION,
    })
  }
}

// Usage
trackEvent('trade_placed', {
  pair: 'BTC_USD',
  size: 1000,
  leverage: 10
})
```

### Health Checks

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connectivity
    // Check external service availability
    // Check memory usage
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      uptime: process.uptime(),
    }
    
    res.status(200).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    })
  }
}
```

## Security Measures

### API Route Protection

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? '127.0.0.1'
  const rateLimit = rateLimiter.check(ip)
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // CORS headers
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', 'https://app.remora.finance')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### Input Validation

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const OrderParamsSchema = z.object({
  pair: z.enum(['BTC_USD', 'ETH_USD', 'APT_USD']),
  size: z.number().min(2).max(1000000),
  collateral: z.number().min(1).max(100000),
  isLong: z.boolean(),
  isIncrease: z.boolean(),
  leverage: z.number().min(1).max(150).optional()
})

// Usage in API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedParams = OrderParamsSchema.parse(req.body)
    // Process request...
  } catch (error) {
    return res.status(400).json({ error: 'Invalid parameters' })
  }
}
```

## Backup & Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup user data
echo "Creating backup: $DATE"
# Add your backup commands here

# Compress backup
tar -czf "$BACKUP_DIR/remora_backup_$DATE.tar.gz" /path/to/data

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "remora_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: remora_backup_$DATE.tar.gz"
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 2 hours
2. **RPO (Recovery Point Objective)**: 15 minutes
3. **Backup Frequency**: Every 4 hours
4. **Monitoring**: 24/7 automated alerts

## DNS & CDN Configuration

### Cloudflare Settings

```yaml
# DNS Records
A    app.remora.finance     -> 76.76.19.19 (Vercel)
AAAA app.remora.finance     -> 2606:4700:3033::ac43:9741
CNAME www.remora.finance    -> app.remora.finance

# Security Settings
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Minimum TLS Version: 1.2
- HSTS: Enabled (max-age=31536000)
- Security Level: Medium
- Browser Integrity Check: On
```

### Cache Rules

```yaml
# Static Assets
*.js, *.css, *.woff2: Cache for 1 year
*.png, *.jpg, *.svg: Cache for 30 days
*.json: Cache for 5 minutes

# API Routes
/api/prices/*: Cache for 30 seconds
/api/positions/*: No cache
/api/orders/*: No cache
```

## Launch Checklist

### Pre-Launch

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] DNS records updated
- [ ] Security headers implemented
- [ ] Error monitoring configured
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed

### Launch Day

- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Test wallet connectivity
- [ ] Verify trading functionality
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Validate security measures

### Post-Launch

- [ ] Monitor system metrics
- [ ] Review error logs
- [ ] Analyze user behavior
- [ ] Performance optimization
- [ ] Security patches
- [ ] Feature usage analytics
- [ ] User feedback collection

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | TypeScript errors | Run `npm run type-check` |
| Slow loading | Large bundle size | Use `npm run analyze` |
| API errors | Network configuration | Check environment variables |
| Wallet issues | RPC endpoint problems | Verify Aptos node URL |
| Transaction failures | Gas estimation | Update gas parameters |

### Debug Mode

```bash
# Enable debug logging
export DEBUG=remora:*
export NODE_ENV=development

# Run with debugging
npm run dev
```

## Support

For deployment issues:
- **Documentation**: [docs.remora.finance](https://docs.remora.finance)
- **Support**: [support@remora.finance](mailto:support@remora.finance)
- **Discord**: [Join our dev channel](https://discord.gg/remora-dev)