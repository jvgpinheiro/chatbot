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
      },
    });

    // Parse the request body from the POST
    console.log(`${new Date()} WHATS WEBHOOK AND CHANGES PUTTIN DO DDB`);
    console.log(body);
    console.log(JSON.stringify(body));
    return new Response("Teste", { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 400 });
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
