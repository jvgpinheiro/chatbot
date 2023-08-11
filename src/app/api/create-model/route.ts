import url from "url";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";

export type ResponseBody = {};

export async function GET(request: Request) {
  try {
    const parsedUrl = url.parse(request.url, true);
    const json = await buildResponseData();
    return new Response(JSON.stringify(json), { status: 200 });
  } catch (err) {
    return new Response("Unknown error", { status: 500 });
  }
}

async function buildResponseData(): Promise<ResponseBody> {
  const config = new Configuration({
    apiKey: process.env.OPEN_AI,
  });
  const openai = new OpenAIApi(config);
  const filePath = path.join(
    __dirname,
    "../../../../../src/models/model.jsonl"
  );
  const stream = fs.createReadStream(filePath);
  // const file: File = {...buffer, lastModified: Date.now(), size: buffer.length, name}
  const uploadResponse = await openai.createFile(stream as any, "fine-tune");
  return uploadResponse as any;
}
