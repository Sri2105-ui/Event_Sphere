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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          DEFAULT: '#4edea3',
          container: '#10b981',
          fixed: '#6ffbbe',
          dark: '#006c49',
        },
        'on-primary': '#003824',
        'on-primary-container': '#00422b',
        secondary: {
          DEFAULT: '#c0c1ff',
          container: '#3131c0',
        },
        'on-secondary': '#1000a9',
        tertiary: {
          DEFAULT: '#d0bcff',
          container: '#b090ff',
        },
        surface: {
          DEFAULT: '#0f131d',
          dim: '#0f131d',
          bright: '#353944',
          container: {
            lowest: '#0a0e18',
            low: '#171b26',
            DEFAULT: '#1c1f2a',
            high: '#262a35',
            highest: '#313540',
          }
        },
        'on-surface': '#dfe2f1',
        'on-surface-variant': '#bbcabf',
        outline: {
          DEFAULT: '#86948a',
          variant: '#3c4a42',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        '3d-glow': '0 20px 40px -15px rgba(99, 102, 241, 0.35), 0 0 15px 2px rgba(34, 211, 238, 0.25)',
        '3d-card': '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        '3d-card-light': '0 20px 40px -10px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
