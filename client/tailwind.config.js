/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        surface:  { DEFAULT: '#1e1e2e', light: '#2a2a3e', card: '#16162a' },
        accent:   { purple: '#a855f7', blue: '#3b82f6', teal: '#14b8a6', pink: '#ec4899' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        glow:  { from: { boxShadow: '0 0 10px #6366f1' }, to: { boxShadow: '0 0 30px #6366f1, 0 0 60px #6366f1' } }
      }
    }
  },
  plugins: []
};

