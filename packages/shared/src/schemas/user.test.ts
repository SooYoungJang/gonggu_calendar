import { describe, it, expect } from "vitest";
import {
  userSchema,
  type User,
} from "./user";

describe("user schemas", () => {
  describe("userSchema", () => {
    const createValidUser = (overrides: Partial<User> = {}): User => ({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "test@example.com",
      nickname: "테스트유저",
      fcmToken: "fcm-token-123",
      favorites: [],
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
      ...overrides,
    });

    it("validates complete user", () => {
      const user = createValidUser();
      const result = userSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("validates with nullable fields as null", () => {
      const user = createValidUser({
        nickname: null,
        fcmToken: null,
        favorites: [],
      });
      const result = userSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
      const user = createValidUser({ id: "not-uuid" });
      const result = userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const user = createValidUser({ email: "bad-email" });
      const result = userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it("rejects invalid datetime", () => {
      const user = createValidUser({ createdAt: "bad-date" });
      const result = userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });
  });
});
