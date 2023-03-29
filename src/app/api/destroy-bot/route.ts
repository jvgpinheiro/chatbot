import url from "url";

export async function GET(request: Request) {
  const parsedUrl = url.parse(request.url, true);
  console.log("Destroy bot: ", parsedUrl.query);
  return new Response("Destroy bot");
}
