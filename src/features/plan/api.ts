import { httpClient } from '@/lib/http/client';
import type { PlanUsage } from '@/types/company';

export async function getMyPlanUsage(): Promise<PlanUsage> {
  const { data } = await httpClient.get<PlanUsage>('/company/plan');
  return data;
}
