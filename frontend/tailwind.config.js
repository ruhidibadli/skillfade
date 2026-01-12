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
        // Dark surface colors
        surface: {
          50: '#0a0a0f',
          100: '#0f0f14',
          200: '#16161d',
          300: '#1c1c26',
          400: '#24242f',
          500: '#2d2d3a',
        },
        // Primary accent - Cyan/Teal
        accent: {
          50: '#e0fffe',
          100: '#b3fffc',
          200: '#66fff9',
          300: '#33fff5',
          400: '#00fff0',
          500: '#00d4c8',
          600: '#00a89f',
          700: '#007d77',
        },
        // Secondary accent - Violet/Purple
        secondary: {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
        },
        // Freshness indicators
        fresh: {
          glow: '#00ffa3',
          base: '#10b981',
          muted: '#059669',
        },
        aging: {
          glow: '#fbbf24',
          base: '#f59e0b',
          muted: '#d97706',
        },
        decayed: {
          glow: '#f472b6',
          base: '#ec4899',
          muted: '#db2777',
        },
        // Text colors
        txt: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        // Border colors
        border: {
          subtle: '#27272a',
          DEFAULT: '#3f3f46',
          emphasis: '#52525b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0, 255, 240, 0.15)',
        'glow-accent-lg': '0 0 40px rgba(0, 255, 240, 0.25)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.15)',
        'glow-fresh': '0 0 20px rgba(0, 255, 163, 0.2)',
        'glow-aging': '0 0 20px rgba(251, 191, 36, 0.2)',
        'glow-decayed': '0 0 20px rgba(244, 114, 182, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(0, 255, 240, 0.03) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.03) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 255, 240, 0.02) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
