/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botequim: {
          red: '#FF3401',
          yellow: '#FFCA1B',
          teal: '#0A9396',
          green: '#588A48',
          paper: '#fdf6e3',
        }
      },
      fontFamily: {
        kalam: ['Kalam', 'cursive'],
        radio: ['Radio Canada', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
