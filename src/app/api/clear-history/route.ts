import { databaseManager } from "@/data/databaseManager";

type RequestBody = { id: string };
export type ResponseBody = {};

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    if (!isValidRequestBody(body)) {
      return new Response("Invalid data: The request must contain a bot id", {
        status: 400,
      });
    }
    return answerRequest(body);
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function isValidRequestBody(body: any): boolean {
  return typeof body === "object" && body.id;
}

function answerRequest(body: RequestBody): Response {
  const { error } = updateBotMessages(body.id);
  if (error) {
    return new Response(error, { status: 400 });
  }
  const storedData = databaseManager.find(body.id);
  if (!storedData) {
    return new Response("Error while updating the bot", { status: 500 });
  }
  return new Response("History cleared with success", { status: 200 });
}

function updateBotMessages(id: string): { success: boolean; error?: string } {
  const storedData = databaseManager.find(id);
  if (!storedData) {
    return { success: false, error: "Invalid id. Bot not found" };
  }
  databaseManager.update(id, { ...storedData, messages: [] });
  return { success: true };
}
