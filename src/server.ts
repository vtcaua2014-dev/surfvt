import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function redirect(location: string, cookies: string[] = []) {
  const headers = new Headers({ location });
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(null, { status: 302, headers });
}

function cookie(request: Request, name: string) {
  return request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

function cookieHeader(request: Request, name: string, value: string, maxAge: number) {
  const configuredOrigin = process.env.SURFVT14_PUBLIC_ORIGIN?.trim();
  const secure = configuredOrigin
    ? new URL(configuredOrigin).protocol === "https:"
    : new URL(request.url).protocol === "https:";
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function callbackUrl(request: Request) {
  const origin = new URL(process.env.SURFVT14_PUBLIC_ORIGIN?.trim() || request.url);
  if (origin.hostname !== "localhost" && origin.hostname !== "127.0.0.1") origin.protocol = "https:";
  return new URL("/auth/discord/callback", origin).toString();
}

async function handleDiscord(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (url.pathname === "/auth/discord/start") {
    if (!clientId || !clientSecret) return json({ error: "Discord OAuth2 is not configured" }, 503);
    const state = crypto.randomUUID();
    const callback = callbackUrl(request);
    const authorize = new URL("https://discord.com/oauth2/authorize");
    authorize.search = new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: callback, scope: "identify email", state }).toString();
    return redirect(authorize.toString(), [cookieHeader(request, "surfvt14-oauth-state", state, 600)]);
  }

  if (url.pathname === "/auth/discord/callback") {
    if (!clientId || !clientSecret) return json({ error: "Discord OAuth2 is not configured" }, 503);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state || state !== cookie(request, "surfvt14-oauth-state")) return redirect("/?auth=discord-state-error");
    const callback = callbackUrl(request);
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: callback }) });
    if (!tokenResponse.ok) return redirect("/?auth=discord-token-error");
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) return redirect("/?auth=discord-token-error");
    const userResponse = await fetch("https://discord.com/api/users/@me", { headers: { authorization: `Bearer ${token.access_token}` } });
    if (!userResponse.ok) return redirect("/?auth=discord-user-error");
    const user = await userResponse.json() as { id?: string; username?: string; global_name?: string; avatar?: string | null };
    const profile = { provider: "discord", id: user.id, name: user.global_name || user.username || "Discord Player", avatarUrl: user.avatar && user.id ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null };
    const encoded = btoa(JSON.stringify(profile));
    return redirect("/?auth=discord-connected", [cookieHeader(request, "surfvt14-oauth-state", "", 0), cookieHeader(request, "surfvt14-session", encoded, 2592000)]);
  }

  if (url.pathname === "/auth/session") {
    const session = cookie(request, "surfvt14-session");
    if (!session) return json({ authenticated: false });
    try { return json({ authenticated: true, profile: JSON.parse(atob(session)) }); } catch { return json({ authenticated: false }); }
  }
  return null;
}


async function handleGoogle(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callback = callbackUrl(request).replace("/auth/discord/", "/auth/google/");

  if (url.pathname === "/auth/google/start") {
    if (!clientId || !clientSecret) return json({ error: "Google OAuth2 is not configured" }, 503);
    const state = crypto.randomUUID();
    const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorize.search = new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: callback, scope: "openid email profile", state, access_type: "online", prompt: "select_account" }).toString();
    return redirect(authorize.toString(), [cookieHeader(request, "surfvt14-google-state", state, 600)]);
  }

  if (url.pathname === "/auth/google/callback") {
    if (!clientId || !clientSecret) return json({ error: "Google OAuth2 is not configured" }, 503);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state || state !== cookie(request, "surfvt14-google-state")) return redirect("/?auth=google-state-error");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: callback }) });
    if (!tokenResponse.ok) return redirect("/?auth=google-token-error");
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) return redirect("/?auth=google-token-error");
    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
    if (!userResponse.ok) return redirect("/?auth=google-user-error");
    const user = await userResponse.json() as { sub?: string; name?: string; email?: string; picture?: string | null };
    const profile = { provider: "google", id: user.sub, name: user.name || user.email || "Google Player", avatarUrl: user.picture || null };
    const encoded = btoa(JSON.stringify(profile));
    return redirect("/?auth=google-connected", [cookieHeader(request, "surfvt14-google-state", "", 0), cookieHeader(request, "surfvt14-session", encoded, 2592000)]);
  }
  return null;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  try { const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown }; if (payload.unhandled === true && payload.message === "HTTPError") { console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`)); return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } }); } } catch {}
  return response;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const discordResponse = await handleDiscord(request);
      if (discordResponse) return discordResponse;
      const googleResponse = await handleGoogle(request);
      if (googleResponse) return googleResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
    }
  },
};
