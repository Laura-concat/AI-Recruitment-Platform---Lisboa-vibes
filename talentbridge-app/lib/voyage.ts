import { VoyageAIClient } from "voyageai";

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

/** Generate a 1024-dimension embedding using Voyage AI's multilingual model. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: [text],
    model: "voyage-multilingual-2",
  });

  const embedding = response.data?.[0]?.embedding;
  if (!embedding || embedding.length === 0) {
    throw new Error("Voyage AI returned an empty embedding");
  }

  return embedding;
}
