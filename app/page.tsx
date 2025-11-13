import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Target, BarChart3, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4" variant="secondary">
            AI Search Visibility Platform
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            See where your brand really stands in{' '}
            <span className="text-primary">AI search</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Track and optimize your visibility across ChatGPT, Perplexity,
            Gemini, and other AI search engines.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to dominate AI search
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to track, analyze, and improve your AI visibility
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Search className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Multi-Engine Tracking</CardTitle>
                <CardDescription>
                  Monitor your brand mentions across ChatGPT, Perplexity, Gemini, and more
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Visibility Scoring</CardTitle>
                <CardDescription>
                  Real-time visibility scores with trend analysis and competitive insights
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Target className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Smart Prompts</CardTitle>
                <CardDescription>
                  AI-powered prompt suggestions tailored to your industry and brand
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Deep insights into citations, rankings, and topic clusters
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Automated Tracking</CardTitle>
                <CardDescription>
                  Set it and forget it - automated daily tracking across all engines
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Vertical Agnostic</CardTitle>
                <CardDescription>
                  Works for any brand, product, person, or organization across all industries
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your AI presence?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join brands already optimizing their AI search visibility
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Start Tracking Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
