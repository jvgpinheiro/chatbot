import { getInstance } from "@/server/stores/instances";

type RequestBody = { id: string; message: string };

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    if (!isValidRequestBody(body)) {
      return new Response(
        "Invalid data: The request must contain an id and a message",
        { status: 400 }
      );
    }
    const instance = getInstance(body.id);
    if (!instance) {
      return new Response("Invalid data: Bot not found", { status: 400 });
    }
    return new Response(
      `Send to OpenAI API: ${instance.bot.makePrompt(body.message)}`
    );
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function isValidRequestBody(body: any): boolean {
  return typeof body === "object" && body.id && body.message;
}
