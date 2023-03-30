import initialDB from "./db.json";
import fs from "fs";

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
