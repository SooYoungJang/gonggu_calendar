import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const authHeader = request.headers.get("authorization");
  const cookieAuth = request.cookies.get("gonggu.authToken")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  } else if (cookieAuth) {
    headers["Authorization"] = `Bearer ${cookieAuth}`;
  }

  return headers;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_URL}/api/v1/admin/submissions/cursor${searchParams ? `?${searchParams}` : ""}`;
  const headers = getAuthHeaders(request);

  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "프록시 오류", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}