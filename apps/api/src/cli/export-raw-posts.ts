import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { finished } from 'node:stream/promises';

import { Command } from 'commander';
import { ParsingStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ExportOptions = {
  limit: string;
  output?: string;
  from?: string;
  to?: string;
};

function defaultOutputPath() {
  const date = new Date().toISOString().slice(0, 10);
  return `exports/raw_posts_${date}.jsonl`;
}

async function main() {
  const program = new Command()
    .option('--limit <number>', 'max rows to export', '100')
    .option('--output <path>', 'JSONL output path')
    .option('--from <date>', 'taken_at lower bound, ISO date')
    .option('--to <date>', 'taken_at upper bound, ISO date');

  program.parse(process.argv);
  const options = program.opts<ExportOptions>();
  const limit = Number.parseInt(options.limit, 10);
  const outputPath = resolve(process.cwd(), options.output ?? defaultOutputPath());

  mkdirSync(dirname(outputPath), { recursive: true });

  const rawPosts = await prisma.rawPost.findMany({
    where: {
      isCandidate: true,
      parsingStatus: ParsingStatus.PENDING,
      groupBuy: null,
      takenAt: {
        gte: options.from ? new Date(options.from) : undefined,
        lte: options.to ? new Date(options.to) : undefined,
      },
    },
    include: { influencer: true },
    orderBy: { collectedAt: 'asc' },
    take: limit,
  });

  const stream = createWriteStream(outputPath, { encoding: 'utf8' });

  for (const rawPost of rawPosts) {
    stream.write(
      `${JSON.stringify({
        raw_post_id: rawPost.id,
        instagram_post_id: rawPost.instagramPostId,
        influencer_username: rawPost.influencer.instagramUsername,
        caption: rawPost.caption,
        post_url: rawPost.postUrl,
        image_url: rawPost.imageUrl,
        taken_at: rawPost.takenAt.toISOString(),
      })}\n`,
    );
  }

  stream.end();
  await finished(stream);

  if (rawPosts.length > 0) {
    await prisma.rawPost.updateMany({
      where: { id: { in: rawPosts.map((rawPost) => rawPost.id) } },
      data: {
        parsingStatus: ParsingStatus.EXPORTED,
        exportedAt: new Date(),
      },
    });
  }

  console.log(
    JSON.stringify({
      outputPath,
      exportedCount: rawPosts.length,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
