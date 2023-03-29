import Chatbot from "../chatbot";
import { TraitsEnum } from "../traits";
import { getTeamByID, Team } from "../teams";
import Personality from "../personality";

export type ConfigurableData = {
  personality_traits?: Array<TraitsEnum>;
  team_id?: string;
};

export type Instance = {
  id: string;
  bot: Chatbot;
};
const storedInstances = new Map<string, Instance>();

export function getInstance(id: string): Instance | undefined {
  return storedInstances.get(id);
}

export function getOrCreateInstance(id: string): Instance {
  const instance = getInstance(id) ?? buildInstance(id);
  storedInstances.set(id, instance);
  return instance;
}

function buildInstance(id: string): Instance {
  const defaultPersonality = new Personality({
    goodTraits: [],
    badTraits: [],
    neutralTraits: [],
  });
  const botData = { personality: defaultPersonality };
  return { id, bot: new Chatbot(botData) };
}

export function updateBotConfiguration(
  id: string,
  configurableData: ConfigurableData
): { success: boolean; error?: string } {
  const instance = getInstance(id);
  if (!instance) {
    return { success: false, error: "Invalid id. Bot not found" };
  }
  if (!instance) {
    return {
      success: false,
      error: "Nothing to update. Provide a valid team or personality",
    };
  }

  updateBotTeamOrPersonality(instance, configurableData);
  return { success: true };
}

function updateBotTeamOrPersonality(
  instance: Instance,
  configurableData: ConfigurableData
): void {
  const bot = instance.bot;
  const { personality_traits, team_id } = configurableData;
  const team = team_id ? getTeamByID(team_id) : null;
  const personality = personality_traits
    ? Personality.fromTraitsList(personality_traits)
    : null;
  personality && bot.updatePersonality(personality);
  team && bot.updateTeam(team);
}
