import { parsedGroupBuySchema } from './parsed-group-buy.schema';

describe('parsedGroupBuySchema', () => {
  it('accepts a valid parsed result', () => {
    expect(() =>
      parsedGroupBuySchema.parse({
        raw_post_id: '123',
        is_group_buy: true,
        product_name: '제품명',
        brand_name: '브랜드명',
        start_date: '2026-06-12T00:00:00+09:00',
        end_date: '2026-06-15T23:59:59+09:00',
        purchase_url: 'https://example.com',
        discount_info: '20% 할인',
        summary: '공동구매 진행 중',
        confidence: 0.82,
        parse_error: null,
      }),
    ).not.toThrow();
  });

  it('rejects invalid confidence', () => {
    expect(() =>
      parsedGroupBuySchema.parse({
        raw_post_id: '123',
        is_group_buy: true,
        product_name: null,
        brand_name: null,
        start_date: null,
        end_date: null,
        purchase_url: null,
        discount_info: null,
        summary: null,
        confidence: 1.2,
        parse_error: null,
      }),
    ).toThrow();
  });
});
