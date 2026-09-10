import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import { getModel } from "./ai.server";
import { getScene, type Hotspot, type SceneModule } from "./scenes";

const TutorInput = z.object({
  sceneId: z.string().min(1),
  hotspotId: z.string().optional(),
  question: z.string().max(600).optional(),
  /** Live viewer telemetry so the tutor knows where the student is standing */
  viewpoint: z
    .object({
      position: z.tuple([z.number(), z.number(), z.number()]),
      distance: z.number(),
      azimuth: z.number(),
      polar: z.number(),
    })
    .optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(12)
    .optional(),
});

export type TutorReply = {
  answer: string;
  focus: string;
  viewpointNote: string;
  /** True when no AI key is configured and the answer is the module's own reference notes. */
  offline?: boolean;
};

function describeViewpoint(v: NonNullable<z.infer<typeof TutorInput>["viewpoint"]>) {
  const deg = (r: number) => Math.round((r * 180) / Math.PI);
  const az = ((deg(v.azimuth) % 360) + 360) % 360;
  const side =
    az < 45 || az >= 315 ? "front" : az < 135 ? "right side" : az < 225 ? "rear" : "left side";
  const elevation = deg(v.polar) < 55 ? "above" : deg(v.polar) > 110 ? "below" : "eye level";
  const proximity = v.distance < 4 ? "very close" : v.distance < 9 ? "medium range" : "wide view";
  return `Camera is at the ${side}, viewing from ${elevation}, at ${proximity} (distance ${v.distance.toFixed(1)} units, position ${v.position.map((n) => n.toFixed(1)).join(", ")}).`;
}

/** What the panel shows when there is no API key: the curated notes, not an error. */
function referenceNotes(
  scene: SceneModule,
  hotspot: Hotspot | undefined,
  question: string | undefined,
) {
  if (hotspot) {
    const facts = hotspot.facts.map((f) => f.replace(/\.$/, "")).join(". ");
    return `${hotspot.summary} ${facts}.`;
  }
  if (question) {
    return `Live tutoring is off because no AI key is configured. Select a structure to read its reference notes, or add a key to .env to ask questions.`;
  }
  return `${scene.description} Click any marker to read its reference notes.`;
}

function isNotConfigured(error: unknown) {
  return error instanceof Error && error.message.startsWith("AI tutor is not configured");
}

export const askTutor = createServerFn({ method: "POST" })
  .validator((input: unknown) => TutorInput.parse(input))
  .handler(async ({ data }): Promise<TutorReply> => {
    const scene = getScene(data.sceneId);
    if (!scene) throw new Error(`Unknown module: ${data.sceneId}`);

    const hotspot = data.hotspotId
      ? scene.hotspots.find((h) => h.id === data.hotspotId)
      : undefined;
    const viewpointNote = data.viewpoint
      ? describeViewpoint(data.viewpoint)
      : "Viewpoint unavailable.";
    const focus = hotspot?.name ?? "Free navigation";
    const question = data.question?.trim() || undefined;

    let model;
    try {
      model = getModel();
    } catch (error) {
      if (isNotConfigured(error)) {
        return {
          answer: referenceNotes(scene, hotspot, question),
          focus,
          viewpointNote,
          offline: true,
        };
      }
      throw error;
    }

    const system = [
      `You are SPATIA, a spatial-reasoning AI tutor embedded inside a real-time 3D learning environment.`,
      scene.tutorContext,
      `Module: "${scene.title}" (${scene.subject}).`,
      `Interactive elements the student can select: ${scene.hotspots.map((h) => `${h.name} [${h.category}]`).join("; ")}.`,
      `Live viewer telemetry: ${viewpointNote}`,
      hotspot
        ? `The student has just clicked "${hotspot.name}" (${hotspot.category}). Reference dataset: ${hotspot.summary} Key facts: ${hotspot.facts.join("; ")}.`
        : `No element is currently selected.`,
      `Rules: answer in 90-150 words of plain prose, no markdown headings, no bullet lists, no asterisks. Ground the explanation in what the student is literally looking at from their current angle and distance — mention the spatial relationship to at least one neighbouring structure. Be precise, warm and never invent facts that contradict the reference dataset.`,
    ].join("\n");

    const prompt =
      question ??
      (hotspot
        ? `Explain ${hotspot.name} in the context of the whole model, given where I am standing.`
        : `Orient me: what am I looking at from this viewpoint, and where should I look next?`);

    try {
      const result = streamText({
        model,
        system,
        messages: [
          ...(data.history ?? []).map((m) => ({ role: m.role, content: m.content }) as const),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.6,
      });

      const answer = (await result.text).trim();
      return { answer, focus, viewpointNote };
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
