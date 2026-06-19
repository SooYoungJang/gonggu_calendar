import { z } from "zod";

export function validateInstagramUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim().replace(/^@/, "");
  if (!trimmed) return { valid: false, error: "인스타그램 계정을 입력해주세요" };
  if (trimmed.length > 100) return { valid: false, error: "계정명이 너무 깁니다" };
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return { valid: false, error: "올바른 인스타그램 계정 형식이 아닙니다" };
  }
  return { valid: true };
}

export function validateProductName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "제품명은 필수입니다" };
  if (trimmed.length > 200) return { valid: false, error: "제품명이 너무 깁니다" };
  return { valid: true };
}

export function validateUrl(url: string, required: boolean = false): { valid: boolean; error?: string } {
  if (!url.trim()) {
    if (required) return { valid: false, error: "URL은 필수입니다" };
    return { valid: true };
  }
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "올바른 URL 형식이 아닙니다" };
  }
}

export function validateDateRange(startDate?: string, endDate?: string): { valid: boolean; error?: string } {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return { valid: false, error: "시작일은 종료일보다 이전이어야 합니다" };
    }
  }
  return { valid: true };
}

export const submissionValidationSchema = z.object({
  influencerUsername: z.string().min(1).max(100),
  influencerDisplayName: z.string().max(100).optional(),
  caption: z.string().min(1),
  postUrl: z.string().url(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  productName: z.string().min(1).max(200),
  brandName: z.string().max(100).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  purchaseUrl: z.string().url().optional().or(z.literal("")),
  discountInfo: z.string().max(200).optional(),
  summary: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "시작일은 종료일보다 이전이어야 합니다",
    path: ["startDate"],
  }
);

export type SubmissionValidationInput = z.infer<typeof submissionValidationSchema>;