import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getEssayFeedback(question: string, answer: string) {
  const prompt = `You are a teacher. Rate the following essay answer from 1 (poor) to 10 (excellent).

Question: ${question}

Answer: ${answer}

Respond in this format:
Rating: <number>
Comment: <short explanation>`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const responseText = completion.choices[0].message.content ?? "";

  const ratingMatch = responseText.match(/Rating:\s*(\d+)/i);
  const commentMatch = responseText.match(/Comment:\s*(.+)/i);

  return {
    rating: ratingMatch ? parseInt(ratingMatch[1]) : null,
    comment: commentMatch ? commentMatch[1] : "No feedback.",
  };
}
