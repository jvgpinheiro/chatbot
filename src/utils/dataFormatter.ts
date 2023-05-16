import { Message, UserConfig } from "@/data/databaseManager";
import {
  Chatbot as PrismaChatbot,
  Message as PrismaMessage,
  User as PrismaUser,
} from "@prisma/client";

export function formatPrismaData(
  prismaUser: PrismaUser,
  prismaChatbot: PrismaChatbot,
  prismaMessages: Array<PrismaMessage>
): UserConfig {
  const personality_traits = prismaChatbot.personality_traits.map((trait) =>
    trait.toString()
  );
  const messages = prismaMessages.map(
    ({ content, is_sent }) =>
      ({
        content,
        type: is_sent ? "sent" : "received",
      } as Message)
  );

  return {
    id: prismaUser.id,
    date_created: prismaUser.created_at.toISOString(),
    date_updated: prismaUser.updated_at.toISOString(),
    messages,
    personality_traits: personality_traits,
    team_id: prismaChatbot.team_id ?? "",
  };
}
