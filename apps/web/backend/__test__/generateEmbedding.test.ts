import { config } from "dotenv";
config(); // Load .env variables

import { getEmbedding } from "../src/routes/generateEmbeddings"; // Adjust path if needed

describe("getEmbedding", () => {
  it("should return a vector embedding for the input text", async () => {
    const text = "Fix missing await in log ingestion";
    const embedding = await getEmbedding(text);

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe("number");
    expect(embedding.length).toBeLessThanOrEqual(1024); // optional
  });
});
