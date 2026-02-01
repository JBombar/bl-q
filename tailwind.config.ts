import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        'primary-green': '#327455',
        'primary-green-light': 'rgba(50, 116, 85, 0.12)',
        'cta-orange': '#F9A201',
        'cta-orange-light': '#FFFAEF',

        // Backgrounds
        'bg-card-gray': '#F6F6F6',
        'bg-card-mint': '#E6EEEB',
        'bg-badge-pink': '#FFD2D2',
        'bg-badge-mint': '#D2EBE0',
        'bg-yellow': '#FFD021',
        'bg-light-gray': '#F5F5F5',

        // Text
        'text-dark': '#292424',
        'text-gray': '#949BA1',
        'text-gray-medium': '#919191',

        // Borders
        'border-light': '#EBEBEB',
        'border-gray-light': '#E4E4E4',
        'border-gray': '#D9D9D9',
        'border-gray-medium': '#B7B7B7',
        'border-gray-dark': '#D6D6D6',
        'border-green': '#327455',

        // Semantic
        'error-red': '#E60000',
      },
      fontFamily: {
        figtree: ['var(--font-figtree)', 'sans-serif'],
        sans: ['var(--font-figtree)', 'var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
      },
      boxShadow: {
        'cta': '0px 0px 6.7px 0px rgba(0, 0, 0, 0.09)',
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)',
        'gradient-yellow': 'linear-gradient(180deg, rgba(255, 224, 61, 1) 0%, rgba(255, 206, 30, 1) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
