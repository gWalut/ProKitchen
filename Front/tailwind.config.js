/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Важно! Включаем поддержку темной темы через класс
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F6FBF8',
                    100: '#E6F5EE',
                    200: '#C2E5D7',
                    300: '#9FD5C0',
                    400: '#7BC5A9',
                    500: '#2F8F6E',
                    600: '#236B52',
                    700: '#1A4F3D',
                    800: '#113328',
                    900: '#091813'
                },
                brand: {
                    50: '#F6FBF8',  // bg-light
                    100: '#E6F5EE',
                    200: '#C2E5D7',
                    300: '#9FD5C0',
                    400: '#7BC5A9',
                    500: '#2F8F6E',  // primary
                    600: '#236B52',  // primary-dark
                    700: '#1A4F3D',
                    800: '#113328',
                    900: '#091813'
                },
                accent: {
                    50: '#F7FCF9',
                    100: '#EFF9F3',
                    200: '#9AE6B4',  // accent
                    300: '#68D391',
                    400: '#48BB78',
                    500: '#38A169',
                    600: '#2F855A',
                    700: '#276749',
                    800: '#22543D',
                    900: '#1C4532'
                },
                dark: {
                    card: '#0B1220',
                    text: '#0F172A'
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', 'sans-serif'],
            },
            maxWidth: {
                mobile: '480px'
            },
            borderRadius: {
                DEFAULT: '12px',
            },
            boxShadow: {
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
                }
            },
            animation: {
                shake: 'shake 0.5s ease-in-out',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}