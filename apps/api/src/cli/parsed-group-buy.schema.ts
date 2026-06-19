import { z } from 'zod';

const nullableIsoDate = z
  .string()
  .datetime({ offset: true })
  .nullable();

export const parsedGroupBuySchema = z.object({
  raw_post_id: z.string().min(1),
  is_group_buy: z.boolean(),
  product_name: z.string().nullable(),
  brand_name: z.string().nullable(),
  start_date: nullableIsoDate,
  end_date: nullableIsoDate,
  purchase_url: z.string().url().nullable(),
  discount_info: z.string().nullable(),
  summary: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  parse_error: z.string().nullable(),
});

export type ParsedGroupBuyLine = z.infer<typeof parsedGroupBuySchema>;
