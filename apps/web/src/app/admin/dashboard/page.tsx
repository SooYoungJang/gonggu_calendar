"use client";

import { useInfluencers, useSubmissions } from "@gonggu/shared/hooks";
import { formatRelativeTime } from "@gonggu/shared/utils";
import Link from "next/link";
import { Card, CardContent, Badge, Button, useToast } from "@gonggu/ui-web";

export default function AdminDashboardPage() {
  const {
    data: influencers,
    isLoading: influencersLoading,
    error: influencersError,
    refetch: refetchInfluencers,
  } = useInfluencers();
  const {
    data: submissions,
    isLoading: submissionsLoading,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useSubmissions();
  const { addToast } = useToast();

  const pendingCount =
    submissions?.filter(
      (s) => s.status === "PENDING" || s.status === "REVIEW_REQUIRED"
    ).length ?? 0;
  const approvedCount =
    submissions?.filter((s) => s.status === "APPROVED").length ?? 0;
  const rejectedCount =
    submissions?.filter((s) => s.status === "REJECTED" || s.status === "DUPLICATE").length ??
    0;
  const activeInfluencers = influencers?.filter((i) => i.isActive).length ?? 0;

  const hasError = !!(submissionsError || influencersError);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <span className="text-5xl" aria-hidden="true">⚠️</span>
        <h2 className="text-xl font-semibold text-gray-900">
          데이터를 불러올 수 없습니다
        </h2>
        <p className="text-gray-500 text-sm">
          일시적인 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            refetchSubmissions();
            refetchInfluencers();
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">
          공동구매 제보 및 승인 현황을 한눈에 확인하세요.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="검수 대기"
          value={pendingCount}
          icon="⏳"
          href="/admin/submissions"
          variant="warning"
          isLoading={submissionsLoading}
        />
        <StatCard
          title="활성 인플루언서"
          value={activeInfluencers}
          icon="🏆"
          href="/admin/influencers"
          variant="primary"
          isLoading={influencersLoading}
        />
        <StatCard
          title="누적 제보"
          value={submissions?.length ?? 0}
          icon="📋"
          href="/admin/submissions"
          variant="success"
          isLoading={submissionsLoading}
        />
        <StatCard
          title="승인된 공구"
          value={approvedCount}
          icon="✅"
          href="/admin/group-buys"
          variant="purple"
          isLoading={submissionsLoading}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <Card variant="outlined" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 제보</h2>
            <Link
              href="/admin/submissions"
              className="text-sm text-primary-600 hover:underline"
            >
              전체 보기<span aria-hidden="true"> →</span>
            </Link>
          </div>
          {submissionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse h-16 bg-gray-100 rounded-lg"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {submissions.slice(0, 5).map((sub) => (
                <SubmissionRow key={sub.id} submission={sub} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 space-y-2">
              <span className="text-3xl" aria-hidden="true">📭</span>
              <p className="text-gray-500 text-sm">
                아직 접수된 제보가 없습니다
              </p>
              <p className="text-gray-400 text-xs">
                첫 제보가 도착하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </Card>

        {/* Registered Influencers */}
        <Card variant="outlined" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              등록된 인플루언서
            </h2>
            <Link
              href="/admin/influencers"
              className="text-sm text-primary-600 hover:underline"
            >
              전체 보기<span aria-hidden="true"> →</span>
            </Link>
          </div>
          {influencersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse h-16 bg-gray-100 rounded-lg"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : influencers && influencers.length > 0 ? (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {influencers.slice(0, 5).map((inf) => (
                <InfluencerRow key={inf.id} influencer={inf} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 space-y-2">
              <span className="text-3xl" aria-hidden="true">🏆</span>
              <p className="text-gray-500 text-sm">
                등록된 인플루언서가 없습니다
              </p>
              <p className="text-gray-400 text-xs">
                인플루언서를 추가하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ===========================================================================
   Sub-components
   =========================================================================== */

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  href: string;
  variant: "primary" | "success" | "warning" | "purple";
  isLoading?: boolean;
}

const statCardVariants: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

function StatCard({ title, value, icon, href, variant, isLoading }: StatCardProps) {
  return (
    <Link
      href={href}
      className="block"
    >
      <Card variant="elevated" padding="lg" hoverable>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            {isLoading ? (
              <div className="mt-2 h-9 w-16 animate-pulse bg-gray-200 rounded" aria-hidden="true" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl text-xl ${statCardVariants[variant]}`} aria-hidden="true">
            {icon}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SubmissionRow({
  submission,
}: {
  submission: {
    id: string;
    productName: string | null;
    status: string;
    createdAt: string;
  };
}) {
  const statusVariant =
    submission.status === "APPROVED"
      ? "success"
      : submission.status === "REJECTED" || submission.status === "DUPLICATE"
      ? "error"
      : "warning";

  const statusLabel: Record<string, string> = {
    PENDING: "대기 중",
    REVIEW_REQUIRED: "검수 필요",
    APPROVED: "승인됨",
    REJECTED: "반려됨",
    DUPLICATE: "중복",
  };

  return (
    <Link
      href={`/admin/submissions/${submission.id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {submission.productName ?? "제품명 미확인"}
        </p>
        <p className="text-sm text-gray-500">
          {formatRelativeTime(submission.createdAt)}
        </p>
      </div>
      <Badge variant={statusVariant} size="sm">
        {statusLabel[submission.status] || submission.status}
      </Badge>
    </Link>
  );
}

function InfluencerRow({
  influencer,
}: {
  influencer: {
    id: string;
    instagramUsername: string;
    displayName: string | null;
    isActive: boolean;
  };
}) {
  return (
    <Link
      href={`/admin/influencers/${influencer.id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {influencer.instagramUsername.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            @{influencer.instagramUsername}
          </p>
          <p className="text-sm text-gray-500">
            {influencer.displayName ?? "표시명 없음"}
          </p>
        </div>
      </div>
      <Badge variant={influencer.isActive ? "success" : "default"} size="sm">
        {influencer.isActive ? "활성" : "비활성"}
      </Badge>
    </Link>
  );
}