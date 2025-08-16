import axios from "axios";

export type Tool = {
  name: string;
  description: string;
  call: (args: { query: string; topK?: number }) => Promise<unknown>;
};
export class LLMToolAgent {
  tools: Tool[];
  apiKey: string;
  model: string;

  constructor(tools: Tool[], apiKey: string, model: string) {
    this.tools = tools;
    this.apiKey = apiKey;
    this.model = model;
  }

  async run(query: string) {
    const toolDescriptions = this.tools
      .map((t) => `${t.name}: ${t.description}`)
      .join("\n");

    const prompt = `
You are a FixOps Agent. A new Error log arrived. Your job is to help the user fix the issue using the available tools:
${toolDescriptions}

User query: ${query}

IMPORTANT: Respond **ONLY** with valid JSON in this format:
{
  "tool": "tool_name_if_needed_or_null",
  "args": { ... }
}
`;

    try {
      console.log(JSON.stringify(this.apiKey));
      console.log(this.apiKey.length);
      console.log(this.model);

      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",

        {
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          // stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Strip ```json fences if present
      if (!res.data.choices || res.data.choices.length === 0) {
        console.error("LLM is missing choices:", res.data);
      }
      let content = res.data.choices[0].message.content;

      content = content.replace(/```json|```/g, "").trim();
      console.log(res);
      let json;
      try {
        json = JSON.parse(content);
      } catch {
        return { error: "LLM did not return valid JSON", raw: content };
      }

      if (json.tool && json.args) {
        const tool = this.tools.find((t) => t.name === json.tool);
        if (!tool) return { error: "Tool not found" };
        const result = await tool.call(json.args);
        return { toolResult: result };
      }

      return { message: "No tool needed", raw: json };
    } catch (err: any) {
      console.error("Error calling LLM:", err);
      return { error: "Failed to call LLM", details: err.message };
    }
  }
}
