import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";

export async function POST(req: Request) {
  const { topic, tone, count } = await req.json();

  const prompt = `
You are an interviewer.

Generate ${count} interview questions only, make them generic and do not assume the interviewee has prior experience.

Topic: ${topic}
Tone: ${tone}

Rules:
- Return exactly ${count} questions
- No explanations
- Respond ONLY in JSON format as:
{
  "questions": ["Question 1", "Question 2", "..."]
}
`;

  const result = await generateText({
    model: mistral("mistral-small-latest"),
    prompt,
  });

  // Safely parse JSON
  let questions: string[] = [];
  try {
    const jsonStart = result.text.indexOf("{");
    const jsonEnd = result.text.lastIndexOf("}") + 1;
    const jsonString = result.text.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);
    questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (err) {
    console.error("Failed to parse AI response:", err);
  }

  return Response.json({ questions });
}
