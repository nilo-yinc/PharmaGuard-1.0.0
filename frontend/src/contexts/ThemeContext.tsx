import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: true,
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const isDark = true;

    useEffect(() => {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light');
    }, []);

    const toggleTheme = () => { };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
