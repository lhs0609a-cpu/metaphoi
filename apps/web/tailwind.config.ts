import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        'mono-stat': ['var(--font-mono-stat)', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Ability category colors
        'cat-mental': 'hsl(var(--cat-mental))',
        'cat-social': 'hsl(var(--cat-social))',
        'cat-work': 'hsl(var(--cat-work))',
        'cat-physical': 'hsl(var(--cat-physical))',
        'cat-potential': 'hsl(var(--cat-potential))',
        // Rank colors
        'rank-s': 'hsl(var(--rank-s))',
        'rank-a': 'hsl(var(--rank-a))',
        'rank-b': 'hsl(var(--rank-b))',
        'rank-c': 'hsl(var(--rank-c))',
        'rank-d': 'hsl(var(--rank-d))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rank-reveal': {
          '0%': { opacity: '0', transform: 'scale(0.3) rotateY(90deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotateY(-10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateY(0deg)' },
        },
        'radar-draw': {
          '0%': { strokeDashoffset: 'var(--radar-perimeter)' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'xp-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
          '50%': { boxShadow: '0 0 8px 2px hsl(var(--primary) / 0.3)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'bar-fill': 'bar-fill 1s cubic-bezier(0.16,1,0.3,1) forwards',
        'count-up': 'count-up 0.5s ease-out forwards',
        'rank-reveal': 'rank-reveal 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'radar-draw': 'radar-draw 1.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'xp-pulse': 'xp-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
