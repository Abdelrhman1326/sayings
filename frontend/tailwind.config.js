/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jsMath: ['jsMath-cmbx10', 'serif'],
        ibm: ['"IBM Plex Sans"', 'sans-serif'],
        kalnia: ['Kalnia', 'serif'],
      },
    },
  },
  plugins: [],
}
