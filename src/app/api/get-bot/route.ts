import teams, { getTeamByID, Team } from "@/entities/teams";
import url from "url";
import Personality from "@/entities/personality";
import {
  addOrUpdateChatbot,
  addUser,
  getChatbotFromUser,
  getMessagesFromUser,
  getUser,
  hasLinkedChatbot,
  hasLinkedMessages,
  hasUser,
  Message,
  UserConfig,
} from "@/data/databaseManager";
import Chatbot from "@/entities/chatbot";
import {
  User as PrismaUser,
  Chatbot as PrismaChatbot,
  Message as PrismaMessage,
} from "@prisma/client";
import { formatPrismaData } from "@/utils/dataFormatter";

export type RequestParams = [["id", string]];
export type ResponseBody = {
  available_traits: Personality;
  current_personality: Personality;
  available_teams: Array<Team>;
  current_team?: Team;
  messages: Array<Message>;
};

export async function GET(request: Request, res: any, r: any) {
  try {
    const parsedUrl = url.parse(request.url, true);
    const id = parsedUrl.query.id;
    if (typeof id !== "string") {
      return new Response("Invalid bot id", { status: 400 });
    }

    const data = await getUserFromDB(id);
    const json = buildResponseData(data);
    return new Response(JSON.stringify(json), { status: 200 });
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

async function getUserFromDB(id: string): Promise<UserConfig> {
  try {
    const prismaUser = await getPrismaUser(id);
    const prismaChatbot = await getPrismaChatbot(id);
    const prismaMessages = await getPrismaMessage(id);
    return formatPrismaData(prismaUser, prismaChatbot, prismaMessages);
  } catch (err) {
    const data = makeDefaultUser(id);
    return data;
  }
}

async function getPrismaUser(userId: string): Promise<PrismaUser> {
  const prismaData = (await hasUser(userId))
    ? await getUser(userId)
    : await addUser(userId);
  if (!prismaData) {
    throw new Error("create-bot: User - Failed to load bot resources");
  }
  return prismaData;
}

async function getPrismaChatbot(userId: string): Promise<PrismaChatbot> {
  const prismaData = (await hasLinkedChatbot(userId))
    ? await getChatbotFromUser(userId)
    : await addOrUpdateChatbot(userId, new Chatbot({}));
  if (!prismaData) {
    throw new Error("create-bot: Chatbot - Failed to load bot resources");
  }
  return prismaData;
}

async function getPrismaMessage(userId: string): Promise<Array<PrismaMessage>> {
  const prismaData = (await hasLinkedMessages(userId))
    ? await getMessagesFromUser(userId)
    : [];
  if (!prismaData) {
    throw new Error("create-bot: User - Failed to load bot resources");
  }
  return prismaData;
}

function makeDefaultUser(key: string): UserConfig {
  const dtNow = new Date().toISOString();
  return {
    id: key,
    team_id: "-1",
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
    available_teams: teams,
    messages: data.messages,
  };
  if (team) {
    json.current_team = team;
  }
  return json;
}
