import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { LLMToolAgent, Tool } from "@/lib/LLMToolAgent";

const incidentsSearchTool: Tool = {
  name: "incidents.search",
  description: "Search past incidents by text query",
  call: async ({ query, topK = 3 }: { query: string; topK?: number }) => {
    const res = await axios.post(
      "http://localhost:3000/api/analyze/incidents/search",
      { text: query, topK },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  },
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const query = body.query;

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const agent = new LLMToolAgent(
    [incidentsSearchTool],
    process.env.OPENROUTER_DEEPSEEK_R1,
    "deepseek/deepseek-r1-0528:free"
  );

  const result = await agent.run(query);
  return NextResponse.json(result);
}
