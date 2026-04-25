
// ─── PharmaGuard Analysis API Service ─────────────────────────────────────────
// Requests to /api/v1 are proxied to Express backend (port 3000)

const resolveApiBase = () => {
    const configured = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    if (configured) return configured;
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return 'https://pharmaguard-node.vercel.app';
    }
    return '';
};

const API_BASE = resolveApiBase();
const BASE_URL = API_BASE ? `${API_BASE}/api/v1` : '/api/v1';

const parseResponseBody = async (response: Response) => {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

const buildAuthHeaders = (extra: Record<string, string> = {}) => {
    const storedToken = localStorage.getItem('pg_jwt');
    const headers: Record<string, string> = { ...extra };
    if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
    return headers;
};

export interface AnalysisResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

const normalizeRiskLevel = (label?: string): 'safe' | 'adjust' | 'toxic' | 'ineffective' | 'unknown' => {
    const value = (label || '').toLowerCase();
    if (value === 'safe' || value === 'low') return 'safe';
    if (value === 'adjust' || value === 'moderate') return 'adjust';
    if (value === 'toxic' || value === 'high' || value === 'very_high' || value === 'very high') return 'toxic';
    if (value === 'ineffective') return 'ineffective';
    return 'unknown';
};

const normalizeSeverity = (severity?: string): 'low' | 'moderate' | 'high' | 'critical' => {
    const value = (severity || '').toLowerCase();
    if (value === 'mild' || value === 'low') return 'low';
    if (value === 'moderate') return 'moderate';
    if (value === 'severe' || value === 'high') return 'high';
    if (value === 'critical') return 'critical';
    return 'low';
};

const normalizeConfidence = (value?: number): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0;
    if (value <= 1) return Math.round(value * 100);
    return Math.max(0, Math.min(100, Math.round(value)));
};

const mapRecordToAnalysis = (record: any) => {
    const mappedResults = (record.results || []).map((r: any) => {
        const explanation =
            typeof r.llm_generated_explanation === 'string'
                ? { summary: r.llm_generated_explanation, mechanism: r.llm_generated_explanation }
                : (r.llm_generated_explanation || {});

        return {
            drug: r.drug,
            riskLevel: normalizeRiskLevel(r.risk_assessment?.risk_label),
            confidence: normalizeConfidence(r.risk_assessment?.confidence_score),
            severity: normalizeSeverity(r.risk_assessment?.severity),
            variants: (r.pharmacogenomic_profile?.detected_variants || []).map((v: any) => ({
                gene: r.pharmacogenomic_profile?.primary_gene || '',
                rsId: v.rsid || '',
                diplotype: r.pharmacogenomic_profile?.diplotype || '',
                phenotype: r.pharmacogenomic_profile?.phenotype || ''
            })),
            clinicalSummary: explanation.summary || '',
            mechanism: explanation.mechanism || '',
            cpicGuideline: r.clinical_recommendation?.details || '',
            recommendation: r.clinical_recommendation?.action || ''
        };
    });

    const confidenceScore =
        mappedResults.length > 0
            ? Math.round(mappedResults.reduce((acc: number, item: any) => acc + item.confidence, 0) / mappedResults.length)
            : 0;

    const overallRiskScore = mappedResults.reduce((score: number, item: any) => {
        if (item.riskLevel === 'toxic') return score + 30;
        if (item.riskLevel === 'adjust') return score + 20;
        if (item.riskLevel === 'ineffective') return score + 15;
        return score + 5;
    }, 0);

    return {
        id: record._id,
        userId: record.patientId,
        date: record.uploadTimestamp,
        vcfFileName: record.fileName,
        drugsAnalyzed: mappedResults.map((r: any) => r.drug),
        results: mappedResults,
        analyzedGenes: [...new Set(mappedResults.flatMap((r: any) => r.variants.map((v: any) => v.gene)).filter(Boolean))],
        totalVariants: mappedResults.reduce((sum: number, r: any) => sum + r.variants.length, 0),
        overallRiskScore,
        confidenceScore,
        sampleId: record.patientId
    };
};

export const analysisApi = {
    /**
     * Upload VCF file to Express backend
     */
    uploadVCF: async (file: File, patientId?: string): Promise<{ success: boolean; recordId?: string; error?: string }> => {
        const generatedPatientId =
            patientId ||
            `patient_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const formData = new FormData();
        formData.append('vcfFile', file);
        formData.append('patientId', generatedPatientId);

        try {
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                credentials: 'include',
                headers: buildAuthHeaders(),
                body: formData,
            });

            const result = await parseResponseBody(response);
            if (!response.ok) {
                const errorMessage =
                    (typeof result.error === 'string' && result.error) ||
                    (typeof result.message === 'string' && result.message) ||
                    (typeof result.error?.message === 'string' && result.error.message) ||
                    'Upload failed';
                return { success: false, error: errorMessage };
            }
            return { success: true, recordId: result.data.recordId };

        } catch (error: any) {
            return { success: false, error: error.message || 'Network error during upload' };
        }
    },

    /**
     * Trigger analysis for a record with selected drugs
     */
    analyze: async (recordId: string, drugs: string[]): Promise<AnalysisResponse> => {
        try {
            const response = await fetch(`${BASE_URL}/analyze`, {
                method: 'POST',
                credentials: 'include',
                headers: buildAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ recordId, drugs }),
            });

            const result = await parseResponseBody(response);
            if (!response.ok) {
                const message =
                    result?.error?.message ||
                    result?.error ||
                    result?.message ||
                    `Analysis failed (${response.status})`;
                return { success: false, error: message };
            }
            return { success: true, data: result.data };

        } catch (error: any) {
            return { success: false, error: error.message || 'Network error during analysis' };
        }
    },

    /**
     * Get analysis results by record ID
     */
    getResults: async (recordId: string): Promise<AnalysisResponse> => {
        try {
            const response = await fetch(`${BASE_URL}/records/id/${recordId}`, {
                method: 'GET',
                credentials: 'include',
                headers: buildAuthHeaders(),
            });
            const result = await parseResponseBody(response);

            if (!response.ok) {
                const message =
                    result?.error?.message ||
                    result?.error ||
                    result?.message ||
                    `Failed to fetch report (${response.status})`;
                return { success: false, error: message };
            }

            const record = result.data;
            if (!record) return { success: false, error: 'Record not found' };
            if (!record.results || record.results.length === 0) {
                return { success: true, data: null, message: 'Analysis pending or no results' };
            }
            return { success: true, data: mapRecordToAnalysis(record) };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * List recent records for dashboard views
     */
    getRecentRecords: async (limit: number = 20): Promise<AnalysisResponse> => {
        try {
            const response = await fetch(`${BASE_URL}/records?limit=${limit}`, {
                method: 'GET',
                credentials: 'include',
                headers: buildAuthHeaders(),
            });
            const result = await parseResponseBody(response);
            if (!response.ok) {
                const message =
                    result?.error?.message ||
                    result?.error ||
                    result?.message ||
                    `Failed to fetch records (${response.status})`;
                return { success: false, error: message };
            }

            const records = (result.data || []).map((record: any) => mapRecordToAnalysis(record));
            return { success: true, data: records };
        } catch (error: any) {
            return { success: false, error: error.message || 'Network error' };
        }
    }
};
