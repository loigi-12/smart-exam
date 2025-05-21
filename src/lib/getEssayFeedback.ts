import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getEssayFeedback(question: string, answer: string) {
  const prompt = `You are a supportive and constructive teacher assessing a student's essay using this analytical rubric:

  **Scoring Scale:**
  - Excellent (9–10)
  - Good (6–8)
  - Satisfactory (2–5)
  - Needs Improvement (0–1)

  **Rubric Criteria:**
  1. **Idea Explanation**
    - Excellent: Thoroughly explained ideas
    - Good: Ideas explained
    - Satisfactory: Ideas somewhat explained
    - Needs Improvement: Little or no explanation

  2. **Coherency**
    - Excellent: Extremely coherent writing
    - Good: Coherent writing
    - Satisfactory: Somewhat coherent
    - Needs Improvement: Lacks coherency

  3. **Grammar**
    - Excellent: Few errors
    - Good: Some errors
    - Satisfactory: Many errors
    - Needs Improvement: Many errors that hurt understanding

  Please rate the student's overall performance out of 10 by considering all three categories **equally**. Provide a rating between 0 and 10 in most cases, except when the answer is off-topic or unclear.

  **Also give supportive feedback with 1–2 strengths and 1 gentle suggestion for improvement.**

  Question: ${question}

  Answer: ${answer}

  Respond in this format:
  Rating: <number>
  Comment: <encouraging feedback>`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const responseText = completion.choices[0].message.content ?? "";

  const ratingMatch = responseText.match(/Rating:\s*(\d+)/i);
  const commentMatch = responseText.match(/Comment:\s*(.+)/i);

  return {
    rating: ratingMatch ? Math.max(parseInt(ratingMatch[1]), 0) : null, // Enforce minimum score of 0
    comment: commentMatch ? commentMatch[1] : "No feedback.",
  };
}
