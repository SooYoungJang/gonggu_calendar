"use client";

import { useState } from "react";
import { useInfluencers, useCreateInfluencer, useDeactivateInfluencer } from "@gonggu/shared/hooks";
import { formatDateTime } from "@gonggu/shared/utils";
import { useConfirmation, AlertDialog } from "@gonggu/ui-web";

export default function AdminInfluencersPage() {
  const { data: influencers, isLoading, refetch } = useInfluencers();
  const createMutation = useCreateInfluencer({ onSuccess: () => void refetch() });
  const deactivateMutation = useDeactivateInfluencer({ onSuccess: () => void refetch() });
  const { confirm, state: confirmState } = useConfirmation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ instagramUsername: "", displayName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = form.instagramUsername.trim().replace(/^@/, "");
    if (!username) {
      setErrors({ instagramUsername: "인스타그램 계정은 필수입니다" });
      return;
    }
    if (!form.displayName.trim()) {
      setErrors({ displayName: "표시명은 필수입니다" });
      return;
    }

    try {
      await createMutation.mutateAsync({ instagramUsername: username, displayName: form.displayName.trim() });
      setForm({ instagramUsername: "", displayName: "" });
      setShowForm(false);
      setErrors({});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "등록에 실패했습니다";
      setErrors({ form: message });
    }
  };

  const handleDeactivate = (id: string) => {
    confirm({
      title: "인플루언서 비활성화",
      description: "이 인플루언서를 비활성화하시겠습니까? 기존 승인된 공구는 유지되고 신규 수집 대상에서 제외됩니다.",
      variant: "destructive",
      confirmText: "비활성화",
      onConfirm: async () => {
        await deactivateMutation.mutateAsync(id);
      },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" role="status" aria-label="로딩 중"></div></div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-gray-600 mt-1">공구 수집 대상인 인플루언서 계정을 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          인플루언서 추가
        </button>
      </header>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">새 인플루언서 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="instagramUsername" className="block text-sm font-medium text-gray-700 mb-1">
                인스타그램 계정 @
              </label>
              <input
                id="instagramUsername"
                type="text"
                value={form.instagramUsername}
                onChange={(e) => setForm({ ...form, instagramUsername: e.target.value })}
                placeholder="example_user"
                aria-required="true"
                aria-label="인스타그램 계정"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.instagramUsername ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.instagramUsername && <p className="mt-1 text-sm text-red-600">{errors.instagramUsername}</p>}
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">표시명</label>
              <input
                id="displayName"
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="표시될 이름"
                aria-required="true"
                aria-label="표시명"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.displayName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
            </div>
            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {createMutation.isPending ? "등록 중..." : "등록"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm({ instagramUsername: "", displayName: "" }); setErrors({}); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {influencers && influencers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {influencers.map((inf) => (
              <div key={inf.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-lg">
                    {inf.instagramUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">@{inf.instagramUsername}</p>
                    <p className="text-sm text-gray-500">{inf.displayName ?? "표시명 없음"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    inf.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {inf.isActive ? "활성" : "비활성"}
                  </span>
                  {inf.isActive && (
                    <button
                      onClick={() => handleDeactivate(inf.id)}
                      disabled={deactivateMutation.isPending}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      비활성화
                    </button>
                  )}
                  <span className="text-xs text-gray-400">등록: {formatDateTime(inf.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>등록된 인플루언서가 없습니다.</p>
          </div>
        )}
      </div>
      {confirmState && (
        <AlertDialog {...confirmState} />
      )}
    </div>
  );
}