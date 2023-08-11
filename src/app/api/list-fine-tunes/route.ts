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
  const fineTuneResponse = await openai.retrieveFineTune(
    "ft-MLP8nB07TX97ICDfCllCZ0vb"
  );
  return fineTuneResponse.data as any;
}
