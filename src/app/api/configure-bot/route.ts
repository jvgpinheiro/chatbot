import {
  ConfigurableData,
  getInstance,
  updateBotConfiguration,
} from "@/server/stores/instances";

type RequestBody = { id: string } & ConfigurableData;

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    if (!isValidRequestBody(body)) {
      return new Response(
        "Invalid data: The configuration must contain an id and either a personality or a team",
        { status: 400 }
      );
    }

    const { error } = updateBotConfiguration(body.id, body);
    if (error) {
      return new Response(error, { status: 400 });
    }
    const instance = getInstance(body.id);
    if (!instance) {
      return new Response("Error while updating the bot", { status: 500 });
    }
    const { personality, team } = instance.bot;
    const jsonData = { personality, team };
    return new Response(JSON.stringify(jsonData));
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function isValidRequestBody(body: any): boolean {
  return (
    typeof body === "object" &&
    body.id &&
    (body.personality_traits || body.team_id)
  );
}
