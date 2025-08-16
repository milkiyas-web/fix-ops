import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { headers } from "next/headers";
import prisma from "../../../lib/prisma";
import { v4 as uuid4 } from "uuid";

async function findSimilarLogs(
  embedding: number[],
  excludeId: string,
  limit = 3
): Promise<Array<{ content: string; similarity: number }>> {
  const vectorString = "[" + embedding.join(",") + "]";
  try {
    const rows: any = await prisma.$queryRawUnsafe(
      `
  SELECT content, 1 - (embedding <=> CAST('${vectorString}' AS VECTOR)) AS similarity
  FROM logs
  WHERE id != ?
  ORDER BY similarity DESC
  LIMIT ?
`,
      excludeId,
      limit
    );

    return rows.map((r: any) => ({
      content: r.content,
      similarity: parseFloat(r.similarity),
    }));
  } catch (err) {
    console.error("similarity search failed: ", err);
    return [];
  }
}

function buildPromt(
  content: string,
  similarLogs: Array<{ content: string; similarity: number }>
  // excludeId: string
) {
  const res = similarLogs
    .map(
      (s, i) =>
        `${i + 1}. ${s.content.trim()} (similarity: ${s.similarity.toFixed(3)})`
    )
    .join("\n");
  return `
     You are a FixOps Agent. A new Error log arrived. as an Agent it is your Job to help the user to fix the issue.
          ======Current Log====
          ${content}
          === Similar Past Logs ===
          This are simillar Past logs the user encountered use them as a starting point.
          ${res}
          Based on this, do the following:
          1. Diagnose the root cause in one sentence.
          2. Suggest a concrete fix (e.g., config diff, YAML change, shell command).
          3. Explain briefly why this fix is appropriate given the history.

          Output strictly in JSON with keys:
          - diagnosis
          - suggested_fix
          - reasoning

          Respond with nothing else (no surrounding explanation, markdown, or prose). Example format:
          {
            "diagnosis": "...",
            "suggested_fix": "...",
            "reasoning": "..."
          };

  `;
}

async function callLLM(prompt: string) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "user",
          content: prompt,
          // stream: true,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_DEEPSEEK_R1}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("ANALYZE BODY RECEIVED:", body);
  // Accept either "filename" or "fileName"
  const filename: string | undefined = body.filename ?? body.fileName;
  const content: string | undefined = body.content;
  if (!filename || !content) {
    console.log("Missing fields:", { filename, content });
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  let embedding: number[];

  try {
    const res = await axios.post(
      "http://localhost:8000/embed",
      { text: content },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );
    embedding = res.data.embedding;
  } catch (error) {
    console.error("Embedding request failed: ", error);
    return NextResponse.json(
      { error: "Embedding request failed" },
      { status: 500 }
    );
  }
  const id = uuid4();
  const db = await prisma.logs.create({
    data: {
      id,
      name: filename,
      content,
    },
  });

  const vectorString = "[" + embedding.join(",") + "]";
  await prisma.$executeRaw`
    UPDATE logs SET embedding = CAST(${vectorString} AS VECTOR) WHERE id = ${id}
  `;
  const similarLogs = await findSimilarLogs(embedding, id);
  const prompt = buildPromt(content, similarLogs);
  const llmResponse = await callLLM(prompt);
  return NextResponse.json({
    db,
    llmResponse,
  });
}
