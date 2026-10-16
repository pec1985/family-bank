export const memberAvatars = ['🦊', '🐼', '🐰', '🐻', '🐱', '🦁', '🦄', '🐨'];

export const memberSlug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
