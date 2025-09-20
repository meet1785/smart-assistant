/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./dist/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          purple: '#8B5CF6',
        },
        surface: {
          primary: '#0F172A',
          secondary: '#1E293B',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#64748B',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-out': 'fadeOut 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        'hard': '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
}