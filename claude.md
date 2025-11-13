# RankMeUpon.ai - AI Search Visibility Platform

## MISSION
Build and ship a production-ready AI search visibility platform that tracks brand mentions across ChatGPT, Perplexity, Gemini, and other AI engines. The platform must be vertical-agnostic, supporting any organization, person, product, or brand across all industries.

## TECH STACK
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Google Material Icons
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel
- **AI Integration**: OpenAI API, Anthropic API, Google Gemini API

## REPO/ENV
- **Path**: `/Users/murali/1backup/rankmeuponai.com`
- **Package Manager**: npm
- **OS**: macOS (darwin)
- **Node Version**: Latest LTS

## OPERATING RULES
- No emojis - use Google Material Icons only
- Footer on every page with version (starts at 1.0), date, and repo name
- Version increments with each Git push (1.0 → 1.1 → 1.2, etc.)
- Work autonomously - make sensible assumptions
- Production-grade code by default
- Zero TypeScript/ESLint errors
- No secrets in code - use environment variables

## DELIVERABLES
1. Working code with meaningful Git commits
2. `npm run dev` for development, `npm run build` for production
3. Comprehensive test coverage
4. `.env.example` with all required variables
5. Complete README.md with setup instructions
6. Error handling with user-visible messages
7. Lint/format configuration
8. CHANGELOG documenting all changes

## CURRENT STATUS
Building MVP foundation with core features:
- User authentication and onboarding
- Brand/entity tracking setup
- AI-powered vertical detection
- Prompt management system
- ChatGPT tracking integration
- Analytics dashboard
- Real-time visibility scoring

## DESIGN SPECIFICATION (BrandRadar Reference)

### Visual Style
**Color Palette:**
- Background: Pure black (#000000) or very dark gray (#0A0A0A)
- Cards: Dark gray (#1A1A1A to #1F1F1F) with subtle borders
- Text: White (#FFFFFF) for headings, light gray (#A0A0A0) for secondary
- Primary: Bright blue (#3B82F6 or #2563EB)
- AI Engine Colors:
  - ChatGPT/OpenAI: Purple (#8B5CF6)
  - Perplexity: Teal/Cyan (#06B6D4)
  - Gemini: Multi-color gradient
  - Claude: Orange (#D97757)

**Typography:**
- Font Family: Inter (Google Font)
- Headings: Font weight 600-700
- Body: Font weight 400-500
- Small text: Font weight 400, muted color

**Layout:**
- Left sidebar navigation (60-80px collapsed, 240px expanded)
- Main content area with padding
- Cards with rounded corners (8-12px)
- Consistent spacing (4px, 8px, 16px, 24px, 32px scale)

### Navigation Structure
**Sidebar Menu:**
1. Home/Dashboard (home icon)
2. Overview (chart icon)
3. Prompts (list icon)
4. Topics (tag icon)
5. Keywords (search icon)
6. Settings (gear icon)

**Top Bar:**
- Brand selector dropdown (left)
- Date range picker (center-right)
- User menu with avatar (far right)
- "Get Help" button

### Page Layouts

**1. Onboarding Flow (3 Steps)**

*Step 1 - Brand Information:*
- Greeting: "Hey {name}! 👋"
- Subtitle: "Let's optimize your brand for AI"
- Fields:
  - Brand name (input)
  - Website URL (input with validation)
  - Brand variations (input with +add button)
  - Helper text: "For better results, add up-to 2 more brand variations"
- Progress: "Step 1 / 2"
- Continue button (bottom right)

*Step 2 - Geographic Targeting:*
- Title: "Where does your brand operate? 🌍"
- Selection:
  - Location Specific (with location pin icon)
  - Global (with globe icon)
- If location specific: Location input field
- Progress: "Step 2 / 2"
- Back + Complete buttons

*Step 3 - Topic Clusters:*
- Title: "Choose your topic clusters"
- Subtitle: "Here's 5 topic clusters with personalized prompts ✨"
- 4-6 topic cluster cards:
  - Topic name (e.g., "Healthcare Services in Nagpur")
  - "Topic Cluster • 5 prompts"
  - List of 5 sample prompts
  - "Select topic" button
  - Close button
- Bottom counter: "Topics: 0, Prompts: 0"
- Skip + Continue buttons

**2. Dashboard**
- Greeting: "Hey {name} 👋"
- Subtitle: "Manage and monitor all your brands in one place"
- Brand cards:
  - Brand logo/icon
  - Brand name
  - Description
  - Website link
  - Trial badge
  - Usage: "5 out of 10 prompts used"
  - Status cards: "5 Prompts Pending"
  - Updated timestamp
  - View + Manage buttons

**3. Overview Page**
- Brand header:
  - Logo + Brand name
  - "OTHER NAMES" badge with variations
  - Website link with visitor count
  - "Track more prompts" button
- Date selector dropdown
- Three metric cards:
  - Brand Visibility Score (with info icon)
  - Prompt Mentions (with info icon)
  - Top domains (with info icon)
  - Empty state: "No Data - Try updating prompts or check back later"
- Chart section:
  - Dropdowns: "Last 5 days" + "Brand Visibility Score"
  - Legend: All, OpenAI, Perplexity, Gemini (with colored dots)
  - Line/area chart

**4. Prompts Page**
- Header: "All Prompts" with total count
- Filters: Search, Brand selector, Date picker, Export button
- Data Table columns:
  - Rank (sortable)
  - Prompt (sortable, left-aligned)
  - Discovered brands (sortable, centered)
  - Prompt score (sortable, progress bar + percentage)
  - Region (sortable, with globe icon)
  - Sentiment (sortable, dash if no data)
  - Updated (sortable, date)
- Pagination: Rows per page selector + page navigation
- Row count: "Showing 1-1 rows out of 1"

**5. Topics Page**
- Header: "All Topics" with count
- Filters: Search topic, Brand selector, Date picker, Export
- Table columns:
  - Rank
  - Topic name
  - Prompts count
  - Topic score (progress bar)
  - LLM breakdown (icons with percentages for each AI engine)
  - Discovered Brands count
  - Last Updated

**6. Keywords Page**
- Header: "All keyword phrases"
- Filters: Search, Brand selector ("All Brands"), Date picker, Export
- Table columns:
  - Rank
  - Keyword
  - Keyword score (progress bar)
  - LLM (percentages for each engine)
  - Prompt mentions count

### UI Components to Implement
1. **Data Table** - Sortable, filterable, paginated
2. **Progress Bars** - Horizontal bars with percentage
3. **Empty States** - Icon + message + helper text
4. **Metric Cards** - Large number + label + info icon
5. **Topic Cluster Cards** - Selectable cards with lists
6. **Brand Selector Dropdown** - With brand logo
7. **Date Range Picker** - With navigation arrows
8. **AI Engine Icons** - Color-coded badges
9. **Sidebar Navigation** - Collapsible with icons
10. **User Menu** - Avatar with dropdown

### Interaction Patterns
- Hover states on cards (subtle border glow)
- Click states with feedback
- Loading states with spinners
- Toast notifications for actions
- Smooth transitions (200-300ms)
- Skeleton loaders for data fetching

### Responsive Breakpoints
- Mobile: < 768px (sidebar collapses to icons only)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## GEO (GENERATIVE ENGINE OPTIMIZATION) FRAMEWORK

### Core Research Foundation
Based on "GEO: Generative Engine Optimization" (Princeton University, KDD 2024, arXiv:2311.09735)

**Key Findings:**
- GEO methods boost content visibility by up to 40% in AI-generated responses
- Traditional SEO tactics (keyword stuffing) perform poorly in AI search
- Optimization efficacy varies significantly across domains

### Top Ranking Factors (By Effectiveness)
1. **Quotation Addition** (+40% visibility) - Authority quotes
2. **Statistics Addition** (+65% in some cases) - Verifiable data
3. **Source Citations** - Credible references
4. **Fluency Optimization** - Clear, error-free text
5. **Technical Terms** - Domain expertise
6. **Authoritative Tone** (+90% in some categories)

### Platform-Specific Characteristics
**ChatGPT & Perplexity:**
- Greater concentration on limited domain sets
- 80.41% citations from .com domains
- Top 3 domains = 20.63% of citations

**Perplexity-Specific:**
- Heavily relies on authoritative list mentions
- Prioritizes recency (content updated within 30 days)
- Emphasizes semantic clarity

**Google AI Overviews:**
- Appear in 18% of all searches
- 65.3% for health-related queries (90% for some medical topics)
- More even citation distribution

### Application Features to Implement
1. **GEO Score** - Measure brand visibility using research-backed metrics
2. **Content Optimization Engine** - Analyze and suggest:
   - Quotation opportunities
   - Statistical data points
   - Citation sources
   - Tone improvements
   - Technical terminology

3. **Multi-Engine Tracking** - ChatGPT, Perplexity, Gemini, Claude
4. **Citation Quality Analysis** - Track where brand is cited
5. **Topic Cluster Generation** - AI-powered based on GEO principles
6. **Share of Voice** - Brand mentions vs. competitors
7. **Sentiment Analysis** - Favorable/neutral/negative citations

### Healthcare/Medical Professional Features
**E-E-A-T Optimization:**
- Experience showcase (certifications, years, success stories)
- Expertise demonstration
- Authoritativeness signals
- Trustworthiness indicators

**Medical-Specific:**
- Patient-focused query optimization
- Evidence-based content analysis
- Compliance-friendly information checks
- Local SEO integration
- Review management

### Measurement Metrics
- **AI Visibility Score**: Average share of responses citing domain (>70% = strong, <30% = needs work)
- **Brand Mention Frequency**: Total citations across AI engines
- **Share of Voice**: % of relevant AI responses vs competitors
- **Citation Quality**: Source authority analysis
- **Sentiment Distribution**: 98% should be neutral/positive

### Implementation Workflow
**Onboarding:**
1. Brand info collection
2. Geographic targeting (local vs global)
3. AI-generated topic clusters based on industry
4. Prompt suggestions using GEO principles

**Continuous Optimization:**
1. Content analysis against GEO factors
2. Real-time tracking across AI platforms
3. Competitive citation monitoring
4. Automated optimization suggestions

### Success Metrics
- Technical fixes: 2-6 weeks for visibility improvements
- Strategic content: 25-40% increase within 60 days
- Long-term authority building: 2-5× citations over months

## NEXT STEPS
See TASKS.md for comprehensive 200+ task checklist
