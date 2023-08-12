import initialDB from "./db.json";
import fs from "fs";
import prisma from "../../lib/prisma";
import Chatbot from "@/entities/chatbot";
import {
  User as PrismaUser,
  Chatbot as PrismaChatbot,
  Message as PrismaMessage,
} from "@prisma/client";

export type Message = { type: "sent" | "received"; content: string };
export type UserBaseConfig = {
  personality_traits: Array<string>;
  team_id: string;
  messages: Array<Message>;
};
export type UserConfig = UserBaseConfig & {
  id: string;
  date_created: string;
  date_updated: string;
};
type DataBase = {
  [key: string]: UserConfig;
};
const db: DataBase = initialDB;

export function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { chatbot: true, messages: true },
  });
}

export async function hasUser(userId: string): Promise<boolean> {
  try {
    const user = await getUser(userId);
    return !!user;
  } catch (err) {
    return false;
  }
}

export function getChatbotFromUser(userId: string) {
  return prisma.chatbot.findUnique({
    where: { user_id: userId },
  });
}

export async function hasLinkedChatbot(userId: string): Promise<boolean> {
  try {
    const chatbot = await getChatbotFromUser(userId);
    return !!chatbot;
  } catch (err) {
    return false;
  }
}

export function getMessagesFromUser(userId: string) {
  return prisma.message.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
  });
}

export async function hasLinkedMessages(userId: string): Promise<boolean> {
  return !!(await getMessagesFromUser(userId)).length;
}

export function addUser(userId: string): Promise<PrismaUser> {
  return prisma.user.create({
    data: {
      id: userId,
    },
  });
}

export async function addOrUpdateChatbot(
  userId: string,
  chatbot: Chatbot
): Promise<PrismaChatbot> {
  const userExists = await hasUser(userId);
  const storedUser = userExists
    ? (await getUser(userId))!
    : await addUser(userId);
  const storedChatbot = await getChatbotFromUser(storedUser.id);
  return storedChatbot
    ? updateChatbot(storedChatbot, chatbot)
    : createChatbot(storedUser, chatbot);
}

function createChatbot(
  prismaUser: PrismaUser,
  chatbot: Chatbot
): Promise<PrismaChatbot> {
  return prisma.chatbot.create({
    data: {
      personality_traits: chatbot.personality.toTraitIdList(),
      team_id: chatbot.team?.id,
      user: { connect: { id: prismaUser.id } },
    },
  });
}

function updateChatbot(
  prismaChatbot: PrismaChatbot,
  chatbot: Chatbot
): Promise<PrismaChatbot> {
  return prisma.chatbot.update({
    where: {
      id: prismaChatbot.id,
    },
    data: {
      personality_traits: chatbot.personality.toTraitIdList(),
      team_id: chatbot.team?.id ?? null,
      user_id: prismaChatbot.user_id,
    },
  });
}

export async function addMessage(userId: string, message: Message) {
  return createMessage(userId, message);
}

function createMessage(userId: string, message: Message) {
  return prisma.message.create({
    data: {
      is_sent: message.type === "sent",
      content: message.content,
      user: { connect: { id: userId } },
    },
  });
}

export function deleteMessagesFromUser(
  userId: string
): Promise<{ count: number }> {
  return prisma.message.deleteMany({
    where: {
      user_id: userId,
    },
  });
}
