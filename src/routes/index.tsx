import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { lazy, Suspense } from "react";

import { SiteNav } from "@/components/SiteNav";
import { scenes } from "@/lib/scenes";

const ScenePreview = lazy(() =>
  import("@/components/scene/ScenePreview").then((m) => ({ default: m.ScenePreview })),
);

export const Route = createFileRoute("/")({
  ssr: false,
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
    n: "01",
    title: "Walk around it",
    body: "Every module is a real-time 3D scene. Orbit, zoom, and pick any labelled structure.",
  },
  {
    n: "02",
    title: "The tutor sees your angle",
    body: "Your camera position, distance and selection travel with every question, so answers describe what is actually in front of you.",
  },
  {
    n: "03",
    title: "Let it lead, or test yourself",
    body: "Start a guided tour and the tutor flies the camera stop by stop. Or take a quiz and answer by clicking the model itself.",
  },
];

function Landing() {
  const structures = scenes.reduce((n, s) => n + s.hotspots.length, 0);
  const subjects = new Set(scenes.map((s) => s.subject)).size;

  return (
    <main>
      <SiteNav />

      {/* Hero */}
      <section className="relative border-b border-border">
        <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-[1.05fr_1fr] md:py-20">
          <div>
            <p className="eyebrow animate-reveal">A spatial learning atlas</p>
            <h1
              style={{ animationDelay: "60ms" }}
              className="animate-reveal mt-5 text-5xl leading-[1.02] md:text-6xl lg:text-7xl"
            >
              Some subjects are three-dimensional.{" "}
              <span className="text-sheen">Stop learning them flat.</span>
            </h1>
            <p
              style={{ animationDelay: "140ms" }}
              className="animate-reveal mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Spatia renders the heart, a caffeine molecule, a Gothic vault and more as interactive
              3D scenes, paired with an AI tutor that knows where you are standing. Click a
              structure and it is explained from your angle, in relation to what surrounds it.
            </p>
            <div
              style={{ animationDelay: "220ms" }}
              className="animate-reveal mt-9 flex flex-wrap items-center gap-5"
            >
              <Link
                to="/explore/$sceneId"
                params={{ sceneId: "cardiac" }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open the heart <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                How it works <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <dl
              style={{ animationDelay: "300ms" }}
              className="animate-reveal mt-12 flex flex-wrap gap-x-10 gap-y-3"
            >
              {[
                [scenes.length, "modules"],
                [subjects, "subjects"],
                [structures, "labelled structures"],
              ].map(([v, l]) => (
                <div key={String(l)} className="flex items-baseline gap-2">
                  <dt className="font-display text-3xl">{v}</dt>
                  <dd className="label-mono">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure
            style={{ animationDelay: "160ms" }}
            className="animate-reveal chamber relative aspect-[4/5] w-full overflow-hidden md:aspect-[5/6]"
          >
            <Suspense fallback={null}>
              <ScenePreview />
            </Suspense>
            <figcaption className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <span className="label-mono text-ink-foreground/60">Plate 01 · The Human Heart</span>
              <span className="label-mono text-ink-foreground/60">live</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Plates */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <p className="eyebrow">Plates</p>
        <h2 className="mt-2 text-3xl md:text-4xl">
          {scenes.length} modules across {subjects} subjects
        </h2>
        <ol className="mt-10 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene, i) => (
            <li key={scene.id} className="border-b border-r border-border bg-surface">
              <Link
                to="/explore/$sceneId"
                params={{ sceneId: scene.id }}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-surface-raised"
              >
                <div className="flex items-center justify-between">
                  <span className="label-mono">Plate {String(i + 1).padStart(2, "0")}</span>
                  <span className="label-mono">{scene.level}</span>
                </div>
                <h3 className="mt-6 text-2xl leading-tight group-hover:text-primary">
                  {scene.title}
                </h3>
                <p className="mt-1 text-sm italic text-muted-foreground">{scene.tagline}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {scene.description}
                </p>
                <div className="hairline mt-6 flex items-center justify-between pt-3">
                  <span className="label-mono">{scene.subject}</span>
                  <span className="label-mono">{scene.hotspots.length} structures</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="eyebrow">Method</p>
          <h2 className="mt-2 max-w-2xl text-3xl md:text-4xl">
            The tutor is not a chatbot bolted on. It reads the same scene you do.
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="font-display text-4xl text-primary">{s.n}</span>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-display text-base text-foreground">Spatia</span> · Ayush Kumar and
          Harsh Pratap
        </p>
        <Link to="/about" className="hover:text-foreground">
          How it works →
        </Link>
      </footer>
    </main>
  );
}
