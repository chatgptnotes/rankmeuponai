export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          See where your brand really stands in{' '}
          <span className="text-primary">AI search</span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Track and optimize your visibility across ChatGPT, Perplexity,
          Gemini, and other AI search engines.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Get Started
          </button>
          <button className="rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
