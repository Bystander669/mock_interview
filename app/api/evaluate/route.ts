import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    const prompt = `
You are an expert interviewer and evaluator.

Evaluate the following interview answer carefully and provide a structured JSON response.

Question: "${question}"
Answer: "${answer}"

Instructions:
- Provide a "score" from 3 to 10.
- List "strengths" as an array of key points, also state if there is none.
- List "improvements" as an array of actionable suggestions.
- Give a "suggestedAnswer" that demonstrates a strong, concise, and clear response.

Respond ONLY in JSON format, exactly like this:
{
  "score": number,
  "strengths": ["", ""],
  "improvements": ["", ""],
  "suggestedAnswer": ""
}
`;

    const result = await generateText({
      model: mistral("mistral-small-latest"),
      prompt,
    });

    // Try to safely extract JSON
    let evaluation;
    try {
      const text = result.text.trim();
      // Extract the JSON part if AI returns extra text
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);

      evaluation = JSON.parse(jsonString);

      // Ensure all fields exist
      evaluation = {
        score: evaluation.score ?? 0,
        strengths: Array.isArray(evaluation.strengths)
          ? evaluation.strengths
          : [],
        improvements: Array.isArray(evaluation.improvements)
          ? evaluation.improvements
          : [],
        suggestedAnswer: evaluation.suggestedAnswer ?? "",
      };
    } catch (err) {
      return NextResponse.json(
        { error: "AI response is not valid JSON", raw: result.text },
        { status: 500 },
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: errorMessage },
      { status: 500 },
    );
  }
}
