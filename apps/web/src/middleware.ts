import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 하위 경로 보호 (단, /admin/login 제외)
  // localStorage에 저장된 JWT 토큰은 middleware에서 읽을 수 없으므로
  // client-side (AuthProvider + AdminLayoutClient)에서 리다이렉트 처리
  // middleware는 기본적인 보호 레이어로 동작
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("gonggu.authToken")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
