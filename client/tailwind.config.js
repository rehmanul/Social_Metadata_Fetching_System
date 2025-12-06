/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a', // Slate 950
                surface: '#1e293b',    // Slate 800
                primary: '#06b6d4',    // Cyan 500
                secondary: '#8b5cf6',  // Violet 500
            },
            fontFamily: {
                heading: ['Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
