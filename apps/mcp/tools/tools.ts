import { incidentsSearchTool } from "./incindentsSearchTool";

const agent = new OpenRouterAgent({
  tools: [incidentsSearchTool],
  llmConfig: {
    model: "deepseek/deepseek-r1-0528:free",
    apiKey: process.env.OPENROUTER_DEEPSEEK_R1,
  },
});
