import { httpClient } from '@/lib/http/client';
import type { BulkUploadStartResponse, BulkUploadStatus, PaginatedResumes, ResumeSearchFilters, ResumeSummary } from '@/types/resumes';

export async function startBulkUpload(files: File[]): Promise<BulkUploadStartResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const { data } = await httpClient.post<BulkUploadStartResponse>('/resumes/upload/bulk/start', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function getBulkUploadStatus(jobId: string): Promise<BulkUploadStatus> {
  const { data } = await httpClient.get<BulkUploadStatus>(`/resumes/upload/bulk/status/${jobId}`);
  return data;
}

export async function getRecentResumes(): Promise<ResumeSummary[]> {
  const { data } = await httpClient.get<{ resumes: ResumeSummary[] }>('/resumes/recent');
  return data.resumes ?? [];
}

export async function searchResumes(filters: ResumeSearchFilters): Promise<PaginatedResumes> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

  const { data } = await httpClient.get<PaginatedResumes>('/resumes', { params });
  return data;
}

export async function deleteResume(id: string): Promise<void> {
  await httpClient.delete(`/resumes/${id}`);
}

export async function restoreResume(id: string): Promise<void> {
  await httpClient.patch(`/resumes/${id}/restore`);
}

export async function hardDeleteResume(id: string): Promise<void> {
  await httpClient.delete(`/resumes/admin/${id}/permanent`);
}

export async function downloadResumePdf(id: string, fullName: string): Promise<void> {
  const response = await httpClient.get(`/resumes/${id}/pdf`, { responseType: 'blob' });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `curriculo_${fullName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
