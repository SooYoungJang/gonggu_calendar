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

function createProxyHandler() {
  return async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const url = `${API_URL}/api/v1/admin/submissions/${id}`;
    const headers = getAuthHeaders(request);

    try {
      const response = await fetch(url, {
        method: request.method,
        headers,
        body: request.method !== "GET" ? await request.text() : undefined,
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
  };
}

export const GET = createProxyHandler();
export const PATCH = createProxyHandler();
export const DELETE = createProxyHandler();