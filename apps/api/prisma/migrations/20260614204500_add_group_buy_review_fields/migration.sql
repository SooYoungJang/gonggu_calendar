-- Add moderation audit fields for admin reject flow.
ALTER TABLE "group_buys" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;
ALTER TABLE "group_buys" ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3);
