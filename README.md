# SPATIA — learn 3D subjects in 3D

Textbooks flatten things that are inherently spatial. A heart, a molecule, a Gothic vault, a
binary tree: you understand them by walking around them, not by staring at a diagram.

SPATIA renders interactive 3D learning modules in the browser and pairs each one with an AI
tutor that knows **where you are standing**. Click any labelled structure and the tutor
explains it in the context of your current camera angle and distance, relating it to the
structures around it. Ask a follow-up and it answers from the same viewpoint.

## Modules

| Module | Subject |
| --- | --- |
| The Human Heart | Anatomy & Physiology |
| Caffeine, C₈H₁₀N₄O₂ | Molecular Chemistry |
| Gothic Cathedral Bay | Architectural History |
| Orbital Mechanics | Astronomy |
| Tectonic Boundaries | Earth Science |
| Mechanical Gear Train | Mechanical Engineering |
| Binary Search Tree | Computer Science |
| DNA Double Helix | Molecular Biology |
| Wave Interference | Physics |
| Ionic Crystal Lattice | Chemistry |

Each module is a procedurally built Three.js scene with hand-placed hotspots. Every hotspot
carries a short summary and a set of reference facts that ground the tutor's answers.

## How the tutor works

1. The viewer samples the camera a few times a second: distance, azimuth, elevation.
2. When you click a hotspot or ask a question, the app sends the module id, the selected
   hotspot, the live viewpoint, and the last few turns of conversation to a server function.
3. The server builds a system prompt from the module's teaching context, the hotspot's
   reference facts, and a plain-English description of your viewpoint ("camera at the rear,
   viewing from above, medium range"), then streams the answer back.

The model is told to ground every explanation in what you are literally looking at and to
never contradict the reference facts.

## Running it locally

Requires Node 22+.

```sh
git clone https://github.com/Cassian433/devpost-hackathon.git spatia
cd spatia
npm install --legacy-peer-deps
cp .env.example .env      # then paste in ONE API key, see below
npm run dev               # http://localhost:3000
```

The 3D scenes work with no key at all. The tutor needs one of:

| Provider | Env var | Get a key |
| --- | --- | --- |
| Anthropic | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| Google Gemini | `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/apikey |

The app auto-detects whichever key is present. Override with `AI_PROVIDER` and `AI_MODEL`
if you want a specific model.

Other scripts:

```sh
npm run typecheck   # tsc --noEmit
npm run build       # production build
npm run start       # serve the production build
```

## Stack

- React 19, TypeScript, Vite
- TanStack Start + Router (file-based routes, server functions)
- React Three Fiber + drei on Three.js
- Vercel AI SDK with Anthropic or Google providers
- Tailwind CSS v4

No hosted backend, no login, no database. One server function, one API key.

## Project layout

```
src/
  lib/scenes.ts            module content: hotspots, facts, tutor context, camera presets
  lib/tutor.functions.ts   the server function that builds the prompt and calls the model
  lib/ai.server.ts         provider selection from env
  components/scene/        one file per 3D model, plus the canvas and hotspot marker
  components/StudioView.tsx  the three-pane studio: index, viewport, tutor
  components/TutorPanel.tsx  chat UI
  routes/                  home (library), about, explore/$sceneId
```

## Team

Ayush Kumar, Harsh Pratap, Sarthak.

Built for the SPEED October AI Challenge on Devpost.
