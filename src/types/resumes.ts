export interface ResumeExperience {
  role?: string;
  company?: string;
  period?: string;
  description?: string[];
}

export interface ResumeEducation {
  course?: string;
  status?: string;
  institution?: string;
  period?: string;
}

export interface ResumeLocation {
  city?: string;
  state?: string;
}

export interface ResumeAiData {
  fullName?: string;
  email?: string;
  phones?: string[];
  summary?: string;
  skills?: string[];
  qualifications?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  language?: (string | { name: string })[];
  courses?: string[];
  location?: ResumeLocation;
}

export interface ResumeSummary {
  id: string;
  fullName: string;
  fileName: string;
  createdAt: string;
  dataJson?: ResumeAiData | null;
}

export interface BulkUploadStartResponse {
  jobId: string;
  total: number;
}

export interface BulkUploadStatus {
  total: number;
  processed: number;
  processing: number;
  errors: number;
  done: boolean;
}

export interface ResumeListItem extends ResumeSummary {
  compatibility: number;
  confidence?: number | null;
  processingMs?: number | null;
}

export interface ResumePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResumes {
  data: ResumeListItem[];
  pagination: ResumePagination;
}

export interface ResumeSearchFilters {
  query?: string;
  skills?: string;
  title?: string;
  city?: string;
  degree?: string;
  languages?: string;
  confidenceMin?: string;
  page: number;
  pageSize: number;
}
