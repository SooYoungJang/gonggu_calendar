-- CreateEnum
CREATE TYPE "FeedMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "instagram_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "media_url" TEXT,
    "mediaType" "FeedMediaType",
    "caption" TEXT,
    "account_name" TEXT,
    "link_url" TEXT,
    "open_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);
