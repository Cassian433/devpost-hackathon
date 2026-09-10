import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { getModel } from "./ai.server";
import { getScene, type SceneModule } from "./scenes";

const QuizOutput = z.object({
  questions: z.array(
    z.object({
      prompt: z.string(),
      answerHotspotId: z.string(),
      explanation: z.string(),
    }),
  ),
});

export type QuizQuestion = {
  id: string;
  prompt: string;
  answerHotspotId: string;
  explanation: string;
};

export type QuizSet = { questions: QuizQuestion[]; offline: boolean };

function referenceQuiz(scene: SceneModule, count: number): QuizSet {
  return {
    questions: scene.hotspots.slice(0, count).map((hotspot, i) => {
      const fact = hotspot.facts[i % hotspot.facts.length] ?? hotspot.summary;
      return {
        id: `q${i + 1}`,
        prompt: `Click the structure described by: "${fact}"`,
        answerHotspotId: hotspot.id,
        explanation: hotspot.summary,
      };
    }),
    offline: true,
  };
}

function isNotConfigured(error: unknown) {
  return error instanceof Error && error.message.startsWith("AI tutor is not configured");
}

export const buildQuiz = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        sceneId: z.string().min(1),
        count: z.number().int().min(3).max(8).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<QuizSet> => {
    const scene = getScene(data.sceneId);
    if (!scene) throw new Error(`Unknown module: ${data.sceneId}`);

    const count = Math.min(data.count ?? 5, scene.hotspots.length);

    let model;
    try {
      model = getModel();
    } catch (error) {
      if (isNotConfigured(error)) {
        return referenceQuiz(scene, count);
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
      `Rules: write ${count} locate questions, each answered by clicking one structure. Each prompt must NOT contain the answer structure's name or an obvious substring of it. Test spatial or functional understanding, such as position relative to neighbours, what flows where or what carries load, rather than trivia recall. Each answerHotspotId MUST be one of the supplied ids, with distinct answers across questions wherever possible. Write each explanation in 1–2 sentences grounded ONLY in the supplied reference facts. Use plain prose with no markdown, bullet lists or asterisks.`,
    ].join("\n");

    const prompt = `Build ${count} "click the right structure" questions for "${scene.title}".`;

    try {
      const result = await generateText({
        model,
        output: Output.object({ schema: QuizOutput }),
        system,
        prompt,
        temperature: 0.7,
      });

      const hotspots = new Map(scene.hotspots.map((h) => [h.id, h]));
      const seen = new Set<string>();
      const questions: QuizQuestion[] = [];
      for (const question of result.output.questions) {
        const hotspot = hotspots.get(question.answerHotspotId);
        if (
          !hotspot ||
          question.prompt.toLowerCase().includes(hotspot.name.toLowerCase()) ||
          seen.has(hotspot.id)
        )
          continue;
        seen.add(hotspot.id);
        questions.push({
          id: `q${questions.length + 1}`,
          prompt: question.prompt,
          answerHotspotId: hotspot.id,
          explanation: question.explanation,
        });
        if (questions.length === count) break;
      }

      if (questions.length < 3) return referenceQuiz(scene, count);
      return { questions, offline: false };
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
