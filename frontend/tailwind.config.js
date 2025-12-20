/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Match the names in your AppColors object
        background: "#020617",
        surface: "#0f172a",
        brand: "#2563eb",
        text: "#ffffff",
        subtext: "#94a3b8",
        border: "#1e293b",
      },
    },
  },
  plugins: [],
};
