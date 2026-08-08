export function groupCode(groupId: string): string {
  const clean = groupId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const letters = clean.replace(/[^A-Z]/g, '').slice(0, 2) || 'LS';
  const digits = clean.replace(/[^0-9]/g, '');
  const numericSeed = digits.length ? digits : String(hashString(groupId));
  const suffix = numericSeed.slice(-4).padStart(4, '0');
  return `${letters}-${suffix}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 10000;
}
