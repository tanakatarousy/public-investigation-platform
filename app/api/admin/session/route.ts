import { createAdminSessionCookie, isSameOriginRequest, verifyAdminPassword } from "../../../server/admin-auth";

function redirect(location: string, cookie?: string) {
  const headers = new Headers({ "cache-control": "private, no-store", location });
  if (cookie) headers.set("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "invalid origin" }, { status: 403 });
  try {
    const form = await request.formData();
    const password = form.get("password");
    if (typeof password !== "string" || !(await verifyAdminPassword(password))) return redirect("/admin?error=invalid");
    const cookie = await createAdminSessionCookie();
    return cookie ? redirect("/admin", cookie) : redirect("/admin?error=setup");
  } catch {
    return redirect("/admin?error=invalid");
  }
}
