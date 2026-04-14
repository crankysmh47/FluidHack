/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050A08',
        panel: 'rgba(10, 20, 16, 0.6)',
        dark: {
          900: '#020504',
          800: '#050a08',
          700: '#0a1410',
        },
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        "neon-red": '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 2s infinite',
        'scanline': 'scanline 8s linear infinite',
        'border-beam': 'border-beam 4s infinite linear',
      },
      keyframes: {
        shine: {
          '100%': { left: '200%' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        }
      }
    },
  },
  plugins: [],
}
