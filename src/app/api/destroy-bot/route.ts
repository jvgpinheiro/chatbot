import url from "url";

export async function GET(request: Request) {
  const parsedUrl = url.parse(request.url, true);
  return new Response("Destroy bot");
}
