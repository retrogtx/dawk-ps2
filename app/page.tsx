import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  ArrowRight,
  Zap,
  Shield,
  GitBranch,
  BookOpen,
  Code2,
  RefreshCw,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FlaskConical className="h-5 w-5 text-primary" />
            SME-Plug
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Expert Brains for{" "}
          <span className="text-primary">AI Agents</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Hot-swappable Subject Matter Expert plugins that turn generalist AI
          into verified domain specialists. Cited answers, decision-tree
          reasoning, zero hallucination.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
        </div>

        {/* Code snippet */}
        <div className="mx-auto mt-12 max-w-xl rounded-lg border bg-card p-6 text-left">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            One API call. Any plugin. Instant expert.
          </p>
          <pre className="overflow-x-auto text-sm">
            <code className="text-muted-foreground">
{`POST /api/v1/query
{
  `}<span className="text-foreground">{`"plugin"`}</span>{`: "structural-eng-v1",
  `}<span className="text-foreground">{`"query"`}</span>{`:  "Min cover for a beam in severe exposure?"
}

→ `}<span className="text-green-600 dark:text-green-400">{`"45mm nominal cover (IS 456, Table 16)" [Source 1]`}</span>{`
→ confidence: `}<span className="text-green-600 dark:text-green-400">high</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold">
            How SME-Plug Works
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Three actors, one API. Experts build plugins, developers query them,
            end users get better answers.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold">1. Expert Builds Plugin</h3>
              <p className="text-sm text-muted-foreground">
                Upload PDFs, standards, and reference documents. Define decision
                trees for structured reasoning. Set citation rules.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                <Code2 className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold">2. Developer Integrates</h3>
              <p className="text-sm text-muted-foreground">
                One API call or SDK wrapper. Works with LangChain, AutoGPT, or
                any custom agent. No training required.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold">3. User Gets Answers</h3>
              <p className="text-sm text-muted-foreground">
                Cited, decision-tree-backed answers from their existing AI tools.
                Source-linked, auditable, hallucination-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key features grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why SME-Plug?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: RefreshCw,
                title: "Hot-Swappable",
                desc: "Change the plugin slug → instant domain switch. No restart, no retrain, no redeploy.",
              },
              {
                icon: Shield,
                title: "Hallucination Guard",
                desc: "If no source supports a claim, the system refuses to guess. Every answer is evidence-backed.",
              },
              {
                icon: GitBranch,
                title: "Decision Trees",
                desc: "Structured domain reasoning on top of RAG. Not just retrieval — actual expert logic.",
              },
              {
                icon: BookOpen,
                title: "Mandatory Citations",
                desc: "Every claim links to source documents with page and section references. Fully auditable.",
              },
              {
                icon: Code2,
                title: "Framework Agnostic",
                desc: "REST API works with anything. SDK adapters for LangChain, AutoGPT, and more.",
              },
              {
                icon: Zap,
                title: "5-Minute Integration",
                desc: "One API key, one POST request. From zero to expert-grade answers in minutes.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border p-5 transition-shadow hover:shadow-sm"
              >
                <feature.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-1 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to build your expert plugin?</h2>
          <p className="mt-4 text-muted-foreground">
            Create a plugin in minutes. Upload your domain knowledge, define
            reasoning trees, and give any AI agent expert-grade capabilities.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FlaskConical className="h-4 w-4" />
            SME-Plug
          </div>
          <p className="text-sm text-muted-foreground">
            Built for HackX 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
