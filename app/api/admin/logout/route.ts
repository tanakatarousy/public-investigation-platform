import { clearAdminSessionCookie, isSameOriginRequest } from "../../../server/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "invalid origin" }, { status: 403 });
  return new Response(null, {
    status: 303,
    headers: {
      "cache-control": "private, no-store",
      location: "/",
      "set-cookie": clearAdminSessionCookie(),
    },
  });
}
