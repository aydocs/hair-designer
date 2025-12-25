/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-black': '#000000',
                'brand-white': '#ffffff',
                'brand-gray-50': '#f9fafb',
                'brand-gray-100': '#f3f4f6',
                'brand-gray-200': '#e5e7eb',
                'brand-gray-300': '#d1d5db',
                'brand-gray-400': '#9ca3af',
                'brand-gray-500': '#6b7280',
                'brand-gray-600': '#4b5563',
                'brand-gray-700': '#374151',
                'brand-gray-800': '#1f2937',
                'brand-gray-900': '#111827',
            },
        },
        fontFamily: {
            'sans': ['Outfit', 'sans-serif'],
            'serif': ['"Playfair Display"', 'serif'],
        },
        backgroundImage: {
            'hero-pattern': "linear-gradient(to right bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }
    },
    plugins: [],
}
