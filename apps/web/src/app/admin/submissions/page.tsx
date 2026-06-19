"use client";

import { useState, useCallback } from "react";
import { useSubmissions, useModerateSubmission, useUpdateSubmission } from "@gonggu/shared/hooks";
import { SUBMISSION_STATUS_LABELS } from "@gonggu/shared/schemas";
import type { Submission, SubmissionReviewForm } from "@gonggu/shared/schemas";
import {
  Card,
  CardContent,
  SubmissionCard as UiSubmissionCard,
  type Submission as UiSubmission,
  type SubmissionStatus,
  Button,
  FilterChips,
  type FilterOption,
  Badge,
  Modal,
  useToast,
} from "@gonggu/ui-web";

const STATUS_FILTERS: FilterOption[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기 중" },
  { value: "REVIEW_REQUIRED", label: "검수 필요" },
  { value: "APPROVED", label: "승인됨" },
  { value: "REJECTED", label: "반려됨" },
  { value: "DUPLICATE", label: "중복" },
];

/** Convert API submission type to UI SubmissionCard type */
function toUiSubmission(s: Submission): UiSubmission {
  return {
    id: s.id,
    productName: s.productName,
    brandName: s.brandName,
    startDate: s.startDate,
    endDate: s.endDate,
    purchaseUrl: s.purchaseUrl,
    discountInfo: s.discountInfo,
    instagramUrl: s.instagramUrl,
    imageUrls: s.imageUrls,
    summary: s.summary,
    reporterName: s.reporterName,
    isAnonymous: s.isAnonymous,
    status: s.status as SubmissionStatus,
    adminMemo: s.adminMemo,
    createdAt: s.createdAt,
  };
}

export default function AdminSubmissionsPage() {
  const { data: submissions, isLoading, error, refetch } = useSubmissions();
  const moderateMutation = useModerateSubmission();
  const updateMutation = useUpdateSubmission();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = (submissions ?? []).filter((s) => {
    if (statusFilter === "ALL") return true;
    return s.status === statusFilter;
  });

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await moderateMutation.mutateAsync({ id, action: { action: "approve" } });
        addToast({ message: "승인 완료되었습니다", type: "success" });
        refetch();
      } catch {
        addToast({ message: "승인 처리 중 오류가 발생했습니다", type: "error" });
      }
    },
    [moderateMutation, addToast, refetch]
  );

  const handleReject = useCallback(
    async (id: string, reason?: string) => {
      try {
        await moderateMutation.mutateAsync({ id, action: { action: "reject", reason: reason || "" } });
        addToast({ message: "반려 처리되었습니다", type: "info" });
        refetch();
      } catch {
        addToast({ message: "반려 처리 중 오류가 발생했습니다", type: "error" });
      }
    },
    [moderateMutation, addToast, refetch]
  );

  const handleSave = useCallback(
    async (id: string, data: Partial<UiSubmission>) => {
      try {
        await updateMutation.mutateAsync({ id, data: data as unknown as SubmissionReviewForm });
        addToast({ message: "저장되었습니다", type: "success" });
        refetch();
      } catch {
        addToast({ message: "수정사항 저장 중 오류가 발생했습니다", type: "error" });
      }
    },
    [updateMutation, addToast, refetch]
  );

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <span className="text-5xl" aria-hidden="true">⚠️</span>
        <h2 className="text-xl font-semibold text-gray-900">데이터를 불러올 수 없습니다</h2>
        <p className="text-gray-500 text-sm">일시적인 오류가 발생했습니다. 다시 시도해주세요.</p>
        <Button variant="primary" onClick={() => refetch()}>다시 시도</Button>
      </div>
    );
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">제보 검수</h1>
          <p className="text-gray-500 mt-1">사용자 제보를 검토하고 승인/반려 처리합니다.</p>
        </header>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="outlined" padding="lg">
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">제보 검수</h1>
          <p className="text-gray-500 mt-1">사용자 제보를 검토하고 승인/반려 처리합니다.</p>
        </div>
        <Badge variant="info">
          {submissions?.length ?? 0}건
        </Badge>
      </header>

      {/* Filter bar */}
      <Card variant="outlined" padding="md">
        <FilterChips
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
          size="md"
        />
      </Card>

      {/* Submission list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <UiSubmissionCard
              key={sub.id}
              submission={toUiSubmission(sub)}
              isExpanded={expandedId === sub.id}
              onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              onApprove={handleApprove}
              onReject={(id, reason) => {
                if (reason) {
                  handleReject(id, reason);
                } else {
                  setRejectModal({ id });
                }
              }}
              onSave={handleSave}
              updating={updateMutation.isPending}
              moderating={moderateMutation.isPending}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <Card variant="outlined" padding="lg">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <span className="text-5xl" aria-hidden="true">
                {statusFilter !== "ALL" ? "🔍" : "📭"}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                {statusFilter !== "ALL"
                  ? "조건에 맞는 제보가 없습니다"
                  : "아직 접수된 제보가 없습니다"}
              </h3>
              <p className="text-gray-500 text-sm text-center">
                {statusFilter !== "ALL"
                  ? "다른 필터로 검색해보세요"
                  : "첫 제보가 도착하면 이곳에 표시됩니다"}
              </p>
              {statusFilter !== "ALL" && (
                <Button variant="ghost" onClick={() => setStatusFilter("ALL")}>
                  필터 초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject reason modal */}
      <Modal
        open={rejectModal !== null}
        onClose={() => { setRejectModal(null); setRejectReason(""); }}
        title="반려 사유 입력"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => { setRejectModal(null); setRejectReason(""); }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (rejectModal && rejectReason.trim()) {
                  handleReject(rejectModal.id, rejectReason.trim());
                  setRejectModal(null);
                  setRejectReason("");
                }
              }}
            >
              반려하기
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-3">
          반려 사유를 입력해주세요 (제보자에게 전달됩니다)
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="구체적인 사유를 입력하세요"
          aria-label="반려 사유"
          autoFocus
        />
      </Modal>
    </div>
  );
}