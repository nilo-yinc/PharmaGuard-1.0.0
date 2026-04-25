// ─── PharmaGuard Auth API Service ─────────────────────────────────────────
// Typed fetch wrapper for the Express auth backend at /api/v1/users/*
// All requests include credentials (JWT cookie) automatically.

const resolveApiBase = () => {
    const configured = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    if (configured) return configured;
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return 'https://pharmaguard-node.vercel.app';
    }
    return '';
};

const API_BASE = resolveApiBase();
const BASE = API_BASE ? `${API_BASE}/api/v1/users` : '/api/v1/users';

const parseResponseBody = async (res: Response) => {
    const text = await res.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

async function request<T>(
    method: string,
    path: string,
    body?: object
): Promise<{ ok: boolean; data?: T; error?: string }> {
    try {
        // Use stored JWT as Authorization header fallback (covers Google OAuth flow)
        const storedToken = localStorage.getItem('pg_jwt');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

        const res = await fetch(`${BASE}${path}`, {
            method,
            credentials: 'include',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const json = await parseResponseBody(res);
        if (!res.ok) {
            const message = json?.message || json?.error?.message || `Request failed (${res.status})`;
            if (res.status === 405) {
                return { ok: false, error: 'API route not found. Check VITE_API_BASE_URL for frontend deployment.' };
            }
            return { ok: false, error: message };
        }
        return { ok: true, data: json };
    } catch (e: any) {
        return { ok: false, error: e.message || 'Network error' };
    }
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ApiUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePic?: string;
    isVerified?: boolean;
    role?: string;
    createdAt?: string;
    lastLogin?: string;
}

interface AuthResponse {
    status: boolean;
    message: string;
    token?: string;
    user?: ApiUser;
}

interface ProfileResponse {
    status: boolean;
    user?: ApiUser;
}

interface GenericResponse {
    status: boolean;
    message: string;
    devOtp?: string;
}

interface VerifyOtpResponse extends GenericResponse {
    resetToken?: string;
}

// ─── Auth Operations ────────────────────────────────────────────────────────

export async function apiRegister(name: string, email: string, password: string) {
    return request<AuthResponse>('POST', '/register', { name, email, password });
}

export async function apiLogin(email: string, password: string) {
    const result = await request<AuthResponse>('POST', '/login', { email, password });
    // Store JWT in localStorage as fallback (for cross-origin)
    if (result.ok && result.data?.token) {
        localStorage.setItem('pg_jwt', result.data.token);
    }
    return result;
}

export async function apiLogout() {
    localStorage.removeItem('pg_jwt');
    return request<{ status: boolean; message: string }>('POST', '/logout');
}

export async function apiGetProfile() {
    return request<ProfileResponse>('GET', '/get-profile');
}

export async function apiUpdateProfile(updates: { name?: string; phone?: string; profilePic?: string }) {
    return request<ProfileResponse>('PUT', '/update-profile', updates);
}

export async function apiResendVerificationEmail() {
    return request<GenericResponse>('POST', '/resend-verification');
}

export async function apiForgotPassword(email: string) {
    return request<GenericResponse>('POST', '/forgot-password', { email });
}

export async function apiVerifyResetOtp(email: string, otp: string) {
    return request<VerifyOtpResponse>('POST', '/verify-reset-otp', { email, otp });
}

export async function apiResetPassword(token: string, password: string) {
    return request<GenericResponse>('POST', '/reset-password', { token, password });
}
