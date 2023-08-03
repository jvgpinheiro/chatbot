import initSocketServer from "@/services/Socket/initSocketServer";
import sendSocketMessageToFront from "@/services/Socket/sendSocketMessageToFront";
import { PostMessagesContent } from "@/types/WebSocketMessageTypes";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

const serverVersion = "1.0.0";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await handleGET(req, res);
  } else if (req.method === "POST") {
    await handlePOST(req, res);
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    return res.status(500).json("Impossible to stablish connection");
  }
  initSocketServer(res.socket, serverVersion);
  res.status(200).json("Connected");
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const hasValidProcKey =
    !!req.cookies &&
    //@ts-ignore
    req.cookies.procKey === "SAFKaosfpoasmEISm43M29J9832JRMFfsAS";
  if (!hasValidProcKey) {
    return res.status(403).json("No access");
  }
  if (!res.socket) {
    return res.status(500).json("Impossible to send message");
  }
  const body =
    typeof req.body === "string" ? await JSON.parse(req.body) : req.body;
  const notifiedConnections = sendSocketMessageToFront(res.socket, body);
  if (typeof notifiedConnections === "undefined") {
    return res.status(400).json("Invalid message");
  }
  return res.status(200).json(`${notifiedConnections} connections notified`);
}
