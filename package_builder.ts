import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import fs from "fs";
import dotenv from "dotenv";
import { join } from "path";

const chunkedDataDir = "chunked_data";
const namedEntities = "named_entities.txt";

dotenv.config();

const ingest = async () => {
  const loader = new DirectoryLoader(chunkedDataDir, {
    ".txt": (path) => new TextLoader(path),
  });

  const docs = await loader.load();

  console.log("Total docs:", docs.length);
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  vectorStore.save(join("packages", packageName, "data.hnsw"));
};

const packageName = process.argv[2];

console.log("Building package:", packageName);

console.log("Copying data files...");
fs.mkdirSync(join("packages", packageName), { recursive: true });
fs.copyFileSync(namedEntities, join("packages", packageName, namedEntities));

console.log("Creating vector store...");
ingest()
  .then(() => {
    console.log(
      "Created package:",
      packageName,
      `successfully! (${join("packages", packageName)})`
    );
  })
  .catch(console.error);
