/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jsMath: ['jsMath-cmbx10', 'serif'],
        ibm: ['"IBM Plex Sans"', 'sans-serif'],
        kalnia: ['Kalnia', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'cursive'],
      },
      colors: {
        uiPrimary: '#D2BCFF',
        bgColor: '#141414',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), // dark scrollbar
  ],
}