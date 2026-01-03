# Development Setup Guide

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js**: v16 or higher (v18+ recommended)
- **npm**: v7 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Verify Installation

```bash
node --version  # Should be v16.0.0 or higher
npm --version   # Should be v7.0.0 or higher
git --version   # Should be installed
```

## Project Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd bookit-safari-app
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies including:
- React & TypeScript
- UI components (shadcn/ui)
- State management (React Query)
- Testing libraries (Jest, React Testing Library)
- Linting tools (ESLint)

### 3. Environment Configuration

#### Create `.env.local` File

```bash
cp .env.example .env.local
```

#### Fill in Required Variables

Open `.env.local` and configure:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Service (REQUIRED for email features)
VITE_RESEND_API_KEY=re_your_resend_api_key

# Payment Gateway (OPTIONAL, but needed for payments)
VITE_CLICKPESA_PUBLIC_KEY=your_clickpesa_public_key
VITE_CLICKPESA_SECRET_KEY=your_clickpesa_secret_key

# Application URLs
VITE_APP_URL=http://localhost:8080
VITE_API_URL=https://your-project-id.supabase.co/functions/v1

# Feature Flags
VITE_ENABLE_PAYMENT_GATEWAY=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
```

### 4. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`

### 5. Get Email Service Key (Resend)

1. Sign up at [Resend](https://resend.com)
2. Go to **API Keys**
3. Copy your API key → `VITE_RESEND_API_KEY`

## Development Server

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Development Features

- **Hot Module Reload**: Changes reflect instantly
- **TypeScript Checking**: Real-time type checking
- **Console Output**: Development logs and warnings

### Stop Development Server

Press `Ctrl+C` in the terminal

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run preview      # Preview production build locally
```

### Building

```bash
npm run build        # Build for production
npm run build:dev    # Build with development settings
```

### Code Quality

```bash
npm run lint         # Run ESLint to check code style
```

### Testing

```bash
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Project Structure

```
📁 src/
├── 📁 components/          # React components
│   ├── 📁 ui/             # shadcn/ui components
│   └── 📄 *.tsx           # Feature components
├── 📁 hooks/              # Custom React hooks
│   ├── use-auth.tsx
│   ├── use-bookings.ts
│   └── ...
├── 📁 lib/                # Utilities and helpers
│   ├── 📁 api/           # API service layer
│   ├── 📁 validations/   # Zod schemas
│   ├── 📁 utils/         # Utility functions
│   └── constants.ts
├── 📁 pages/              # Page components
├── 📁 integrations/       # External integrations
│   └── supabase/         # Supabase client & types
├── 📁 __tests__/         # Test files
├── 📄 App.tsx            # Main app component
└── 📄 main.tsx           # Entry point

📁 supabase/
├── 📁 functions/         # Edge functions
├── 📁 migrations/        # Database migrations
└── 📁 templates/         # Email templates

📁 public/               # Static files
└── 📄 robots.txt, sitemap.xml, etc.
```

## Common Development Tasks

### Add a New Page

1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Create corresponding tests in `src/__tests__/pages/`

**Example:**
```typescript
// src/pages/Help.tsx
export default function Help() {
  return <div>Help Page</div>;
}
```

```typescript
// In src/App.tsx routes
<Route path="/help" element={<Help />} />
```

### Create a Custom Hook

1. Create file in `src/hooks/use-your-hook.ts`
2. Export the hook
3. Add tests in `src/__tests__/hooks.test.tsx`

**Example:**
```typescript
// src/hooks/use-timer.ts
import { useState, useEffect } from 'react';

export const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return seconds;
};
```

### Add API Integration

1. Create function in `src/lib/api/your-api.ts`
2. Import in your component
3. Use with React Query or async/await

**Example:**
```typescript
// src/lib/api/example.ts
import { supabase } from '@/integrations/supabase/client';

export const exampleApi = {
  async fetchData() {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};
```

```typescript
// In a component
import { exampleApi } from '@/lib/api/example';

useEffect(() => {
  exampleApi.fetchData().then(setData);
}, []);
```

### Write Tests

```typescript
// src/__tests__/example.test.ts
describe('Example Tests', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

Run tests:
```bash
npm test example.test.ts
npm run test:watch
```

## Debugging

### VS Code Debugging

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

2. Set breakpoints in your code (click line number)
3. Press `F5` to start debugging

### Browser DevTools

1. Open developer tools (`F12`)
2. Check:
   - **Console**: Errors and logs
   - **Network**: API calls
   - **Application**: Storage and cookies
   - **React DevTools**: Component state and props

### Console Logging

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## Database Migrations

### View Migrations

```bash
ls supabase/migrations/
```

### Create New Migration

```bash
npx supabase migration new your_migration_name
```

Edit the SQL file in `supabase/migrations/` and run locally with Supabase CLI.

## Deployment

### Build for Production

```bash
npm run build
```

Outputs optimized code to `dist/` directory.

### Deploy to Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel automatically deploys on push

See [VERCEL_404_FIX.md](./VERCEL_404_FIX.md) for deployment troubleshooting.

## Performance Tips

### Enable Caching

React Query is configured with:
- 5-minute stale time
- 10-minute cache duration
- No refetch on window focus

### Code Splitting

Components are automatically code-split by route.

### Bundle Analysis

```bash
npm install --save-dev webpack-bundle-analyzer
# Configure in vite.config.ts
```

## Security

### Never Commit Secrets

- `.env.local` is in `.gitignore` ✅
- Never commit API keys to Git
- Use environment variables for sensitive data

### HTTPS in Production

- All API calls use HTTPS in production
- Supabase enforces secure connections
- Vercel provides free SSL certificates

## Troubleshooting

### Port 8080 Already in Use

```bash
# On Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :8080
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Check TypeScript
npx tsc --noEmit

# View errors in editor (should auto-show)
```

### Supabase Connection Issues

1. Verify `.env.local` has correct credentials
2. Check project is running in Supabase dashboard
3. Verify API key has correct permissions
4. Check browser console for detailed errors

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)

## Getting Help

1. Check [README.md](./README.md) for project overview
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
3. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing help
4. Review security documentation:
   - [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)
   - [PAYMENT_SECURITY_REPORT.md](./PAYMENT_SECURITY_REPORT.md)

## Next Steps

1. ✅ Set up environment
2. ✅ Run development server
3. ✅ Familiarize with codebase
4. ✅ Read API documentation
5. ✅ Run tests
6. ✅ Start developing!
