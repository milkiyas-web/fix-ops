import axios from "axios";
export const incidentsSearchTool = {
    name: "incidents.search",
    description: "Search past incidents from the incident database given a text query and number of results (topK).",
    // parameters changed to input schema for misstype if later this makes problems change it back.
    inputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "Search query text, e.g., 'database outage in May 2025'.",
            },
            topK: {
                type: "number",
                description: "Number of top matching incidents to return. Usually between 3 and 10.",
            },
        },
        required: ["text", "topK"],
    },
    async execute({ text, topK }) {
        try {
            const res = await axios.post("http://localhost:3000/api/incidents/search", { text, topK }, { headers: { "Content-Type": "application/json" } });
            return {
                status: "success",
                results: res.data,
            };
        }
        catch (err) {
            console.error("Error in incidents.search tool:", err);
            return {
                status: "error",
                message: err instanceof Error
                    ? err.message
                    : "Unknown error during incident search",
            };
        }
    },
};
