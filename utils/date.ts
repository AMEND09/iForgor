const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number) => value.toString().padStart(2, '0');

export const parseDateValue = (value?: string | null): Date | null => {
  if (!value) return null;
  if (DATE_ONLY_REGEX.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toDateKey = (date: Date): string => {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
};

export const normalizeDateString = (value?: string | null): string | undefined => {
  const parsed = parseDateValue(value);
  if (!parsed) return undefined;
  return toDateKey(parsed);
};

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const differenceInDays = (target: Date, from: Date): number => {
  const targetStart = startOfDay(target).getTime();
  const fromStart = startOfDay(from).getTime();
  const diffMs = targetStart - fromStart;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round(diffMs / MS_PER_DAY);
};

export const isSameDay = (a: Date, b: Date): boolean => toDateKey(a) === toDateKey(b);
