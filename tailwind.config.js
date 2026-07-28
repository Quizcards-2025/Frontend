/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,svg}", // Include only files in the src/ui directory
  ],
  corePlugins: {
    preflight: false, // Disable default CSS
  },
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
