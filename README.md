# Bookit Safari App - Tanzania Bus Booking Platform

A modern bus booking platform for Tanzania, built with React, TypeScript, and Supabase.

**Status:** ✅ Production Ready | Error Handling Complete | Rate Limiting Implemented

## 📚 Documentation

**Start here:** [MASTER_INDEX.md](MASTER_INDEX.md) - Complete guide to all documentation

### Quick Links
- **🚀 Getting Started:** [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md)
- **⚡ Quick Reference:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **📖 Error Handling Guide:** [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
- **💻 Integration Examples:** [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md)
- **📋 Implementation Checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **📊 Project Status:** [PROJECT_STATUS_REPORT.md](PROJECT_STATUS_REPORT.md)

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (see Environment Setup section above)

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Features

- ✅ User authentication (Sign up, Sign in, Password reset)
- ✅ Bus schedule search by route and date
- ✅ Real-time seat availability
- ✅ Booking management
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ Type-safe API layer

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/         # shadcn-ui components
│   └── ...         # Feature components
├── hooks/          # Custom React hooks
│   ├── use-auth.tsx
│   ├── use-bookings.ts
│   ├── use-schedules.ts
│   └── use-regions.ts
├── lib/
│   ├── api/        # API service layer
│   │   ├── bookings.ts
│   │   ├── schedules.ts
│   │   └── regions.ts
│   ├── validations/ # Zod schemas
│   └── constants.ts
├── pages/          # Page components
└── integrations/
    └── supabase/   # Supabase client and types
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Setup

Before running the project, you need to set up environment variables:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project: https://app.supabase.com/project/_/settings/api
   - Copy your **Project URL** and **anon/public key**

3. **Update your `.env.local` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   > **Note:** You can use either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` - both work!

4. **Restart your development server** after creating/updating the `.env` file

> **Note:** The `.env` file is gitignored and will not be committed to version control. Never share your Supabase keys publicly.

> **Troubleshooting:** If you see "supabaseKey is required" error, make sure your `.env` file exists and contains the correct values. See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

## What technologies are used for this project?

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React 18** - UI framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Supabase** - Backend (PostgreSQL + Auth)
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Styling
- **Zod** - Schema validation

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
