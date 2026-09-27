import type { DesignBrief } from "./orders";

const ANTHROPIC_MODEL = "claude-sonnet-5";

type BriefInput = {
  description: string;
  category?: string;
  dimensions?: string;
  material?: string;
  budget?: string;
};

const SYSTEM_PROMPT = `You are a furniture design assistant for a custom-furniture dropshipping company that works with manufacturing partners in Vietnam.
A customer will describe a piece of furniture they want, in their own words. Turn that into a structured design brief a manufacturer could quote from.
Respond ONLY with JSON matching this exact shape, no prose, no markdown fences:
{
  "summary": string (one or two sentences restating the request clearly),
  "category": string (e.g. "sofa", "dining table", "bed frame", "storage"),
  "suggestedMaterials": string[] (2-5 concrete materials/finishes),
  "estimatedDimensions": string (a reasonable estimate, noting it's approximate if the customer didn't specify),
  "style": string (e.g. "mid-century modern", "Scandinavian minimalist"),
  "complexity": "simple" | "moderate" | "complex",
  "clarifyingQuestions": string[] (1-4 questions to ask the customer to firm up the spec before sending to a manufacturer)
}`;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateDesignBrief(
  input: BriefInput
): Promise<DesignBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const userPrompt = [
    `Customer description: ${input.description}`,
    input.category ? `Stated category: ${input.category}` : null,
    input.dimensions ? `Stated dimensions: ${input.dimensions}` : null,
    input.material ? `Stated material preference: ${input.material}` : null,
    input.budget ? `Stated budget: ${input.budget}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === "text"
  );
  if (!textBlock?.text) {
    throw new Error("No text content returned from Anthropic API");
  }

  try {
    return JSON.parse(textBlock.text) as DesignBrief;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}
