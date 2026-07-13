import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const PUBLIC = ["/offline"];

/**
 * Fast auth gating. Verifies the JWT LOCALLY via getClaims() (no network) on the
 * hot path, and only hits the network (getUser, which also refreshes) when the
 * access token is missing/expired. Keeps client navigation snappy.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  let authed = false;
  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims?.sub) {
    authed = true;
  } else {
    // Token missing or expired — do the network round-trip to refresh + verify.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = !!user;
  }

  const path = request.nextUrl.pathname;
  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (PUBLIC.includes(path)) return response;

  if (!authed) {
    if (AUTH_PAGES.includes(path)) return response;
    return redirectTo("/login");
  }

  if (AUTH_PAGES.includes(path) || path === "/") return redirectTo("/today");

  return response;
}
