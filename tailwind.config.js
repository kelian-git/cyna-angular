/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f2fc',
          100: '#e8e4f9',
          200: '#cdc4f0',
          300: '#ad9fe6',
          400: '#8f7ad9',
          500: '#7c3aed',
          600: '#5b3fc0',
          700: '#4a33a3',
          800: '#3d2b8e',
          900: '#2f2170',
          950: '#1f1547',
        },
        accent: '#7c3aed',
        danger: '#ef4444',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
