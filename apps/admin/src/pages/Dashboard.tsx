import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { StatCard } from "@/components/StatCard";

interface DashboardStats {
  submissionCount: number;
  userCount: number;
  groupBuyCount: number;
  pendingSubmissionCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    submissionCount: 0,
    userCount: 0,
    groupBuyCount: 0,
    pendingSubmissionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [submissionsRes, usersRes, groupBuysRes] = await Promise.all([
          supabase.from("gonggu_submissions").select("*", { count: "exact", head: true }),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("group_buys").select("*", { count: "exact", head: true }),
        ]);

        const pendingRes = await supabase
          .from("gonggu_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "PENDING");

        setStats({
          submissionCount: submissionsRes.count ?? 0,
          userCount: usersRes.count ?? 0,
          groupBuyCount: groupBuysRes.count ?? 0,
          pendingSubmissionCount: pendingRes.count ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Admin Dashboard
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Total Submissions"
          value={stats.submissionCount}
          color="#4caf50"
          icon={<span>📋</span>}
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingSubmissionCount}
          color="#ff9800"
          icon={<span>⏳</span>}
        />
        <StatCard
          label="Total Users"
          value={stats.userCount}
          color="#2196f3"
          icon={<span>👥</span>}
        />
        <StatCard
          label="Group Buys"
          value={stats.groupBuyCount}
          color="#9c27b0"
          icon={<span>🛒</span>}
        />
      </div>
    </div>
  );
}
