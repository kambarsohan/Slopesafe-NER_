/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy/dark blue as the main brand color
        navy: {
          DEFAULT: "#0f2c4c",
          light: "#1d4571",
        },
        // Risk colors, used consistently everywhere (badges, map markers, charts)
        risk: {
          high: "#dc2626",   // red
          medium: "#d97706", // amber
          low: "#16a34a",    // green
        },
      },
    },
  },
  plugins: [],
}
