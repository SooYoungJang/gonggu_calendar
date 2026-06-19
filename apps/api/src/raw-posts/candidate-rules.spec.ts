import { isGroupBuyCandidate } from './candidate-rules';

describe('isGroupBuyCandidate', () => {
  it('detects group-buy keywords', () => {
    expect(isGroupBuyCandidate('오늘 밤 공동구매 오픈합니다')).toBe(true);
  });

  it('ignores unrelated captions', () => {
    expect(isGroupBuyCandidate('주말 산책 사진 기록')).toBe(false);
  });
});
