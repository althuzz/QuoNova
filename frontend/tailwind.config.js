module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        'warm-brown': {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dcc8',
          300: '#d4c4a8',
          400: '#b8a080',
          500: '#9c7c5c',
          600: '#7d6348',
          700: '#5f4a35',
          800: '#4a3828',
          900: '#3a2d20',
        },
      },
    },
  },
  plugins: [],
}