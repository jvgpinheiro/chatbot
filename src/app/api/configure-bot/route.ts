import {
  addOrUpdateChatbot,
  getUser,
  UserConfig,
} from "@/data/databaseManager";
import Chatbot from "@/entities/chatbot";
import Personality from "@/entities/personality";
import { getTeamByID, Team } from "@/entities/teams";
import { formatPrismaData } from "@/utils/dataFormatter";
import {
  Chatbot as PrismaChatbot,
  Message as PrismaMessage,
  User as PrismaUser,
} from "@prisma/client";

export type ConfigurableData = {
  personality_traits: Array<string>;
  team_id: string;
};
export type RequestBody = { id: string } & ConfigurableData;
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

async function answerRequest(body: RequestBody): Promise<Response> {
  const prismaChatbot = await updateBot(body);
  const prismaUser = await getUser(body.id);
  if (!prismaUser) {
    throw Error("configure-bot: Error while updating bot");
  }
  return createResponse(prismaUser, prismaChatbot, prismaUser.messages);
}

function updateBot(body: RequestBody): Promise<PrismaChatbot> {
  const traits = body.personality_traits.map((trait) => +trait);
  const chatbot = new Chatbot({
    personality: Personality.fromTraitsList(traits),
    team: getTeamByID(body.team_id),
  });
  return addOrUpdateChatbot(body.id, chatbot);
}

function createResponse(
  prismaUser: PrismaUser,
  prismaChatbot: PrismaChatbot,
  prismaMessage: Array<PrismaMessage>
): Response {
  const userConfig = formatPrismaData(prismaUser, prismaChatbot, prismaMessage);
  const jsonData = buildSuccessfulResponseData(userConfig);
  return new Response(JSON.stringify(jsonData));
}

function buildSuccessfulResponseData(storedData: UserConfig): ResponseBody {
  const { personality_traits, team_id } = storedData;
  const personality = Personality.fromTraitsList(
    personality_traits.map((trait) => +trait)
  );
  const team = getTeamByID(team_id);
  return { personality, team };
}
