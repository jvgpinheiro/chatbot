import axios from "axios";
import {
  PostMessageData,
  ServerSenderEvents,
} from "../types/WebSocketMessageTypes";

export async function sendSocketMessage<T extends keyof ServerSenderEvents>(
  type: T,
  content: PostMessageData<T>["content"]
) {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? `https://admin.reverde.com.br`
      : `http://localhost:3000`;
  const cookies = { procKey: "SAFKaosfpoasmEISm43M29J9832JRMFfsAS" } as const;
  const cookiesString = Object.keys(cookies).reduce((allCookies, key) => {
    return `${allCookies}${key}=${cookies[key as keyof typeof cookies]};`;
  }, "");
  const axiosConfig = {
    baseURL,
    headers: {
      Cookie: cookiesString,
    },
  };
  await axios.post("/api/socket", { type, content }, axiosConfig);
}
