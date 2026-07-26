/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F7F9',
        surface: '#FFFFFF',
        ink: '#171A21',
        muted: '#6B7280',
        line: '#E4E7EC',
        brand: {
          50: '#ECFBF8',
          100: '#D1F5EE',
          300: '#5FCBBB',
          500: '#0F766E',
          600: '#0B5D57',
          700: '#08453F',
        },
        amber: {
          100: '#FEF3C7',
          500: '#D97706',
        },
        rose: {
          100: '#FEE2E2',
          500: '#DC2626',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 26, 33, 0.04), 0 8px 24px -12px rgba(23, 26, 33, 0.12)',
      },
    },
  },
  plugins: [],
};
