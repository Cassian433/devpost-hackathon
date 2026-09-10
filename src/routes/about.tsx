import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Spatia works" },
      {
        name: "description",
        content:
          "The engineering behind Spatia: a React Three Fiber rendering pipeline, viewpoint telemetry, and a server-side AI tutor grounded in per-structure reference data.",
      },
      { property: "og:title", content: "How Spatia works" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: About,
});

const layers = [
  {
    title: "Rendering",
    points: [
      "React Three Fiber over WebGL2. One shadow-casting directional light plus a small light-former environment, no external HDR downloads.",
      "Models are procedural: Catmull-Rom tube geometry for vessels and Gothic ribs, physical materials with clearcoat and sheen for tissue.",
      "Pixel ratio capped at 2 and a single 2048px shadow map keep every module inside a laptop-GPU budget.",
    ],
  },
  {
    title: "Spatial context",
    points: [
      "A tracker samples the camera a few times a second and derives distance, orbit azimuth and elevation, emitting only on meaningful change.",
      "Each labelled structure carries a curated dataset: category, summary and key facts. Picking one resolves to that record.",
      'Telemetry is translated to plain language ("rear, from above, medium range") before it reaches the model, so the tutor can reason about it.',
    ],
  },
  {
    title: "Tutoring",
    points: [
      "A single server function owns the model call. The API key never reaches the browser.",
      "The prompt carries the module's teaching brief, the full structure inventory, the selected structure's facts and the viewpoint description.",
      "With no key configured, the same panel shows the structure's reference notes instead of failing, so the studio always works.",
    ],
  },
];

const team = [
  { name: "Ayush Kumar", role: "3D scenes and interaction" },
  { name: "Harsh Pratap", role: "AI context pipeline and application architecture" },
  { name: "Sarthak", role: "Platform, tutor features, release" },
];

function About() {
  return (
    <main>
      <SiteNav />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">Three layers, one loop</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Spatia is deliberately lightweight: no native app, no headset, no asset pipeline.
          Everything runs in a browser tab, which is what makes it usable in a classroom of mixed
          devices while still being genuinely spatial.
        </p>

        <div className="mt-14 space-y-12">
          {layers.map((l, i) => (
            <section key={l.title} className="grid gap-4 md:grid-cols-[120px_1fr]">
              <div>
                <span className="font-display text-3xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1 text-2xl">{l.title}</h2>
              </div>
              <ul className="space-y-3 md:pt-2">
                {l.points.map((p) => (
                  <li
                    key={p}
                    className="hairline pt-3 text-sm leading-relaxed text-muted-foreground first:border-0 first:pt-0"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="hairline mt-16 pt-10">
          <p className="eyebrow">Team</p>
          <ul className="mt-4 grid gap-6 sm:grid-cols-3">
            {team.map((m) => (
              <li key={m.name}>
                <p className="font-display text-xl">{m.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14">
          <Link
            to="/explore/$sceneId"
            params={{ sceneId: "cathedral" }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Open the cathedral module <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}
