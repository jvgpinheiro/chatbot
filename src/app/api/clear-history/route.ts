import { deleteMessagesFromUser, getUser } from "@/data/databaseManager";

export type RequestBody = { id: string };
export type ResponseBody = string;

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

async function answerRequest(body: RequestBody): Promise<Response> {
  try {
    const id = body.id;
    const user = await getUser(id);
    if (!user) {
      return new Response("Invalid id. Bot not found", { status: 400 });
    }
    await deleteMessagesFromUser(id);
    return new Response("History cleared with success", { status: 200 });
  } catch (err) {
    return new Response("Database error", { status: 500 });
  }
}
