/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0D7377',
                    50: '#E6F5F5',
                    100: '#CCE9EA',
                    200: '#99D3D5',
                    300: '#66BDC0',
                    400: '#33A7AB',
                    500: '#0D7377',
                    600: '#0A5C5F',
                    700: '#084547',
                    800: '#052E30',
                    900: '#031718',
                },
                accent: {
                    DEFAULT: '#E8645A',
                    50: '#FEF0EF',
                    100: '#FDE1DF',
                    200: '#FBC3BF',
                    300: '#F9A49F',
                    400: '#F0847C',
                    500: '#E8645A',
                    600: '#D4524A',
                    700: '#B83E36',
                    800: '#8C2F29',
                    900: '#60201C',
                },
                medical: {
                    green: '#059669',
                    red: '#DC2626',
                    amber: '#D97706',
                    blue: '#2563EB',
                },
                surface: '#FFFFFF',
                muted: '#F3F4F6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
                'card-hover': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
                'elevated': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
        },
    },
    plugins: [],
}
