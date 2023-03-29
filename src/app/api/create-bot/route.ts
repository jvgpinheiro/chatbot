import { getTeamByID, Team } from "@/server/teams";
import url from "url";
import Personality from "@/server/personality";
import {
  databaseManager,
  Message,
  UserBaseConfig,
  UserConfig,
} from "@/data/databaseManager";
import Chatbot from "@/server/chatbot";

export type ResponseBody = {
  available_traits: Personality;
  current_personality: Personality;
  current_team?: Team;
  messages: Array<Message>;
};

export async function GET(request: Request) {
  try {
    const parsedUrl = url.parse(request.url, true);
    const id = parsedUrl.query.id;
    if (typeof id !== "string") {
      return new Response("Invalid bot id", { status: 400 });
    }

    const data = getUserFromDB(id);
    const json = buildResponseData(data);
    return new Response(JSON.stringify(json), { status: 200 });
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function getUserFromDB(id: string): UserConfig {
  try {
    !databaseManager.has(id) && createBot(id);
    const data = databaseManager.find(id);
    if (!data) {
      throw new Error("create-bot: Failed to load bot resources");
    }
    return data;
  } catch (err) {
    console.error("DB error");
    const data = makeDefaultUser(id);
    return data;
  }
}

function createBot(id: string): void {
  const defaultPersonality = new Personality({
    goodTraits: [],
    badTraits: [],
    neutralTraits: [],
  });
  const bot = new Chatbot({ personality: defaultPersonality });
  const data: UserBaseConfig = {
    team_id: bot.team?.id ?? "",
    messages: [],
    personality_traits: bot.personality
      .toTraitIdList()
      .map((trait) => trait.toString()),
  };
  databaseManager.add(id, data);
}

function makeDefaultUser(key: string): UserConfig {
  const dtNow = new Date().toISOString();
  return {
    id: key,
    team_id: "",
    personality_traits: [],
    messages: [],
    date_created: dtNow,
    date_updated: dtNow,
  };
}

function buildResponseData(data: UserConfig): ResponseBody {
  const personality = Personality.fromTraitsList(
    data.personality_traits.map((trait) => +trait)
  );
  const team = getTeamByID(data.team_id);

  const json: ResponseBody = {
    available_traits: Personality.FULL_PERSONALITY,
    current_personality: personality,
    messages: data.messages,
  };
  if (team) {
    json.current_team = team;
  }
  return json;
}
