import { forwardRef, useState, useRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

export type CardVariant = "default" | "outlined" | "elevated" | "filled";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Hover effect */
  hoverable?: boolean;
  /** Children content */
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-background-primary border border-border-primary",
  outlined: "bg-background-primary border-2 border-border-secondary",
  elevated: "bg-background-primary shadow-card border border-transparent",
  filled: "bg-bg-secondary border border-transparent",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hoverable = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg transition-all duration-150 ease-out",
          variantStyles[variant],
          paddingStyles[padding],
          hoverable && "card-hover",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Action element (e.g., button, dropdown) */
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between mb-4", className)}
        {...props}
      >
        <div>{children}</div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Subtitle text */
  subtitle?: string;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, subtitle, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        <h3 className="text-lg font-semibold text-text-primary">{children}</h3>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-primary", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

/* ============================================================================
   SubmissionCard - Specialized card for admin submission review
   ============================================================================ */

export type SubmissionStatus = "PENDING" | "REVIEW_REQUIRED" | "APPROVED" | "REJECTED" | "DUPLICATE";

export interface Submission {
  id: string;
  productName?: string | null;
  brandName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  purchaseUrl?: string | null;
  discountInfo?: string | null;
  instagramUrl?: string | null;
  imageUrls?: string[];
  summary?: string | null;
  reporterName?: string | null;
  isAnonymous?: boolean;
  status: SubmissionStatus;
  adminMemo?: string | null;
  createdAt: string;
}

interface SubmissionCardProps {
  submission: Submission;
  isExpanded?: boolean;
  onToggle?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onSave?: (id: string, data: Partial<Submission>) => void;
  onView?: (id: string) => void;
  reviewForm?: Partial<Submission>;
  onFormChange?: (field: string, value: string) => void;
  updating?: boolean;
  moderating?: boolean;
  className?: string;
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "미입력";
  try {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "날짜 오류";
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
  } catch {
    return "알 수 없음";
  }
}

const statusLabels: Record<SubmissionStatus, string> = {
  PENDING: "대기 중",
  REVIEW_REQUIRED: "검수 필요",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  DUPLICATE: "중복",
};

const statusClasses: Record<SubmissionStatus, string> = {
  PENDING: "bg-status-pending-bg text-status-pending-text border-status-pending-border",
  REVIEW_REQUIRED: "bg-status-review-bg text-status-review-text border-status-review-border",
  APPROVED: "bg-status-approved-bg text-status-approved-text border-status-approved-border",
  REJECTED: "bg-status-rejected-bg text-status-rejected-text border-status-rejected-border",
  DUPLICATE: "bg-status-duplicate-bg text-status-duplicate-text border-status-duplicate-border",
};

export function SubmissionCard({
  submission,
  isExpanded = false,
  onToggle,
  onApprove,
  onReject,
  onSave,
  onView,
  reviewForm = {},
  onFormChange,
  updating = false,
  moderating = false,
  className,
}: SubmissionCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggle ? localExpanded : isExpanded;
  const handleToggle = onToggle || (() => setLocalExpanded((v) => !v));
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate height for expand/collapse
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = expanded ? `${contentRef.current.scrollHeight}px` : "0";
    }
  }, [expanded]);

  const displayName = submission.reporterName ?? (submission.isAnonymous ? "익명 제보자" : "제보자");
  const status = submission.status;

  return (
    <Card variant="default" padding="none" className={cn(expanded && "bg-primary-50/50", className)}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-text-primary">
                {submission.productName ?? "제품명 미입력"}
              </h3>
              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", statusClasses[status])}>
                {statusLabels[status] || status}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              <div>
                <label className="text-xs text-text-tertiary block mb-1">제품명</label>
                <p className="font-medium text-text-primary">{submission.productName ?? "미입력"}</p>
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1">브랜드</label>
                <p className="font-medium text-text-primary">{submission.brandName ?? "미입력"}</p>
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1">시작일</label>
                <p className="font-medium text-text-primary">{submission.startDate ? formatDateTime(submission.startDate) : "미입력"}</p>
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-1">종료일</label>
                <p className="font-medium text-text-primary">{submission.endDate ? formatDateTime(submission.endDate) : "미입력"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-tertiary block mb-1">구매 링크</label>
                <p className="font-medium text-text-primary">{submission.purchaseUrl ?? "미입력"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-tertiary block mb-1">할인/혜택</label>
                <p className="font-medium text-text-primary">{submission.discountInfo ?? "미입력"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-tertiary block mb-1">인스타그램 URL</label>
                <p className="font-medium text-text-primary">{submission.instagramUrl ?? "미입력"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-tertiary block mb-1">이미지</label>
                <p className="font-medium text-text-primary">{submission.imageUrls?.length ? `${submission.imageUrls.length}개` : "미입력"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-tertiary block mb-1">제보자</label>
                <p className="font-medium text-text-primary">{displayName}</p>
              </div>
            </div>

            {expanded && (
              <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{ height: expanded ? "auto" : "0" }}
              >
                <div className="mt-4 space-y-4 border-t border-border-primary pt-4 animate-accordion-expand">
                  <div>
                    <label className="text-xs text-text-tertiary block mb-1">요약</label>
                    <textarea
                      value={reviewForm.summary || submission.summary || ""}
                      onChange={(e) => onFormChange?.("summary", e.target.value)}
                      className="w-full p-3 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent"
                      rows={3}
                      placeholder="승인 시 표시할 요약을 입력하세요"
                      aria-label="요약"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={reviewForm.productName || submission.productName || ""}
                      onChange={(e) => onFormChange?.("productName", e.target.value)}
                      placeholder="제품명"
                      aria-label="제품명"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent"
                    />
                    <input
                      type="text"
                      value={reviewForm.brandName || submission.brandName || ""}
                      onChange={(e) => onFormChange?.("brandName", e.target.value)}
                      placeholder="브랜드"
                      aria-label="브랜드"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent"
                    />
                    <input
                      type="datetime-local"
                      value={
                        reviewForm.startDate || submission.startDate
                          ? new Date(reviewForm.startDate || submission.startDate!).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => onFormChange?.("startDate", e.target.value)}
                      aria-label="시작일"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent"
                    />
                    <input
                      type="datetime-local"
                      value={
                        reviewForm.endDate || submission.endDate
                          ? new Date(reviewForm.endDate || submission.endDate!).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => onFormChange?.("endDate", e.target.value)}
                      aria-label="종료일"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent"
                    />
                    <input
                      type="url"
                      value={reviewForm.purchaseUrl || submission.purchaseUrl || ""}
                      onChange={(e) => onFormChange?.("purchaseUrl", e.target.value)}
                      placeholder="구매 URL"
                      aria-label="구매 URL"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent sm:col-span-2"
                    />
                    <input
                      type="text"
                      value={reviewForm.discountInfo || submission.discountInfo || ""}
                      onChange={(e) => onFormChange?.("discountInfo", e.target.value)}
                      placeholder="할인/혜택"
                      aria-label="할인/혜택"
                      className="p-2 border border-border-primary rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-transparent sm:col-span-2"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => onSave?.(submission.id, reviewForm)}
                      disabled={updating}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                    >
                      {updating ? "저장 중..." : "수정사항 저장"}
                    </button>
                    {status === "PENDING" || status === "REVIEW_REQUIRED" ? (
                      <>
                        <button
                          onClick={() => onApprove?.(submission.id)}
                          disabled={moderating}
                          className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-100"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("반려 사유를 입력하세요:");
                            if (reason) onReject?.(submission.id, reason);
                          }}
                          disabled={moderating}
                          className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-100"
                        >
                          반려
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {submission.adminMemo && (
              <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700"><strong>반려 사유:</strong> {submission.adminMemo}</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={cn("mt-4 w-full text-center text-primary-600 hover:text-primary-700 text-sm font-medium", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 rounded")}
        >
          {expanded ? "접기" : "상세 보기"}
        </button>
      </div>
      <div className="border-t border-border-primary px-6 py-3 text-right text-text-tertiary text-sm">
        제보일: {formatRelativeTime(submission.createdAt)}
      </div>
    </Card>
  );
}

export type { SubmissionCardProps };