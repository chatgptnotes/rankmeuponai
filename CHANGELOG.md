# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7] - 2025-11-14

### Added - AI TRACKING SYSTEM (CORE FEATURE) 🎯
- **OpenAI ChatGPT Integration**: Full API integration with GPT-4o-mini for cost-effective tracking
- **Citation Extraction Engine**: Automatic extraction of URLs, domains, and brand mentions from AI responses
- **Sentiment Analysis**: Detects positive, neutral, and negative brand mentions
- **Competitor Discovery**: Automatically identifies and tracks competitor brands mentioned in responses
- **Visibility Score Calculator**: Real-time calculation of brand visibility percentage
- **Database Schema**:
  - `ai_engines` table - Reference data for ChatGPT, Perplexity, Gemini, Claude
  - `citations` table - Structured citation data with sentiment and relevance scores
  - `discovered_brands` table - Competitor tracking
  - `visibility_scores` table - Historical visibility metrics
- **API Routes**:
  - `POST /api/tracking/track` - Track prompts across AI engines
  - `GET /api/tracking/stats/[brandId]` - Get tracking statistics
- **UI Components**:
  - `TrackingTrigger` - One-click tracking with real-time results
  - Live progress indicators and summary statistics
- **AI Services**:
  - `lib/ai/openai-client.ts` - OpenAI API wrapper with lazy initialization
  - `lib/ai/citation-extractor.ts` - Brand mention and citation extraction
  - `lib/ai/tracking-service.ts` - Orchestration layer for tracking workflow
- **Database Functions**:
  - `calculate_visibility_score()` - Automated score calculation
  - `update_visibility_scores()` - Daily aggregation (cron-ready)
- **Built-in Rate Limiting**: 2-second delays between requests to respect API limits
- **Comprehensive Error Handling**: Failed session tracking, retry logic, and user notifications

### Technical Improvements
- Lazy OpenAI client initialization to prevent build failures
- Proper TypeScript typing for all tracking components
- Row Level Security (RLS) policies for all new tables
- Indexed database columns for optimal query performance
- Toast notifications for user feedback

### Documentation
- `AI_TRACKING_GUIDE.md` - Complete setup and usage guide
- API reference documentation
- Cost estimates and troubleshooting guide

## [1.6] - 2025-11-14

### Fixed - Code Quality Improvements
- Removed all unused imports (8 warnings fixed)
- Fixed unused variables (7 warnings fixed)
- Replaced `any` types with proper TypeScript types
- Replaced `<img>` tags with Next.js `<Image />` components
- Fixed unused error variables in catch blocks

### Added - Testing Infrastructure
- Vitest setup with React Testing Library
- 30+ initial tests for utilities and components
- Test scripts: `npm test`, `npm run test:ui`, `npm run test:coverage`
- Coverage reporting with v8

### Technical Details
- Zero ESLint warnings
- Zero TypeScript errors
- Production build passing
- Better Core Web Vitals with optimized images

## [1.0] - 2025-11-14

### Added
- Initial project setup with Next.js 14, TypeScript, and Tailwind CSS
- Supabase integration for authentication and database
- Landing page with hero section, features showcase, and CTA
- Authentication system (login, signup, email verification)
- Dashboard layout with protected routes
- Database schema with tables for profiles, brands, prompts, and tracking sessions
- Row Level Security (RLS) policies for all tables
- Version management system with automatic increment
- Footer component with version tracking
- shadcn/ui component library integration
- TypeScript type definitions for database and app-level types
- App constants and utility functions
- Middleware for authentication and session management
- .env.example with all required environment variables
- Comprehensive README with setup instructions
- Database migration scripts in supabase/migrations/
- Project structure with organized directories for components, lib, types, etc.

### Technical Details
- Next.js 14 with App Router
- TypeScript with strict type checking
- Tailwind CSS with custom theme configuration
- Supabase for PostgreSQL database and authentication
- shadcn/ui for UI components
- Lucide React for icons
- ESLint for code linting
- Production-ready build configuration

### Developer Experience
- Zero TypeScript errors
- Passing production build
- Clean ESLint warnings (only unused variables in catch blocks)
- Proper error handling
- Type-safe database queries
- Responsive design for mobile and desktop
