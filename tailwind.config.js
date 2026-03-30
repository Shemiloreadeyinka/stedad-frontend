/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          50:  '#f5f5f0',
          100: '#e8e8e0',
          200: '#c8c8b8',
          300: '#a0a090',
          400: '#706e60',
          500: '#4a4840',
          600: '#2e2c26',
          700: '#1c1a16',
          800: '#111008',
          900: '#0a0904',
          950: '#050403',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        receipt: {
          gold: '#D4A853',
          warm: '#E8C97A',
          dim:  '#8B7355',
        },
        status: {
          paid:   '#22c55e',
          unpaid: '#f59e0b',
          void:   '#ef4444',
          low:    '#f97316',
        }
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in':    'slideIn 0.3s ease-out',
        'fade-up':     'fadeUp 0.4s ease-out',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'cart-bounce': 'cartBounce 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,168,83,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(212,168,83,0.15)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cartBounce: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      boxShadow: {
        'gold':    '0 0 20px rgba(212,168,83,0.15)',
        'gold-lg': '0 0 40px rgba(212,168,83,0.2)',
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
        'panel':   '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
