// ─── PharmaGuard Storage Service ────────────────────────────────────────────
// LocalStorage-backed persistence for users and analysis reports.

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    lastLogin: string;
}

export interface StoredVariant {
    gene: string;
    rsId: string;
    diplotype: string;
    phenotype: string;
}

export interface StoredDrugRisk {
    drug: string;
    riskLevel: 'safe' | 'adjust' | 'toxic' | 'ineffective' | 'unknown';
    confidence: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    variants: StoredVariant[];
    clinicalSummary: string;
    mechanism: string;
    cpicGuideline: string;
    recommendation: string;
}

export interface StoredAnalysis {
    id: string;
    userId: string;
    date: string;
    vcfFileName: string;
    drugsAnalyzed: string[];
    results: StoredDrugRisk[];
    analyzedGenes: string[];
    totalVariants: number;
    overallRiskScore: number;
    confidenceScore: number;
    sampleId: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const USERS_KEY = 'pg_users';
const ANALYSES_KEY = 'pg_analyses';
const SESSION_KEY = 'pg_session';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function hashPassword(password: string): string {
    // Simple demo hash — NOT for production
    return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
    return btoa(password) === hash;
}

function getUsers(): User[] {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAnalyses(): StoredAnalysis[] {
    try {
        return JSON.parse(localStorage.getItem(ANALYSES_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveAnalyses(analyses: StoredAnalysis[]): void {
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
}

// ─── Auth Operations ────────────────────────────────────────────────────────

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
    }

    const user: User = {
        id: generateId(),
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
    };

    users.push(user);
    saveUsers(users);
    setSession(user);
    return { success: true, user };
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, error: 'No account found with this email.' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
        return { success: false, error: 'Incorrect password.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setSession(user);
    return { success: true, user };
}

export function setSession(user: User): void {
    const { passwordHash, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
}

export function getSession(): Omit<User, 'passwordHash'> | null {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'email'>>): User | null {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    setSession(users[idx]);
    return users[idx];
}

export function changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };
    if (!verifyPassword(oldPassword, user.passwordHash)) return { success: false, error: 'Current password is incorrect.' };

    user.passwordHash = hashPassword(newPassword);
    saveUsers(users);
    return { success: true };
}

export function deleteAccount(userId: string): void {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);

    const analyses = getAnalyses().filter(a => a.userId !== userId);
    saveAnalyses(analyses);

    clearSession();
}

// ─── Analysis Operations ────────────────────────────────────────────────────

export function saveAnalysis(analysis: Omit<StoredAnalysis, 'id'>): StoredAnalysis {
    const analyses = getAnalyses();
    const saved: StoredAnalysis = { ...analysis, id: generateId() };
    analyses.unshift(saved); // newest first
    saveAnalyses(analyses);
    return saved;
}

export function getUserAnalyses(userId: string): StoredAnalysis[] {
    return getAnalyses().filter(a => a.userId === userId);
}

export function getAnalysisById(id: string): StoredAnalysis | null {
    return getAnalyses().find(a => a.id === id) || null;
}

export function deleteAnalysis(id: string): void {
    const analyses = getAnalyses().filter(a => a.id !== id);
    saveAnalyses(analyses);
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function getUserStats(userId: string) {
    const analyses = getUserAnalyses(userId);
    const totalAnalyses = analyses.length;

    let highRiskDrugs = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    analyses.forEach(a => {
        a.results.forEach(r => {
            if (r.riskLevel === 'toxic') highRiskDrugs++;
            totalConfidence += r.confidence;
            confidenceCount++;
        });
    });

    return {
        totalAnalyses,
        highRiskDrugs,
        avgConfidence: confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0,
    };
}
