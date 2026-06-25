import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  color?: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 24,
        borderRadius: 8,
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      {icon && (
        <div
          data-color={color ? "true" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: color || "#e8f4fd",
            color: color || "#1976d2",
            fontSize: 24,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#333",
          }}
        >
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
