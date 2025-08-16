import Replicate from "replicate";
import { config } from "dotenv";
import { Router, Request, Response } from "express";
import { z } from "zod";

config();

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set in environment");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const route = Router();

// Schema for request body: array of nonempty strings
const EmbeddingRequestSchema = z.object({
  sentences: z.array(z.string().min(1)).nonempty(),
});

type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;

// Expected model output: array of embeddings (each is number[])
type Embedding = number[];
type EmbeddingModelOutput = Embedding[];

/**
 * Gets embeddings for the provided sentences via Replicate.
 */
export async function getEmbeddings(
  sentences: string[]
): Promise<EmbeddingModelOutput> {
  console.log("Sentences input:", sentences);
  const output = (await replicate.run(
    "nateraw/bge-large-en-v1.5:9cf9f015a9cb9c61d1a2610659cdac4a4ca222f2d3707a68517b18c198a9add1",
    {
      input: {
        sentences,
      },
    }
  )) as unknown;

  if (!Array.isArray(output) || output.some((o) => !Array.isArray(o))) {
    throw new Error("Unexpected embedding output format");
  }
  console.log(output);

  return output as EmbeddingModelOutput;
}

interface EmbeddingResponse {
  embeddings: EmbeddingModelOutput;
}

route.get(
  "/embed",
  async (
    req: Request<{}, EmbeddingResponse | { error: string; detail?: string }>,
    res: Response<EmbeddingResponse | { error: string; detail?: string }>
  ) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

      if (!q) {
        return res.status(400).json({
          error:
            "Query parameter 'q' is required and must be a non-empty string",
        });
      }

      const embeddings = await getEmbeddings([q]);
      res.json({ embeddings });
    } catch (err: any) {
      console.error("Embedding error:", err);
      res.status(500).json({
        error: "Failed to get embedding",
        detail: err?.message ?? String(err),
      });
    }
  }
);

export default route;
// route.post(
//   "/embed",
//   // expecting JSON body; ensure in parent app you have: app.use(express.json())
//   async (
//     req: Request,
//     res: Response<EmbeddingResponse | { error: string; detail?: string }>
//   ) => {
//     try {
//       const parseResult = EmbeddingRequestSchema.safeParse(req.body);
//       let sentences: string[];

//       if (parseResult.success) {
//         sentences = parseResult.data.sentences;
//       } else {
//         // fallback default if validation fails
//         sentences = [
//           "the happy cat",
//           "the quick brown fox jumps over the lazy dog",
//           "lorem ipsum dolor sit amet",
//           "this is a test",
//         ];
//       }

//       const embeddings = await getEmbeddings(sentences);
//       res.json({ embeddings });
//     } catch (err: any) {
//       console.error("Embedding error:", err);
//       res.status(500).json({
//         error: "Failed to get embedding",
//         detail: err?.message ?? String(err),
//       });
//     }
//   }
// );
