const DEFAULT_BACKEND_URL = 'http://localhost:3000';

export type AuditRequest = {
  text: string;
  model?: string;
};

export type AuditEvidence = {
  id: string;
  title: string;
  summary?: string;
  source_url?: string;
  published_at?: string;
  similarity: number;
};

export type AuditResponse = {
  bias_score: number;
  hallucination_score: number;
  source_confidence: number;
  evidence: AuditEvidence[];
  gemini_explanation: string;
};

export async function runAudit(payload: AuditRequest): Promise<AuditResponse> {
  const baseUrl = import.meta.env.VITE_BACKEND_URL ?? DEFAULT_BACKEND_URL;
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = `Audit request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        message = errorBody.error;
      }
    } catch (_error) {
      // Ignore JSON parsing errors and use default message
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AuditResponse;
  return data;
}
