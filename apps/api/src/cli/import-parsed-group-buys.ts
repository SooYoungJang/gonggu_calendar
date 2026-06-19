import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

import { Command } from 'commander';
import { GroupBuyStatus, ParsingStatus, PrismaClient } from '@prisma/client';

import { ParsedGroupBuyLine, parsedGroupBuySchema } from './parsed-group-buy.schema';

const prisma = new PrismaClient();

type ImportOptions = {
  dryRun?: boolean;
};

type ImportStats = {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
};

function statusFor(parsed: ParsedGroupBuyLine) {
  return parsed.confidence >= 0.7
    ? GroupBuyStatus.APPROVED
    : GroupBuyStatus.REVIEW_REQUIRED;
}

async function importLine(parsed: ParsedGroupBuyLine, dryRun: boolean) {
  const rawPost = await prisma.rawPost.findUnique({
    where: { id: parsed.raw_post_id },
    include: { groupBuy: true },
  });

  if (!rawPost) {
    throw new Error(`raw_post_id not found: ${parsed.raw_post_id}`);
  }

  if (parsed.parse_error) {
    if (!dryRun) {
      await prisma.rawPost.update({
        where: { id: rawPost.id },
        data: {
          parsingStatus: ParsingStatus.FAILED,
          parseError: parsed.parse_error,
          parsedAt: new Date(),
        },
      });
    }
    return 'failed';
  }

  if (!parsed.is_group_buy) {
    if (!dryRun) {
      await prisma.rawPost.update({
        where: { id: rawPost.id },
        data: {
          parsingStatus: ParsingStatus.NOT_GROUP_BUY,
          parsedAt: new Date(),
          parseError: null,
        },
      });
    }
    return 'skipped';
  }

  if (rawPost.groupBuy) {
    return 'skipped';
  }

  if (!dryRun) {
    await prisma.$transaction([
      prisma.groupBuy.create({
        data: {
          rawPostId: rawPost.id,
          productName: parsed.product_name,
          brandName: parsed.brand_name,
          startDate: parsed.start_date ? new Date(parsed.start_date) : null,
          endDate: parsed.end_date ? new Date(parsed.end_date) : null,
          purchaseUrl: parsed.purchase_url,
          discountInfo: parsed.discount_info,
          summary: parsed.summary,
          confidence: parsed.confidence,
          status: statusFor(parsed),
        },
      }),
      prisma.rawPost.update({
        where: { id: rawPost.id },
        data: {
          parsingStatus: ParsingStatus.PARSED,
          parsedAt: new Date(),
          parseError: null,
        },
      }),
    ]);
  }

  return 'created';
}

async function main() {
  const program = new Command()
    .argument('<file>', 'parsed JSONL file')
    .option('--dry-run', 'validate without writing');

  program.parse(process.argv);
  const options = program.opts<ImportOptions>();
  const file = resolve(process.cwd(), program.args[0]);
  const stats: ImportStats = {
    total: 0,
    created: 0,
    skipped: 0,
    failed: 0,
    dryRun: Boolean(options.dryRun),
  };

  const reader = createInterface({
    input: createReadStream(file, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const line of reader) {
    if (!line.trim()) {
      continue;
    }

    stats.total += 1;

    try {
      const parsedJson = JSON.parse(line) as unknown;
      const parsed = parsedGroupBuySchema.parse(parsedJson);
      const result = await importLine(parsed, stats.dryRun);
      stats[result] += 1;
    } catch (error) {
      stats.failed += 1;
      console.error(`line ${stats.total}:`, error);
    }
  }

  console.log(JSON.stringify(stats));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
