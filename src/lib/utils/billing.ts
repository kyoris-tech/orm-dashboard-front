const NEAR_DUE_THRESHOLD_DAYS = 5;

export interface BillingStatus {
  daysUntil: number | null;
  isNear: boolean;
  label: string;
  tone: 'neutral' | 'success' | 'danger';
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function nextBillingDate(billingDay: number, referenceDate: Date): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const today = referenceDate.getDate();

  const clampedThisMonth = Math.min(billingDay, lastDayOfMonth(year, month));

  if (clampedThisMonth >= today) {
    return new Date(year, month, clampedThisMonth);
  }

  const nextMonthClamped = Math.min(billingDay, lastDayOfMonth(year, month + 1));
  return new Date(year, month + 1, nextMonthClamped);
}

export function getBillingStatus(billingDay: number | null, referenceDate: Date = new Date()): BillingStatus {
  if (billingDay === null) {
    return { daysUntil: null, isNear: false, label: 'Não definido', tone: 'neutral' };
  }

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const nextDate = nextBillingDate(billingDay, today);

  const daysUntil = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isNear = daysUntil <= NEAR_DUE_THRESHOLD_DAYS;

  let label: string;

  if (daysUntil === 0) {
    label = 'Vence hoje';
  } else if (daysUntil === 1) {
    label = 'Vence amanhã';
  } else if (isNear) {
    label = `Vence em ${daysUntil} dias`;
  } else {
    label = `Dia ${billingDay}`;
  }

  return { daysUntil, isNear, label, tone: isNear ? 'danger' : 'success' };
}
