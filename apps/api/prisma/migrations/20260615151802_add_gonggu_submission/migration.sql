/*
  Warnings:

  - Made the column `is_all_day` on table `group_buys` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "gonggu_submissions" DROP CONSTRAINT "gonggu_submissions_group_buy_id_fkey";

-- AlterTable
ALTER TABLE "gonggu_submissions" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "product_name" SET DATA TYPE TEXT,
ALTER COLUMN "brand_name" SET DATA TYPE TEXT,
ALTER COLUMN "discount_info" SET DATA TYPE TEXT,
ALTER COLUMN "summary" SET DATA TYPE TEXT,
ALTER COLUMN "reporter_name" SET DATA TYPE TEXT,
ALTER COLUMN "reporter_contact" SET DATA TYPE TEXT,
ALTER COLUMN "content_hash" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "group_buys" ALTER COLUMN "source_type" SET DATA TYPE TEXT,
ALTER COLUMN "is_all_day" SET NOT NULL;
