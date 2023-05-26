import { MessageSentStatus } from "@prisma/client";
import prisma from "../../../../../lib/prisma";
import url from "url";

type ParamsGET = {
  "hub.mode": string;
  "hub.verify_token": string;
  "hub.challenge": string;
};

export async function POST(
  request: Request,
  response: Response
): Promise<Response> {
  try {
    const body = await request.json();
    await prisma.webhookLogs.create({
      data: {
        body: {
          method: request.method,
          original: body,
        },
        headers: request.headers as any,
      },
    });
    const entries = body.entry;
    const promises = entries.map(async (entry: any) => {
      const id = entry.id;
      const promises = entry.changes.map(async (change: any) => {
        const field = change.field;
        const value = change.value;
        const isStatusUpdate = !!value.statuses;

        if (isStatusUpdate) {
          const data: Omit<MessageSentStatus, "id"> = {
            conversationId: "",
            phone: "",
            customerPhone: "",
            status: "",
          };
          data.phone = value.metadata.display_phone_number;
          value.statuses.forEach((status: any) => {
            data.customerPhone = status.recipient_id;
            data.conversationId = status.id;
            data.status = status.status;
          });
          await prisma.messageSentStatus.create({ data });
        } else {
        }
      });
      await Promise.all(promises);
    });
    await Promise.all(promises);
    return new Response("Teste", { status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      await prisma.errors.create({
        data: { error: err.stack },
      });
    }
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> {
  const verify_token = "TesteToken"; //process.env.VERIFY_TOKEN;
  const { query } = url.parse(request.url, true);
  const {
    "hub.mode": hubMode,
    "hub.challenge": hubChallenge,
    "hub.verify_token": hubToken,
  } = query as ParamsGET;

  if (hubMode && hubToken) {
    if (hubMode === "subscribe" && hubToken === verify_token) {
      return new Response(hubChallenge, { status: 200 });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }
  return new Response("Incomplete", { status: 400 });
}
