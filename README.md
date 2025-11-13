# RankMeUpon.ai - AI Search Visibility Platform

Track and optimize your brand's visibility across ChatGPT, Perplexity, Gemini, and other AI search engines.

## Features

- **Multi-Engine Tracking**: Monitor brand mentions across ChatGPT, Perplexity, Gemini, and Claude
- **Visibility Scoring**: Real-time visibility scores with trend analysis
- **Smart Prompts**: AI-powered prompt suggestions tailored to your industry
- **Advanced Analytics**: Deep insights into citations, rankings, and topic clusters
- **Automated Tracking**: Set it and forget it - automated daily tracking
- **Vertical Agnostic**: Works for any brand, product, person, or organization

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (LTS version recommended)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rankmeuponai.com.git
   cd rankmeuponai.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`
   - See `supabase/README.md` for detailed instructions

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
rankmeuponai.com/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (dashboard)/         # Dashboard and protected pages
│   ├── api/                 # API routes
│   ├── auth/                # Auth callback handlers
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Auth-specific components
│   ├── dashboard/           # Dashboard components
│   ├── layout/              # Layout components (Header, Footer)
│   └── onboarding/          # Onboarding flow components
├── lib/                     # Utility libraries
│   ├── supabase/            # Supabase client configs
│   ├── version/             # Version management
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # App constants
├── types/                   # TypeScript type definitions
│   ├── database.ts          # Supabase database types
│   └── index.ts             # App-level types
├── stores/                  # Zustand state stores
├── hooks/                   # Custom React hooks
├── supabase/               # Database migrations
│   ├── migrations/          # SQL migration files
│   └── README.md            # Database setup instructions
└── public/                  # Static assets
```

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles linked to auth.users
- **brands**: Brand/entity tracking configuration
- **prompts**: Search prompts to track
- **tracking_sessions**: AI engine query results and citations

All tables have Row Level Security (RLS) enabled.

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Versioning

The application uses semantic versioning (MAJOR.MINOR format). The version is stored in the `VERSION` file and increments with each Git push:

- `1.0` → Initial release
- `1.1` → First update
- `1.2` → Second update
- etc.

The version is displayed in the footer on all pages.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please contact support@rankmeuponai.com

---

**Version**: 1.0  
**Last Updated**: 2025-11-14  
**Repository**: rankmeuponai.com
