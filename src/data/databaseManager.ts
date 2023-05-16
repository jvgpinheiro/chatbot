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

export const databaseManager = {
  getAll: () => db,
  has,
  find,
  add,
  update,
  remove,
};

function find(key: string): UserConfig | undefined {
  return db[key];
}

function has(key: string): boolean {
  return !!find(key);
}

function add(key: string, userData: UserBaseConfig): void {
  const storedUser = find(key);
  if (storedUser) {
    throw new Error("DatabaseManager.add: User already stored");
  }
  const { personality_traits, team_id, messages } = userData;
  const dtNow = new Date().toISOString();
  const userConfig: UserConfig = {
    id: key,
    personality_traits,
    team_id,
    messages,
    date_created: dtNow,
    date_updated: dtNow,
  };
  db[key] = userConfig;
  saveData();
}

function update(key: string, userData: UserBaseConfig): void {
  const storedUser = find(key);
  if (!storedUser) {
    throw new Error("DatabaseManager.update: User not found");
  }
  const { personality_traits, team_id, messages } = userData;
  const userConfig: UserConfig = {
    ...storedUser,
    personality_traits,
    team_id,
    messages,
    date_updated: new Date().toISOString(),
  };
  Object.assign(db[key], userConfig);
  saveData();
}

function remove(key: string): void {
  const storedUser = find(key);
  if (!storedUser) {
    throw new Error("DatabaseManager.remove: User not found");
  }
  delete db[key];
  saveData();
}

function saveData(): void {
  fs.writeFileSync("/db.json", JSON.stringify(db, null, 4));
}

export function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { chatbot: true, messages: true },
  });
}

export async function hasUser(userId: string): Promise<boolean> {
  return !!(await getUser(userId));
}

export function getChatbotFromUser(userId: string) {
  return prisma.chatbot.findUnique({
    where: { user_id: userId },
  });
}

export async function hasLinkedChatbot(userId: string): Promise<boolean> {
  return !!(await getChatbotFromUser(userId));
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
  const storedUser = await getUser(userId);
  if (!storedUser) {
    throw Error("addOrUpdateChatbot: User not found");
  }
  let storedChatbot = await getChatbotFromUser(storedUser.id);
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
      team_id: chatbot.team?.id,
      user_id: prismaChatbot.user_id,
    },
  });
}

export async function addMessage(
  userId: string,
  message: Message
): Promise<PrismaMessage> {
  const storedUser = await getUser(userId);
  if (!storedUser) {
    throw Error("addOrUpdateChatbot: User not found");
  }
  return createMessage(storedUser, message);
}

function createMessage(
  prismaUser: PrismaUser,
  message: Message
): Promise<PrismaMessage> {
  return prisma.message.create({
    data: {
      is_sent: message.type === "sent",
      content: message.content,
      user: { connect: { id: prismaUser.id } },
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
