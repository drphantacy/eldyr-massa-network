import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c5c5ff',
          300: '#a0a0ff',
          400: '#7070ff',
          500: '#4040ff',
          600: '#3030cc',
          700: '#252599',
          800: '#1a1a66',
          900: '#0f0f33',
          950: '#08081a',
        },
        mythic: {
          gold: '#ffd700',
          purple: '#9333ea',
          cyan: '#06b6d4',
          flame: '#f97316',
        },
      },
      fontFamily: {
        pixel: ['monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
