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
        'primary-green': '#327455',
        'primary-green-light': 'rgba(50, 116, 85, 0.12)',
        'primary-green-lighter': 'rgba(50, 116, 85, 0.03)',
        'gray-light': '#EAEAEA',
        'gray-medium': 'rgba(234, 234, 234, 0.5)',
        'card-bg': 'rgba(234, 234, 234, 0.2)',
        'dark': '#292424',
      },
      fontFamily: {
        sans: ['var(--font-figtree)', 'var(--font-inter)', 'sans-serif'],
        figtree: ['var(--font-figtree)', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
      },
      boxShadow: {
        'card': '0px 0px 6.7px 0px rgba(0, 0, 0, 0.09)',
      },
    },
  },
  plugins: [],
};

export default config;
