import { createHash } from 'node:crypto';

export function createContentHash(input: {
  instagramPostId: string;
  caption: string;
  postUrl: string;
}): string {
  return createHash('sha256')
    .update(input.instagramPostId)
    .update('\n')
    .update(input.caption)
    .update('\n')
    .update(input.postUrl)
    .digest('hex');
}
