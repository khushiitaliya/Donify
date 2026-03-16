/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'blood-red': '#E63946',
        'blood-dark': '#A4161A',
        'primary-blue': '#457B9D',
        ember: '#F97316',
        charcoal: '#131720',
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 24px 60px rgba(164, 22, 26, 0.25)',
      },
    },
  },
  plugins: [],
};
