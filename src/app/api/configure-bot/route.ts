import { databaseManager, UserConfig } from "@/data/databaseManager";
import Personality from "@/server/personality";
import { getTeamByID, Team } from "@/server/teams";

type ConfigurableData = {
  personality_traits?: Array<string>;
  team_id?: string;
};
type RequestBody = { id: string } & ConfigurableData;
export type ResponseBody = {
  personality: Personality;
  team?: Team;
};

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    if (!isValidRequestBody(body)) {
      return new Response(
        "Invalid data: The configuration must contain an id and either a personality or a team",
        { status: 400 }
      );
    }
    return answerRequest(body);
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

function answerRequest(body: RequestBody): Response {
  const { error } = updateBotConfiguration(body.id, body);
  if (error) {
    return new Response(error, { status: 400 });
  }
  const storedData = databaseManager.find(body.id);
  if (!storedData) {
    return new Response("Error while updating the bot", { status: 500 });
  }
  const jsonData = buildSuccessfulResponseData(storedData);
  return new Response(JSON.stringify(jsonData));
}

function updateBotConfiguration(
  id: string,
  configurableData: ConfigurableData
): { success: boolean; error?: string } {
  const storedData = databaseManager.find(id);
  if (!storedData) {
    return { success: false, error: "Invalid id. Bot not found" };
  }
  databaseManager.update(id, { ...storedData, ...configurableData });
  return { success: true };
}

function buildSuccessfulResponseData(storedData: UserConfig): ResponseBody {
  const { personality_traits, team_id } = storedData;
  const personality = Personality.fromTraitsList(
    personality_traits.map((trait) => +trait)
  );
  const team = getTeamByID(team_id);
  return { personality, team };
}
