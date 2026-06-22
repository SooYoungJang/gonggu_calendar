-- AlterTable
ALTER TABLE "feed_posts" ADD COLUMN     "og_description" TEXT,
ADD COLUMN     "og_image" TEXT,
ADD COLUMN     "og_title" TEXT,
ADD COLUMN     "og_updated_at" TIMESTAMP(3),
ADD COLUMN     "og_video" TEXT,
ALTER COLUMN "thumbnail_url" DROP NOT NULL;
