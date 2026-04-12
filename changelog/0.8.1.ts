import { Category, ChangelogEntry } from './types';

export const _081: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Fixed mokuro parser to correctly handle SPA navigation and page turns.',
    category: Category.Parser,
    issue: 398,
  },
  {
    type: 'add',
    description: 'Added example sentence parsing for Bunpro and JPDB.',
    category: Category.Parser,
    issue: 401,
  },
  {
    type: 'chore',
    description: 'Updated all dependencies to latest versions.',
    category: Category.Platform,
    issue: 'N/A',
  },
];
