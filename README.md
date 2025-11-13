# RankMeUpon.ai - AI Search Visibility Platform

Track and optimize your visibility across ChatGPT, Perplexity, Gemini, and other AI search engines.

## Features

- **Universal Tracking**: Works for any organization, person, product, or brand
- **Multi-Engine Support**: ChatGPT, Perplexity, Gemini, Claude, Copilot, and more
- **AI-Powered Insights**: Automatic industry detection and prompt suggestions
- **Competitive Intelligence**: Track competitors and discover new brands
- **Real-Time Monitoring**: Get alerts when your visibility changes
- **Analytics Dashboard**: Comprehensive visibility scoring and trend analysis

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **AI Integration**: OpenAI, Anthropic, Google AI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (optional for MVP)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chatgptnotes/rankmeuponai.git
cd rankmeuponai
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (Header, Footer, Sidebar)
│   ├── auth/             # Authentication components
│   ├── onboarding/       # Onboarding flow components
│   ├── dashboard/        # Dashboard components
│   └── prompts/          # Prompt management components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── auth/             # Authentication utilities
│   ├── ai/               # AI integration utilities
│   ├── version/          # Version management
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
├── stores/                # Zustand state stores
└── hooks/                 # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for required environment variables.

## Documentation

- [Task Checklist](TASKS.md) - Comprehensive 300+ task list
- [CHANGELOG](CHANGELOG.md) - Version history and changes

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chatgptnotes/rankmeuponai)

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.

## License

All rights reserved.

---

**Version**: 1.0
**Last Updated**: 2025-11-14
**Repository**: rankmeuponai.com
