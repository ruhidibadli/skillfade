/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm "espresso & parchment" surfaces — a candlelit reading room,
        // not a cold blue-black dashboard. surface-50 is the darkest tone and
        // doubles as the foreground on bright accent fills (logo chip, buttons).
        surface: {
          50: '#14100A',
          100: '#1A150E',
          200: '#221C13',
          300: '#2B2419',
          400: '#3A3122',
          500: '#4C4130',
        },
        // Primary accent — Sage / living green (a fresh, growing skill).
        // Light enough at 400 to carry near-black foreground text (8:1).
        accent: {
          50: '#EAF1E6',
          100: '#D3E2CC',
          200: '#B3CDA8',
          300: '#A6C79A',
          400: '#8FB382',
          500: '#7BA06E',
          600: '#5F8454',
          700: '#496B40',
        },
        // Secondary accent — Clay / terracotta (warmth, the fade toward dusk).
        secondary: {
          50: '#F7E7DE',
          100: '#ECCAB8',
          200: '#DFA98E',
          300: '#D58E6C',
          400: '#C8795A',
          500: '#B0654A',
          600: '#8F4F3A',
        },
        // Freshness scale — earthy, never alarming. Sage → honey → clay,
        // like ink fading in sunlight. Deliberately no alarm-red.
        fresh: {
          glow: '#A7D08C',
          base: '#7DA86A',
          muted: '#5F8454',
        },
        aging: {
          glow: '#E4C173',
          base: '#C9A24E',
          muted: '#A07E33',
        },
        decayed: {
          glow: '#DDA08C',
          base: '#C87B64',
          muted: '#A85C46',
        },
        // Warm parchment text — all AA+ on the surface scale.
        txt: {
          primary: '#F4ECDD',
          secondary: '#C7B9A2',
          muted: '#9C8E76',
        },
        // Hairline rules, like a ledger.
        border: {
          subtle: '#2A2318',
          DEFAULT: '#392F20',
          emphasis: '#4E4231',
        },
      },
      fontFamily: {
        // Hanken Grotesk — warm humanist sans for body & UI (not Inter).
        sans: ['Hanken Grotesk', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Fraunces — a soft, characterful serif for headings & the wordmark.
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        // IBM Plex Mono — instrument-panel numerals, dates, metadata.
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      letterSpacing: {
        label: '0.12em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slideDown 0.3s ease-out both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(18px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // A gentle breath, not a neon strobe.
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.95' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        // Soft, warm, candlelit ambient — replaces the old neon glows.
        'glow-accent': '0 0 24px rgba(143, 179, 130, 0.10)',
        'glow-accent-lg': '0 0 48px rgba(143, 179, 130, 0.16)',
        'glow-secondary': '0 0 24px rgba(200, 121, 90, 0.10)',
        'glow-fresh': '0 0 18px rgba(125, 168, 106, 0.16)',
        'glow-aging': '0 0 18px rgba(201, 162, 78, 0.16)',
        'glow-decayed': '0 0 18px rgba(200, 123, 100, 0.16)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 8px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 10px 34px rgba(0, 0, 0, 0.42)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Warm earthen wash — sage, clay, honey at a whisper.
        'gradient-mesh': 'radial-gradient(at 14% 8%, rgba(143, 179, 130, 0.05) 0px, transparent 46%), radial-gradient(at 86% 6%, rgba(200, 121, 90, 0.045) 0px, transparent 46%), radial-gradient(at 50% 96%, rgba(201, 162, 78, 0.035) 0px, transparent 52%)',
      },
    },
  },
  plugins: [],
}
