-- Add GongguSubmission model and GroupBuy fields
-- Migration: add_gonggu_submission

-- Add SubmissionStatus enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubmissionStatus') THEN
        CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DUPLICATE');
    END IF;
END $$;

-- Add GongguSubmission table
CREATE TABLE IF NOT EXISTS "gonggu_submissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "product_name" VARCHAR(100) NOT NULL,
    "brand_name" VARCHAR(50),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "purchase_url" TEXT,
    "discount_info" VARCHAR(200),
    "summary" VARCHAR(500),
    "instagram_url" TEXT,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reporter_name" VARCHAR(30),
    "reporter_contact" VARCHAR(100),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "content_hash" VARCHAR(64) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "admin_memo" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "group_buy_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gonggu_submissions_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "gonggu_submissions_status_idx" ON "gonggu_submissions"("status");
CREATE INDEX IF NOT EXISTS "gonggu_submissions_created_at_idx" ON "gonggu_submissions"("created_at");
CREATE INDEX IF NOT EXISTS "gonggu_submissions_product_name_idx" ON "gonggu_submissions"("product_name");
CREATE UNIQUE INDEX IF NOT EXISTS "gonggu_submissions_content_hash_key" ON "gonggu_submissions"("content_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "gonggu_submissions_group_buy_id_key" ON "gonggu_submissions"("group_buy_id");

-- Add columns to GroupBuy table
ALTER TABLE "group_buys" ADD COLUMN IF NOT EXISTS "source_type" VARCHAR(20) DEFAULT 'CRAWLED';
ALTER TABLE "group_buys" ADD COLUMN IF NOT EXISTS "submission_id" TEXT;
ALTER TABLE "group_buys" ADD COLUMN IF NOT EXISTS "is_all_day" BOOLEAN DEFAULT false;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS "group_buys_source_type_idx" ON "group_buys"("source_type");
CREATE UNIQUE INDEX IF NOT EXISTS "group_buys_submission_id_key" ON "group_buys"("submission_id");

-- Add foreign key constraint for groupBuyId in GongguSubmission
ALTER TABLE "gonggu_submissions" ADD CONSTRAINT "gonggu_submissions_group_buy_id_fkey"
    FOREIGN KEY ("group_buy_id") REFERENCES "group_buys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraint for submission_id in GroupBuy
ALTER TABLE "group_buys" ADD CONSTRAINT "group_buys_submission_id_fkey"
    FOREIGN KEY ("submission_id") REFERENCES "gonggu_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;