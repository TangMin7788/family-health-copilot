import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api/v1';

console.log('🔧 API Base URL configured as:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for AI processing
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.config?.url, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface Report {
  id: number;
  owner: string;
  visibility: string;
  urgency: string;
  status: string;
  created_at: string;
  report_text: string | null;
  extracted: any | null;
  patient_view: string | null;
  family_view: string | null;
}

export interface ReportCreate {
  owner: string;
  visibility: string;
  report_text: string;
}

export interface ExtractedData {
  study: {
    modality: string;
    body_part: string;
    indication: string;
  };
  sections: {
    findings: string;
    impression: string;
  };
  entities: Array<{
    entity: string;
    anatomy: string;
    certainty: string;
    severity: string;
    temporal: string;
    evidence: string;
  }>;
  critical_flags: Array<{
    flag: string;
    status: string;
    evidence: string;
  }>;
  quality_checks: {
    json_valid: boolean;
    missing_sections: string[];
    notes: string;
  };
}

export interface ModelResponse {
  extracted: ExtractedData | null;
  raw_output?: string;
  processing_time_ms?: number;
}

export interface TriageResponse {
  urgency: string;
  rationale: string;
}

export interface ExplanationResponse {
  explanation: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
  processing_time_ms: number;
}

// Reports API
export const reportsApi = {
  list: (viewer: string) =>
    api.get<Report[]>(`/reports?viewer=${viewer}`),

  get: (id: number) =>
    api.get<Report>(`/reports/${id}`),

  create: (data: ReportCreate) =>
    api.post<Report>('/reports', data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/reports/${id}`),
};

// Models API
export const modelsApi = {
  extract: (report_text: string) =>
    api.post<ModelResponse>('/models/extract', { report_text }),

  triage: (extracted: any) =>
    api.post<TriageResponse>('/models/triage', { extracted }),

  patientView: (extracted: any, triage: any) =>
    api.post<ExplanationResponse>('/models/patient-view', { extracted, triage }),

  familyView: (extracted: any, triage: any) =>
    api.post<ExplanationResponse>('/models/family-view', { extracted, triage }),

  getStatus: () =>
    api.get<{ models_loaded: boolean; model_id: string; status: string }>('/models/status'),

  analyzeImage: (image: File, prompt?: string, maxNewTokens?: number) => {
    const formData = new FormData();
    formData.append('image', image);
    if (prompt) formData.append('prompt', prompt);
    if (maxNewTokens) formData.append('max_new_tokens', maxNewTokens.toString());

    return api.post<ImageAnalysisResponse>('/models/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Health API
export const healthApi = {
  check: () =>
    api.get<{ status: string; models_loaded: boolean }>('/health'),

  modelStatus: () =>
    api.get<{ models_loaded: boolean; model_id: string; status: string }>('/health/models'),

  metrics: () =>
    api.get<{ cpu_percent: number; memory_percent: number; gpu_available: boolean; gpu_count: number }>('/health/metrics'),
};
