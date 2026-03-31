/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        editor: {
          bg: '#09090f',
          surface: '#10101a',
          panel: '#151522',
          border: '#232338',
          'border-light': '#2f2f4c',
          accent: '#7c3aed',
          'accent-hover': '#9333ea',
          'accent-muted': '#5b21b6',
          secondary: '#ec4899',
          text: '#f8fafc',
          'text-muted': '#94a3b8',
          'text-dim': '#475569',
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fb7185 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.05) 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
        'mesh-pattern': 'radial-gradient(at 40% 20%, hsla(280,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 24px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 45px rgba(236, 72, 153, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
};
