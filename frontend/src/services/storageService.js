// ─── PharmaGuard Storage Service ────────────────────────────────────────────
// LocalStorage-backed persistence for users and analysis reports.
// ─── Helpers ────────────────────────────────────────────────────────────────
const USERS_KEY = 'pg_users';
const ANALYSES_KEY = 'pg_analyses';
const SESSION_KEY = 'pg_session';
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
function hashPassword(password) {
    // Simple demo hash — NOT for production
    return btoa(password);
}
function verifyPassword(password, hash) {
    return btoa(password) === hash;
}
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    }
    catch {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getAnalyses() {
    try {
        return JSON.parse(localStorage.getItem(ANALYSES_KEY) || '[]');
    }
    catch {
        return [];
    }
}
function saveAnalyses(analyses) {
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
}
// ─── Auth Operations ────────────────────────────────────────────────────────
export function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
    }
    const user = {
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
export function loginUser(email, password) {
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
export function setSession(user) {
    const { passwordHash, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
}
export function getSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    }
    catch {
        return null;
    }
}
export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
export function updateUser(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1)
        return null;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    setSession(users[idx]);
    return users[idx];
}
export function changePassword(userId, oldPassword, newPassword) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user)
        return { success: false, error: 'User not found.' };
    if (!verifyPassword(oldPassword, user.passwordHash))
        return { success: false, error: 'Current password is incorrect.' };
    user.passwordHash = hashPassword(newPassword);
    saveUsers(users);
    return { success: true };
}
export function deleteAccount(userId) {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
    const analyses = getAnalyses().filter(a => a.userId !== userId);
    saveAnalyses(analyses);
    clearSession();
}
// ─── Analysis Operations ────────────────────────────────────────────────────
export function saveAnalysis(analysis) {
    const analyses = getAnalyses();
    const saved = { ...analysis, id: generateId() };
    analyses.unshift(saved); // newest first
    saveAnalyses(analyses);
    return saved;
}
export function getUserAnalyses(userId) {
    return getAnalyses().filter(a => a.userId === userId);
}
export function getAnalysisById(id) {
    return getAnalyses().find(a => a.id === id) || null;
}
export function deleteAnalysis(id) {
    const analyses = getAnalyses().filter(a => a.id !== id);
    saveAnalyses(analyses);
}
// ─── Stats ──────────────────────────────────────────────────────────────────
export function getUserStats(userId) {
    const analyses = getUserAnalyses(userId);
    const totalAnalyses = analyses.length;
    let highRiskDrugs = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;
    analyses.forEach(a => {
        a.results.forEach(r => {
            if (r.riskLevel === 'toxic')
                highRiskDrugs++;
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
