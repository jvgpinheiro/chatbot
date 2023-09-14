import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import {
  Message as FormattedMessage,
  addMessage,
  getChatbotFromUser,
  getMessagesFromUser,
} from "@/data/databaseManager";
import Personality from "@/entities/personality";
import { getTeamByID } from "@/entities/teams";
import Chatbot from "@/entities/chatbot";
import { Message } from "@prisma/client";
import prisma from "../../../../lib/prisma";

type MessageToOpenAI = GetArrayType<CreateChatCompletionRequest["messages"]>;
type GetArrayType<T extends Array<any>> = T extends Array<infer O> ? O : never;
export type RequestBody = { id: string; message: string };
export type ResponseBody = string;
type PromptRequestArgs = {
  bot: Chatbot;
  message: string;
  allMessages: Array<Message>;
};

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
  const { bot, allMessages } = await interactWithDB(body);
  const message = body.message;
  if (allMessages.length < 3) {
    return new Response("");
  }
  const answer = await requestPromptToOpenAI({ bot, message, allMessages });
  await addMessage(body.id, { type: "received", content: answer });
  return new Response(answer);
}

async function interactWithDB(body: RequestBody) {
  const message: FormattedMessage = {
    type: "sent",
    content: body.message,
  };
  const [_, storedChatbot, allMessages] = await prisma.$transaction([
    prisma.message.create({
      data: {
        is_sent: message.type === "sent",
        content: message.content,
        user: { connect: { id: body.id } },
      },
    }),
    getChatbotFromUser(body.id),
    getMessagesFromUser(body.id),
  ]);
  if (!storedChatbot) {
    throw new Error("process-message: No bot found");
  }
  const { personality_traits, team_id } = storedChatbot;
  const personality = Personality.fromTraitsList(
    personality_traits.map((trait) => +trait)
  );
  const team = team_id ? getTeamByID(team_id) : undefined;
  const bot = new Chatbot({ personality, team });
  return { bot, allMessages };
}

async function requestPromptToOpenAI(
  args: PromptRequestArgs
): Promise<ResponseBody> {
  const start = Date.now();
  const reason = await reasonDetection(args);
  const result = await chatCompletion(args);
  const end = Date.now();
  const timeSpent = `${((end - start) / 1000).toFixed(2)}s`;
  return `${result}\n\n${reason}\n\nTempo: ${timeSpent}`;
}

async function reasonDetection(args: PromptRequestArgs): Promise<string> {
  const { bot, allMessages } = args;
  const userMessages: Array<string> = [];
  const invertedMessages = [...allMessages].reverse();
  for (const message of invertedMessages) {
    if (!message.is_sent) {
      break;
    }
    userMessages.push(message.content);
  }
  const prompt = bot.makeReasonDetectionPrompt(userMessages.reverse());
  const messagesSorted = allMessages.sort(
    (a, b) => a.created_at.getTime() - b.created_at.getTime()
  );
  const formattedMessages: Array<MessageToOpenAI> = messagesSorted.map(
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
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...formattedMessages.slice(-10),
      {
        role: "system",
        content: `Provide the reason for the last couple of unanswered messages from the user`,
      },
      { role: "user", content: prompt },
    ],
  });
  const result =
    response.data.choices[0].message?.content ?? "No response from API";
  return `${result}`;
}

async function chatCompletion(args: PromptRequestArgs): Promise<string> {
  const { bot, message, allMessages } = args;
  const prompt = bot.makePrompt(message);
  const botDescription = bot.getDescription().trim().toLowerCase();
  const messagesSorted = allMessages.sort(
    (a, b) => a.created_at.getTime() - b.created_at.getTime()
  );
  const formattedMessages: Array<MessageToOpenAI> = messagesSorted.map(
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
  const result =
    response.data.choices[0].message?.content ?? "No response from API";
  return `${result}`;
}
