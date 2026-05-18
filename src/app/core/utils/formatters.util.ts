export function formatPrice(value: number | null | undefined, currency = 'EUR', locale = 'fr-FR'): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatDate(value: string | Date | null | undefined, locale = 'fr-FR'): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined, locale = 'fr-FR'): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export function maskCardNumber(numberStr: string | null | undefined): string {
  const clean = String(numberStr || '').replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  return `•••• •••• •••• ${clean.slice(-4)}`;
}
