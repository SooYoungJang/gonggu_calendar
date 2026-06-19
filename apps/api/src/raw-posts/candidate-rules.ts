export const GROUP_BUY_KEYWORDS = [
  '공구',
  '공동구매',
  '마켓',
  '오픈',
  '구매링크',
  '판매링크',
  '할인',
  '마감',
  '예약판매',
  '선착순',
  '프로모션',
  '특가',
];

export function isGroupBuyCandidate(caption: string): boolean {
  const normalizedCaption = caption.toLocaleLowerCase('ko-KR');

  return GROUP_BUY_KEYWORDS.some((keyword) =>
    normalizedCaption.includes(keyword.toLocaleLowerCase('ko-KR')),
  );
}
