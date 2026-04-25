import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
});
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('pg_theme');
        return saved ? saved === 'dark' : true; // default to dark
    });
    useEffect(() => {
        localStorage.setItem('pg_theme', isDark ? 'dark' : 'light');
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.remove('light');
        }
        else {
            document.documentElement.classList.remove('dark');
            document.body.classList.add('light');
        }
    }, [isDark]);
    const toggleTheme = () => setIsDark(prev => !prev);
    return (_jsx(ThemeContext.Provider, { value: { isDark, toggleTheme }, children: children }));
};
export const useTheme = () => useContext(ThemeContext);
