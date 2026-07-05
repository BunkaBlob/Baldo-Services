export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const source = url.searchParams.get("source");

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  const cookieHeader = request.headers.get("Cookie") || "";
  let visitorId = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("visitor_id="))
    ?.split("=")[1];

  if (!visitorId) {
    visitorId = crypto.randomUUID();
  }

  if (source === "instagram" || source === "tiktok") {
    const seenKey = `seen:${source}:${visitorId}`;
    const alreadySeen = await env.VISIT_COUNTER.get(seenKey);

    if (!alreadySeen) {
      const countKey = `count:${source}`;
      const currentCount = parseInt(await env.VISIT_COUNTER.get(countKey), 10) || 0;
      await env.VISIT_COUNTER.put(countKey, String(currentCount + 1));
      await env.VISIT_COUNTER.put(seenKey, "1");
    }
  }

  const instagram = parseInt(await env.VISIT_COUNTER.get("count:instagram"), 10) || 0;
  const tiktok = parseInt(await env.VISIT_COUNTER.get("count:tiktok"), 10) || 0;

  const response = new Response(
    JSON.stringify({ instagram, tiktok }),
    { headers }
  );

  response.headers.append(
    "Set-Cookie",
    `visitor_id=${visitorId}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`
  );

  return response;
}