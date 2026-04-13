/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05050f',
        panel: 'rgba(10, 10, 25, 0.8)',
        dark: {
          900: '#050505',
          800: '#111111',
          700: '#1a1a1a',
        },
        accent: {
          green: '#00ff88',
          cyan: '#00ccff',
          purple: '#aa00ff',
          red: '#ff3366',
          yellow: '#ffcc00'
        },
        neon: {
          green: '#00ffcc',
          cyan: '#00ccff',
          purple: '#b026ff',
          yellow: '#ffcc00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 1.5s infinite',
      },
      keyframes: {
        shine: {
          '100%': { left: '200%' },
        }
      }
    },
  },
  plugins: [],
}
