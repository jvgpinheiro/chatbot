import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import {
  addMessage,
  getChatbotFromUser,
  getMessagesFromUser,
} from "@/data/databaseManager";
import Personality from "@/entities/personality";
import { getTeamByID } from "@/entities/teams";
import Chatbot from "@/entities/chatbot";
import { Message } from "@prisma/client";
import prisma from "../../../../lib/prisma";

type GetArrayType<T extends Array<any>> = T extends Array<infer O> ? O : never;
export type RequestBody = { id: string; message: string };
export type ResponseBody = string;

export async function POST(request: Request) {
  const body = await getBodySafely(request);
  try {
    if (!body || !isValidRequestBody(body)) {
      return new Response(
        "Invalid data: The request must contain an id and a message",
        { status: 400 }
      );
    }
    return await answerRequest(body);
  } catch (err) {
    await prisma.webhookLogs.create({
      data: {
        body: JSON.parse(
          JSON.stringify({
            type: "error-catch",
            err: err instanceof Error ? err.stack : err,
          })
        ),
      },
    });
    if (body) {
      const message =
        "Sorry, I'm unable to provide an answer right now. Please try again or reload the page";
      addMessage(body.id, { type: "received", content: message });
    }
    return new Response("Unknown error", { status: 500 });
  }
}

async function getBodySafely(request: Request): Promise<RequestBody | null> {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}

function isValidRequestBody(body: any): boolean {
  return body && typeof body === "object" && body.id && body.message;
}

async function answerRequest(body: RequestBody): Promise<Response> {
  await addMessage(body.id, { type: "sent", content: body.message });
  const bot = await buildBot(body);
  const message = body.message;
  const allMessages = await getMessagesFromUser(body.id);
  await prisma.webhookLogs.create({
    data: {
      body: JSON.parse(JSON.stringify({ type: "before-openai" })),
    },
  });
  const answer = await requestPromptToOpenAI({ bot, message, allMessages });
  await addMessage(body.id, { type: "received", content: answer });
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

async function requestPromptToOpenAI({
  bot,
  message,
  allMessages,
}: {
  bot: Chatbot;
  message: string;
  allMessages: Array<Message>;
}): Promise<ResponseBody> {
  const prompt = bot.makePrompt(message);
  const botDescription = bot.getDescription().trim().toLowerCase();
  type FormattedMessage = GetArrayType<CreateChatCompletionRequest["messages"]>;
  const messagesSorted = allMessages.sort(
    (a, b) => a.created_at.getTime() - b.created_at.getTime()
  );
  const formattedMessages: Array<FormattedMessage> = messagesSorted.map(
    (message) => {
      const { is_sent, content } = message;
      return {
        role: is_sent ? "user" : "assistant",
        content,
      };
    }
  );
  const config = new Configuration({
    apiKey: process.env.OPEN_AI,
  });
  const openai = new OpenAIApi(config);
  await prisma.webhookLogs.create({
    data: {
      body: JSON.parse(
        JSON.stringify({
          type: "before-request-openai",
          prompt,
        })
      ),
    },
  });
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...formattedMessages.slice(-10),
      {
        role: "system",
        content: `Impersonate a ${botDescription} fan but don't tell the user that you're are impersonating a ${botDescription} fan and answer in the same language as the user.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });
  await prisma.webhookLogs.create({
    data: {
      body: JSON.parse(
        JSON.stringify({
          type: "after-request-openai",
          date: response.data,
        })
      ),
    },
  });
  return response.data.choices[0].message?.content ?? "No response from API";
}
