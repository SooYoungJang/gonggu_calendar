import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string().max(50).nullable(),
  fcmToken: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const favoriteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  groupBuyId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Favorite = z.infer<typeof favoriteSchema>;