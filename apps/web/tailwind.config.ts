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
        // 표면 단계 — globals.css의 --sunk / --raised
        sunk: 'hsl(var(--sunk))',
        raised: 'hsl(var(--raised))',
        'border-strong': 'hsl(var(--border-strong))',
        // 의미 색 — 상태
        ok: {
          DEFAULT: 'hsl(var(--ok))',
          soft: 'hsl(var(--ok-soft))',
        },
        warn: {
          DEFAULT: 'hsl(var(--warn))',
          soft: 'hsl(var(--warn-soft))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          soft: 'hsl(var(--danger-soft))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          soft: 'hsl(var(--info-soft))',
        },
        // 원색 스케일
        signal: {
          50: 'hsl(var(--signal-50))',
          100: 'hsl(var(--signal-100))',
          200: 'hsl(var(--signal-200))',
          300: 'hsl(var(--signal-300))',
          400: 'hsl(var(--signal-400))',
          500: 'hsl(var(--signal-500))',
          600: 'hsl(var(--signal-600))',
          700: 'hsl(var(--signal-700))',
          800: 'hsl(var(--signal-800))',
          900: 'hsl(var(--signal-900))',
        },
        ember: {
          300: 'hsl(var(--ember-300))',
          400: 'hsl(var(--ember-400))',
          500: 'hsl(var(--ember-500))',
          600: 'hsl(var(--ember-600))',
        },
        ink: {
          0: 'hsl(var(--ink-0))',
          50: 'hsl(var(--ink-50))',
          100: 'hsl(var(--ink-100))',
          200: 'hsl(var(--ink-200))',
          300: 'hsl(var(--ink-300))',
          400: 'hsl(var(--ink-400))',
          500: 'hsl(var(--ink-500))',
          600: 'hsl(var(--ink-600))',
          700: 'hsl(var(--ink-700))',
          800: 'hsl(var(--ink-800))',
          900: 'hsl(var(--ink-900))',
          950: 'hsl(var(--ink-950))',
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
        // 모드가 바꾸는 곡률 — play는 더 둥글고 ops는 각지다
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)',
      },

      // 타이포 스케일 — 1.22 비율. globals.css의 --fs-* 와 1:1
      fontSize: {
        micro: ['var(--fs-micro)', { lineHeight: '1.45' }],
        tiny: ['var(--fs-tiny)', { lineHeight: '1.5' }],
        small: ['var(--fs-small)', { lineHeight: '1.55' }],
        body: ['var(--fs-body)', { lineHeight: '1.65' }],
        lead: ['var(--fs-lead)', { lineHeight: '1.6' }],
        h4: ['var(--fs-h4)', { lineHeight: '1.35', letterSpacing: '-0.014em' }],
        h3: ['var(--fs-h3)', { lineHeight: '1.3', letterSpacing: '-0.017em' }],
        h2: ['var(--fs-h2)', { lineHeight: '1.25', letterSpacing: '-0.019em' }],
        h1: ['var(--fs-h1)', { lineHeight: '1.18', letterSpacing: '-0.022em' }],
        display: ['var(--fs-display)', { lineHeight: '1.06', letterSpacing: '-0.028em' }],
      },

      // 밀도 — 모드가 바꾸는 단일 손잡이
      spacing: {
        'pad-i': 'var(--pad-inline)',
        'pad-b': 'var(--pad-block)',
        row: 'var(--row-h)',
      },

      // 고도 — e1/e2/e3. 모드에 따라 자동으로 바뀐다
      boxShadow: {
        e1: 'var(--shadow-1)',
        e2: 'var(--shadow-2)',
        e3: 'var(--shadow-3)',
        glow: 'var(--glow)',
      },

      transitionTimingFunction: {
        std: 'var(--ease)',
        'out-back': 'var(--ease-out-back)',
      },

      transitionDuration: {
        fast: 'var(--dur-fast)',
        std: 'var(--dur)',
        slow: 'var(--dur-slow)',
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
