import { describe, it, expect } from "vitest";
import {
  validateInstagramUsername,
  validateProductName,
  validateUrl,
  validateDateRange,
  submissionValidationSchema,
  type SubmissionValidationInput,
} from "./validation";

describe("validation utilities", () => {
  describe("validateInstagramUsername", () => {
    it("returns valid for clean username", () => {
      expect(validateInstagramUsername("testuser")).toEqual({ valid: true });
    });

    it("returns valid and strips @", () => {
      expect(validateInstagramUsername("@testuser")).toEqual({ valid: true });
    });

    it("returns valid and trims whitespace", () => {
      expect(validateInstagramUsername("  @testuser  ")).toEqual({ valid: true });
    });

    it("returns error for empty string", () => {
      expect(validateInstagramUsername("")).toEqual({
        valid: false,
        error: "인스타그램 계정을 입력해주세요",
      });
    });

    it("returns error for whitespace only", () => {
      expect(validateInstagramUsername("   ")).toEqual({
        valid: false,
        error: "인스타그램 계정을 입력해주세요",
      });
    });

    it("returns error for too long", () => {
      const long = "a".repeat(101);
      expect(validateInstagramUsername(long)).toEqual({
        valid: false,
        error: "계정명이 너무 깁니다",
      });
    });

    it("returns error for invalid characters", () => {
      expect(validateInstagramUsername("test-user")).toEqual({
        valid: false,
        error: "올바른 인스타그램 계정 형식이 아닙니다",
      });
    });

    it("returns error for korean characters", () => {
      expect(validateInstagramUsername("테스트")).toEqual({
        valid: false,
        error: "올바른 인스타그램 계정 형식이 아닙니다",
      });
    });

    it("accepts dots and underscores", () => {
      expect(validateInstagramUsername("test.user")).toEqual({ valid: true });
      expect(validateInstagramUsername("test_user")).toEqual({ valid: true });
      expect(validateInstagramUsername("test.user_name")).toEqual({ valid: true });
    });
  });

  describe("validateProductName", () => {
    it("returns valid for product name", () => {
      expect(validateProductName("테스트 제품")).toEqual({ valid: true });
    });

    it("returns valid and trims", () => {
      expect(validateProductName("  제품명  ")).toEqual({ valid: true });
    });

    it("returns error for empty", () => {
      expect(validateProductName("")).toEqual({
        valid: false,
        error: "제품명은 필수입니다",
      });
    });

    it("returns error for whitespace only", () => {
      expect(validateProductName("   ")).toEqual({
        valid: false,
        error: "제품명은 필수입니다",
      });
    });

    it("returns error for too long", () => {
      const long = "가".repeat(201);
      expect(validateProductName(long)).toEqual({
        valid: false,
        error: "제품명이 너무 깁니다",
      });
    });
  });

  describe("validateUrl", () => {
    it("returns valid for http URL", () => {
      expect(validateUrl("http://example.com")).toEqual({ valid: true });
    });

    it("returns valid for https URL", () => {
      expect(validateUrl("https://example.com/path?query=1")).toEqual({ valid: true });
    });

    it("returns valid for empty string when not required", () => {
      expect(validateUrl("", false)).toEqual({ valid: true });
    });

    it("returns error for empty string when required", () => {
      expect(validateUrl("", true)).toEqual({
        valid: false,
        error: "URL은 필수입니다",
      });
    });

    it("returns error for invalid URL", () => {
      expect(validateUrl("not-a-url")).toEqual({
        valid: false,
        error: "올바른 URL 형식이 아닙니다",
      });
    });

    it("returns error for invalid URL when not required but provided", () => {
      expect(validateUrl("bad", false)).toEqual({
        valid: false,
        error: "올바른 URL 형식이 아닙니다",
      });
    });
  });

  describe("validateDateRange", () => {
    it("returns valid for valid range", () => {
      expect(validateDateRange("2026-06-20", "2026-06-27")).toEqual({ valid: true });
    });

    it("returns valid when only startDate provided", () => {
      expect(validateDateRange("2026-06-20", undefined)).toEqual({ valid: true });
    });

    it("returns valid when only endDate provided", () => {
      expect(validateDateRange(undefined, "2026-06-27")).toEqual({ valid: true });
    });

    it("returns valid when both undefined", () => {
      expect(validateDateRange(undefined, undefined)).toEqual({ valid: true });
    });

    it("returns error for start after end", () => {
      expect(validateDateRange("2026-06-27", "2026-06-20")).toEqual({
        valid: false,
        error: "시작일은 종료일보다 이전이어야 합니다",
      });
    });

    it("returns valid when start equals end", () => {
      expect(validateDateRange("2026-06-20", "2026-06-20")).toEqual({ valid: true });
    });
  });

  describe("submissionValidationSchema", () => {
    const createValidInput = (overrides: Partial<SubmissionValidationInput> = {}): SubmissionValidationInput => ({
      influencerUsername: "test_influencer",
      influencerDisplayName: "테스트 인플루언서",
      caption: "공구 캡션입니다.",
      postUrl: "https://instagram.com/p/abc123",
      imageUrl: "https://example.com/img.jpg",
      productName: "테스트 제품",
      brandName: "테스트 브랜드",
      startDate: "2026-06-20T00:00:00.000Z",
      endDate: "2026-06-27T23:59:59.000Z",
      purchaseUrl: "https://example.com/buy",
      discountInfo: "20% 할인",
      summary: "판매 요약",
      ...overrides,
    });

    it("validates complete valid input", () => {
      const input = createValidInput();
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("validates minimal required fields", () => {
      const input = createValidInput({
        influencerDisplayName: undefined,
        imageUrl: undefined,
        brandName: undefined,
        startDate: undefined,
        endDate: undefined,
        purchaseUrl: undefined,
        discountInfo: undefined,
        summary: undefined,
      });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects empty influencerUsername", () => {
      const input = createValidInput({ influencerUsername: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects empty caption", () => {
      const input = createValidInput({ caption: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects empty productName", () => {
      const input = createValidInput({ productName: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects productName too long", () => {
      const input = createValidInput({ productName: "가".repeat(201) });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid postUrl", () => {
      const input = createValidInput({ postUrl: "not-a-url" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid imageUrl", () => {
      const input = createValidInput({ imageUrl: "not-a-url" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("accepts empty string for optional imageUrl", () => {
      const input = createValidInput({ imageUrl: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects invalid purchaseUrl", () => {
      const input = createValidInput({ purchaseUrl: "bad-url" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("accepts empty string for optional purchaseUrl", () => {
      const input = createValidInput({ purchaseUrl: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects startDate after endDate", () => {
      const input = createValidInput({
        startDate: "2026-06-27T00:00:00.000Z",
        endDate: "2026-06-20T23:59:59.000Z",
      });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("startDate"))).toBe(true);
      }
    });

    it("accepts same start and end date", () => {
      const input = createValidInput({
        startDate: "2026-06-20T00:00:00.000Z",
        endDate: "2026-06-20T23:59:59.000Z",
      });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects invalid datetime format", () => {
      const input = createValidInput({ startDate: "not-a-date" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("accepts empty string for optional date fields", () => {
      const input = createValidInput({ startDate: "", endDate: "" });
      const result = submissionValidationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
