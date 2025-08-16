import express from "express";
import { getEmbeddings } from "./routes/generateEmbeddings";

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use("/get-embeddings", getEmbeddings);

app.listen(PORT, () => {
  console.log(`port running on ${PORT}`);
});
