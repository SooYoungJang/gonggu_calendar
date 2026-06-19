export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "날짜 오류";
  try {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    });
  } catch {
    return "날짜 오류";
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "날짜 오류";
  try {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "종료됨";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    if (diffDays <= 7) return `${diffDays}일 남음`;
    return formatDate(dateString);
  } catch {
    return "날짜 오류";
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "날짜 오류";
  try {
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "날짜 오류";
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeInstagramUsername(username: string): string {
  return username.trim().replace(/^@/, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEW_REQUIRED: "bg-orange-100 text-orange-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}