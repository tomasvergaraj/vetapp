/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',  // primario
          600: '#0d9488',
          700: '#0f766e',  // secundario
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        ink: {
          DEFAULT: '#0f172a',
          soft: '#334155',
          muted: '#64748b',
          faint: '#94a3b8',
        },
        canvas: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 4px 24px -8px rgb(15 23 42 / 0.08), 0 1px 2px 0 rgb(15 23 42 / 0.04)',
        glow: '0 0 0 1px rgb(20 184 166 / 0.20), 0 8px 32px -8px rgb(20 184 166 / 0.30)',
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'aurora1': 'aurora1 14s ease-in-out infinite alternate',
        'aurora2': 'aurora2 18s ease-in-out infinite alternate',
        'aurora3': 'aurora3 12s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        aurora1: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate(60px, -80px) scale(1.2)', opacity: '0.7' },
          '100%': { transform: 'translate(-40px, 30px) scale(0.9)', opacity: '0.4' },
        },
        aurora2: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translate(-80px, 60px) scale(1.15)', opacity: '0.6' },
          '100%': { transform: 'translate(50px, -40px) scale(0.85)', opacity: '0.35' },
        },
        aurora3: {
          '0%': { transform: 'translate(0, 0) scale(1.1)', opacity: '0.3' },
          '50%': { transform: 'translate(40px, 80px) scale(0.9)', opacity: '0.5' },
          '100%': { transform: 'translate(-60px, -30px) scale(1.2)', opacity: '0.25' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
