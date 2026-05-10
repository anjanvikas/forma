import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0C0C0C',
          surface: '#161616',
          elevated: '#1F1F1F',
          input: '#242424',
        },
        accent: {
          DEFAULT: '#C8FF00',
          dim: '#8FB300',
        },
        status: {
          success: '#00C853',
          deviation: '#FF6B35',
          positive: '#00E676',
          warning: '#FFB300',
          danger: '#FF3B30',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8A8A8A',
          tertiary: '#3D3D3D',
          inverse: '#0C0C0C',
        },
        border: {
          subtle: '#242424',
          default: '#2E2E2E',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['40px', { lineHeight: '1.05', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['24px', { lineHeight: '1.15', fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-md': ['15px', { lineHeight: '1.45' }],
        'body-sm': ['13px', { lineHeight: '1.4' }],
        'mono-lg': ['20px', { lineHeight: '1.2' }],
        'mono-md': ['16px', { lineHeight: '1.2' }],
        'mono-sm': ['13px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        card: '12px',
        sheet: '20px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} satisfies Config
