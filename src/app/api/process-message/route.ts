import { Configuration, OpenAIApi } from "openai";
import { addMessage, getChatbotFromUser } from "@/data/databaseManager";
import Personality from "@/entities/personality";
import { getTeamByID } from "@/entities/teams";
import Chatbot from "@/entities/chatbot";

export type RequestBody = { id: string; message: string };
export type ResponseBody = string;

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
  addMessage(body.id, { type: "sent", content: body.message });
  const bot = await buildBot(body);
  const answer = await requestPromptToOpenAI(bot.makePrompt(body.message));
  addMessage(body.id, { type: "received", content: answer });
  return new Response(answer);
}

async function buildBot(body: RequestBody): Promise<Chatbot> {
  const storedChatbot = await getChatbotFromUser(body.id);
  if (!storedChatbot) {
    throw new Error("process-message: No bot found");
  }
  const { personality_traits, team_id } = storedChatbot;
  const personality = Personality.fromTraitsList(
    personality_traits.map((trait) => +trait)
  );
  const team = team_id ? getTeamByID(team_id) : undefined;
  return new Chatbot({ personality, team });
}

async function requestPromptToOpenAI(prompt: string): Promise<ResponseBody> {
  const config = new Configuration({
    apiKey: process.env.OPEN_AI,
  });
  const openai = new OpenAIApi(config);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 2048,
    temperature: 0.3,
  });
  return response.data.choices[0].text ?? "No response from API";
}
