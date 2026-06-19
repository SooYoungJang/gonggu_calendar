import { createHash } from 'node:crypto';

export interface SubmissionHashInput {
  productName: string;
  startDate?: string | Date;
  purchaseUrl?: string;
}

export function createSubmissionHash(input: SubmissionHashInput): string {
  // 정규화: 소문자, 공백 제거, 날짜 포맷 통일
  const normalized = {
    productName: input.productName.toLowerCase().replace(/\s+/g, ''),
    startDate: input.startDate
      ? new Date(input.startDate).toISOString().split('T')[0]
      : '',
    purchaseUrl:
      input.purchaseUrl?.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') ||
      '',
  };

  const payload = `${normalized.productName}|${normalized.startDate}|${normalized.purchaseUrl}`;
  return createHash('sha256').update(payload).digest('hex');
}