import { Configuration, OpenAIApi } from "openai";
import apiKeys from "@/api_keys/api_keys.json";
import { databaseManager, Message, UserConfig } from "@/data/databaseManager";
import Personality from "@/server/personality";
import { getTeamByID } from "@/server/teams";
import Chatbot from "@/server/chatbot";

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
    return await answerRequest(body);
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function isValidRequestBody(body: any): boolean {
  return typeof body === "object" && body.id && body.message;
}

async function answerRequest(body: RequestBody): Promise<Response> {
  const storedData = databaseManager.find(body.id);
  if (!storedData) {
    return new Response("process-message: Bot not found", { status: 400 });
  }

  storeMessage(storedData, { type: "sent", content: body.message });
  const bot = buildBot(storedData);
  const answer = await requestPromptToOpenAI(bot.makePrompt(body.message));
  storeMessage(storedData, { type: "received", content: answer });
  return new Response(answer);
}

function storeMessage(storedData: UserConfig, newMessage: Message): void {
  const messages: Array<Message> = JSON.parse(
    JSON.stringify(storedData.messages)
  );
  messages.push(newMessage);
  databaseManager.update(storedData.id, { ...storedData, messages });
}

function buildBot(storedData: UserConfig): Chatbot {
  const { personality_traits, team_id } = storedData;
  const personality = Personality.fromTraitsList(
    personality_traits.map((trait) => +trait)
  );
  const team = getTeamByID(team_id);
  return new Chatbot({ personality, team });
}

async function requestPromptToOpenAI(prompt: string): Promise<string> {
  const config = new Configuration({
    apiKey: apiKeys.OPEN_AI,
  });
  const openai = new OpenAIApi(config);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 2048,
    temperature: 0.8,
  });
  return response.data.choices[0].text ?? "No response from API";
}
