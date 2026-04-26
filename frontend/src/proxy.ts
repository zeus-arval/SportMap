import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isFeedPage = request.nextUrl.pathname === "/feed";

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/map", request.url));
  }

  if (!token && isFeedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
