const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_PREFIX = "/api/v1";

function buildBaseUrl(baseUrl: string): string {
  if (baseUrl.endsWith("/api/v1")) return baseUrl;
  return `${baseUrl.replace(/\/$/, "")}${API_PREFIX}`;
}

class ApiClient {
  private baseUrl: string;
  private adminToken?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = buildBaseUrl(baseUrl);
  }

  setAdminToken(token: string) {
    this.adminToken = token;
  }

  clearAdminToken() {
    this.adminToken = undefined;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.adminToken) {
      headers["Authorization"] = `Bearer ${this.adminToken}`;
    }

    return headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Unknown error" }))) as { message?: string };
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

export function getApiClient(): ApiClient {
  return apiClient;
}