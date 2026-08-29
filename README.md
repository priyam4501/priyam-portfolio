# Priyam Singh — Portfolio

A personal portfolio site for Priyam Singh, a Java Full-Stack Developer. Built to showcase projects, experience, skills, and professional background in a clean, recruiter-friendly format.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS v4
- **Motion:** Framer Motion
- **Backend / Auth:** Lovable Cloud (Supabase)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A Lovable Cloud / Supabase project with the required environment variables

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
bun install
```

### Environment Variables

Create a `.env` file at the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id
```

### Development

```bash
bun run dev
```

The dev server starts at `http://localhost:8080` by default.

### Build

```bash
bun run build
```

For Vercel, the build output is written to `.vercel/output` via the Nitro `vercel` preset.

## Project Structure

```text
src/
  components/        # Reusable UI components
  components/admin/  # Admin panel components
  components/home/   # Public home-page sections
  components/layout/ # Navbar, footer, etc.
  lib/               # Data fetching, server functions, helpers
  routes/            # TanStack Router file routes
  styles.css         # Global design tokens and Tailwind theme
public/              # Static assets (favicon, robots.txt)
supabase/            # Supabase configuration
```

## Admin Panel

The `/admin` route is protected by server-side authentication. Only allowlisted users can access the CMS for managing projects, experience, skills, social links, resume, and profile content.

## Deployment

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/).
3. Set the environment variables listed above in the Vercel dashboard.
4. Deploy.

Vercel will auto-deploy on every push to the default branch.

## License

This project is private and maintained by Priyam Singh. All rights reserved.
