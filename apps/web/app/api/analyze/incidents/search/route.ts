import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma"; // adjust path if needed

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text: string = body.text;
  const topK: number = body.topK ?? 3;

  if (!text) {
    return NextResponse.json(
      { error: "Missing 'text' in body" },
      { status: 400 }
    );
  }

  // Call your FastAPI embedding service
  let embedding: number[];
  try {
    const res = await axios.post(
      "http://localhost:8000/embed",
      { text },
      { headers: { "Content-Type": "application/json" } }
    );
    embedding = res.data.embedding;
  } catch (err) {
    console.error("Embedding request failed:", err);
    return NextResponse.json(
      { error: "Embedding request failed" },
      { status: 500 }
    );
  }

  const vectorString = `[${embedding.join(",")}]`;

  try {
    const rows: any = await prisma.$queryRawUnsafe(
      `
      SELECT id, content, 1 - (embedding <=> CAST('${vectorString}' AS VECTOR)) AS similarity
      FROM logs
      ORDER BY similarity DESC
      LIMIT ?
      `,
      topK
    );
    const safeRows = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? Number(value) : value,
        ])
      )
    );

    return NextResponse.json({ results: safeRows });

    // return NextResponse.json({ results: rows });
  } catch (err) {
    console.error("Vector search failed:", err);
    return NextResponse.json(
      { error: "Vector search failed" },
      { status: 500 }
    );
  }
}
