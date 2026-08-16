import { httpClient } from '@/lib/http/client';
import type { CreatePlanInput, Plan, UpdatePlanInput } from '@/types/company';

export async function getPlans(): Promise<Plan[]> {
  const { data } = await httpClient.get<Plan[]>('/admin/plans');
  return data;
}

export async function createPlan(input: CreatePlanInput): Promise<Plan> {
  const { data } = await httpClient.post<Plan>('/admin/plans', input);
  return data;
}

export async function updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
  const { data } = await httpClient.patch<Plan>(`/admin/plans/${id}`, input);
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  await httpClient.delete(`/admin/plans/${id}`);
}
