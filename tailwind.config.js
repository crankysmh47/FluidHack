/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a1a',
        panel: 'rgba(10, 10, 25, 0.6)',
        dark: {
          900: '#020205',
          800: '#0a0a1a',
          700: '#111122',
        },
        teal: {
          DEFAULT: '#00ffcc',
          500: '#00ffcc',
          400: '#33ffdd',
        },
        cyan: {
          DEFAULT: '#00ccff',
          500: '#00ccff',
          400: '#33ddff',
        },
        purple: {
          DEFAULT: '#b026ff',
          500: '#b026ff',
          400: '#c050ff',
        },
        neon: {
          green: '#00ffcc',
          cyan: '#00ccff',
          purple: '#b026ff',
          yellow: '#ffcc00',
          red: '#ff3366',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 2s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        shine: {
          '100%': { left: '200%' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}
