import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { getModel } from "./ai.server";
import { getScene, type SceneModule } from "./scenes";

const TourOutput = z.object({
  intro: z.string(),
  stops: z.array(
    z.object({
      hotspotId: z.string(),
      narration: z.string(),
      lookFrom: z.enum(["front", "rear", "left", "right", "above"]),
    }),
  ),
});

export type TourStop = {
  hotspotId: string;
  title: string;
  narration: string;
  lookFrom: "front" | "rear" | "left" | "right" | "above";
};

export type TourPlan = {
  intro: string;
  stops: TourStop[];
  offline: boolean;
};

function referenceTour(scene: SceneModule): TourPlan {
  const views: TourStop["lookFrom"][] = ["front", "right", "above", "left", "rear"];
  return {
    intro: scene.description,
    stops: scene.hotspots.slice(0, 8).map((hotspot, i) => {
      const fact = hotspot.facts[0]?.replace(/\.$/, "");
      return {
        hotspotId: hotspot.id,
        title: hotspot.name,
        narration: fact ? `${hotspot.summary} ${fact}.` : hotspot.summary,
        lookFrom: views[i % views.length] ?? "front",
      };
    }),
    offline: true,
  };
}

function isNotConfigured(error: unknown) {
  return error instanceof Error && error.message.startsWith("AI tutor is not configured");
}

export const planTour = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ sceneId: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<TourPlan> => {
    const scene = getScene(data.sceneId);
    if (!scene) throw new Error(`Unknown module: ${data.sceneId}`);

    let model;
    try {
      model = getModel();
    } catch (error) {
      if (isNotConfigured(error)) {
        return referenceTour(scene);
      }
      throw error;
    }

    const system = [
      `You are SPATIA, a spatial-reasoning AI tutor embedded inside a real-time 3D learning environment.`,
      scene.tutorContext,
      `Module: "${scene.title}" (${scene.subject}).`,
      `Reference dataset of interactive hotspots:`,
      ...scene.hotspots.map(
        (h) =>
          `${h.id}: "${h.name}" [${h.category}]. ${h.summary} Key facts: ${h.facts.join("; ")}.`,
      ),
      `Rules: choose a pedagogically ordered route of 4–8 stops, such as following the flow of blood or tracing a load path from top to bottom. Each hotspotId MUST be one of the supplied ids; visit each hotspot at most once. Write a 30–50 word intro and 45–70 words of narration per stop, using plain prose grounded ONLY in the supplied reference facts. Each narration must mention a spatial relationship to a neighbouring structure. No markdown, bullet lists or asterisks. Pick lookFrom as the side that best shows the structure: front, rear, left, right or above.`,
    ].join("\n");

    const prompt = `Plan a guided tour of "${scene.title}" for a student exploring the 3D module.`;

    try {
      const result = await generateText({
        model,
        output: Output.object({ schema: TourOutput }),
        system,
        prompt,
        temperature: 0.5,
      });

      const plan = result.output;
      const hotspots = new Map(scene.hotspots.map((h) => [h.id, h]));
      const seen = new Set<string>();
      const stops: TourStop[] = [];
      for (const stop of plan.stops) {
        const hotspot = hotspots.get(stop.hotspotId);
        if (!hotspot || seen.has(hotspot.id)) continue;
        seen.add(hotspot.id);
        stops.push({
          hotspotId: hotspot.id,
          title: hotspot.name,
          narration: stop.narration,
          lookFrom: stop.lookFrom,
        });
        if (stops.length === 8) break;
      }

      if (stops.length < 3) return referenceTour(scene);
      return { intro: plan.intro, stops, offline: false };
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "statusCode" in error
          ? Number((error as { statusCode?: unknown }).statusCode)
          : undefined;
      if (status === 429)
        throw new Error("The tutor is rate limited right now — try again in a few seconds.");
      if (status === 401 || status === 403)
        throw new Error(
          "The AI API key was rejected. Check ANTHROPIC_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY in .env.",
        );
      throw new Error(error instanceof Error ? error.message : "The tutor could not answer that.");
    }
  });
