import personalities, { Personality } from "@/server/personalities";
import { getOrCreateInstance, Instance } from "@/server/stores/instances";
import { Team } from "@/server/teams";
import url from "url";

type ResponseBody = {
  available_traits: Personality;
  current_personality: Personality;
  current_team?: Team;
};

export async function GET(request: Request) {
  try {
    console.log("Create get");
    const parsedUrl = url.parse(request.url, true);
    const id = parsedUrl.query.id;
    if (typeof id !== "string") {
      return new Response("Invalid bot id", { status: 400 });
    }

    const instance = getOrCreateInstance(id);
    const json = buildResponseData(instance);
    return new Response(JSON.stringify(json), { status: 200 });
  } catch (err) {
    return new Response("Unknown error", { status: 400 });
  }
}

function buildResponseData(instance: Instance): ResponseBody {
  const { personality, team } = instance.bot;
  const json: ResponseBody = {
    available_traits: personalities,
    current_personality: personality,
  };
  if (team) {
    json.current_team = team;
  }
  return json;
}
