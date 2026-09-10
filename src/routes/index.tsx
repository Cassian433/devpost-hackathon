import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { scenes } from "@/lib/scenes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spatia — learn 3D subjects in 3D" },
      {
        name: "description",
        content:
          "Interactive 3D learning modules with an AI tutor that knows where you are standing. Anatomy, chemistry, architecture, physics and more, in the browser.",
      },
      { property: "og:title", content: "Spatia — learn 3D subjects in 3D" },
      {
        property: "og:description",
        content:
          "Walk around the heart, a molecule, a Gothic vault. Click a structure and a viewpoint-aware AI tutor explains it in place.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    title: "Rotate and zoom",
    body: "Drag to turn the model. Scroll or pinch to get a closer look.",
  },
  {
    title: "Select a structure",
    body: "Choose a labelled part to see what it does and how it connects to the rest.",
  },
  {
    title: "Ask a question",
    body: "The AI tutor gets your selection and viewing angle to help explain what you’re looking at.",
  },
];

function Landing() {
  return (
    <main>
      <SiteNav />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <h1 className="max-w-2xl font-sans text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            A closer look, in 3D.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Explore a heart, a molecule, or a cathedral. Turn the model, pick a part, and ask the
            tutor about what you see.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/explore/$sceneId"
              params={{ sceneId: "cardiac" }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Explore the heart <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <a
              href="#modules"
              className="py-2 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Browse all modules
            </a>
          </div>
        </div>
      </section>

      {/* Module library */}
      <section id="modules" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-10 md:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-sans text-xl font-semibold">Choose a module</h2>
          <p className="text-sm text-muted-foreground">{scenes.length} to explore</p>
        </div>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <li key={scene.id} className="bg-surface">
              <Link
                to="/explore/$sceneId"
                params={{ sceneId: scene.id }}
                className="group flex h-full flex-col p-5 transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <p className="text-xs text-muted-foreground">{scene.subject}</p>
                <h3 className="mt-2 font-sans text-lg font-semibold leading-snug group-hover:text-primary">
                  {scene.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {scene.tagline}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    {scene.level} · {scene.hotspots.length} structures
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 group-hover:text-primary"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
          <h2 className="font-sans text-xl font-semibold">Using the viewer</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.title}>
                <h3 className="font-sans text-sm font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-display text-base text-foreground">Spatia</span> · Ayush Kumar,
          Harsh Pratap, Sarthak
        </p>
        <Link to="/about" className="hover:text-foreground">
          How it works →
        </Link>
      </footer>
    </main>
  );
}
