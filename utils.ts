export function money(value: number | string) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)); }
export function timeRemaining(expiresAt: string) {
  const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}
