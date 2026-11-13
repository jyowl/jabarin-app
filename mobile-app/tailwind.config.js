/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { brand: {
        green: '#1B4332', olive: '#40916C', mint: '#74C69D', beige: '#D8F3DC', 
      } },
      fontFamily: { inter: ['Inter'] },
    },
  },
  plugins: [],
}